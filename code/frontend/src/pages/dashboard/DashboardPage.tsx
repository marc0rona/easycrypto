import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from '../../api/address.api';
import { AddAddressModal } from '../../components/dashboard/AddAddressModal';
import { EditAddressModal } from '../../components/dashboard/EditAddressModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useFeedback } from '../../hooks/useFeedback';
import {
  ADDRESS_DIRECTIONS,
  ADDRESS_TYPES,
  type AddressDirection,
  type AddressFormValues,
  type AddressRecord,
  type AddressType,
} from '../../types/address';
import { getDisplayAddressLabel, truncateAddress } from '../../utils/detector';
import {
  fetchLocalMarketCoins,
  normalizeCoinSymbol,
  type LocalMarketCoin,
} from '../../utils/marketApi';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const ADDRESSES_PER_PAGE = 10;

function getDirectionBadgeClasses(direction: AddressDirection) {
  return direction === 'SENDING'
    ? 'bg-amber-50 text-amber-700'
    : 'bg-emerald-50 text-emerald-700';
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while loading your dashboard.';
}

function getTimestamp(value?: string) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatRelativeTime(value?: string) {
  const timestamp = getTimestamp(value);

  if (!timestamp) {
    return 'Not available';
  }

  const difference = Date.now() - timestamp;

  if (difference < 60 * 1000) {
    return 'just now';
  }

  if (difference < 60 * 60 * 1000) {
    return `${Math.max(1, Math.floor(difference / (60 * 1000)))}m ago`;
  }

  if (difference < DAY_IN_MILLISECONDS) {
    return `${Math.max(1, Math.floor(difference / (60 * 60 * 1000)))}h ago`;
  }

  return `${Math.max(1, Math.floor(difference / DAY_IN_MILLISECONDS))}d ago`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess } = useFeedback();

  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [addModalError, setAddModalError] = useState('');
  const [coinDataByType, setCoinDataByType] = useState<Partial<Record<AddressType, LocalMarketCoin>>>({});
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);
  const [editModalError, setEditModalError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const [isCoinSelectorOpen, setIsCoinSelectorOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDeleteAddress, setPendingDeleteAddress] = useState<AddressRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<AddressRecord | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | AddressType>('ALL');
  const [selectedDirectionFilter, setSelectedDirectionFilter] = useState<'ALL' | AddressDirection>('ALL');
  const coinSelectorRef = useRef<HTMLDivElement | null>(null);

  const isAddModalOpen = searchParams.get('modal') === 'add';

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await getAddresses();
      setAddresses(result);
    } catch (error) {
      console.error('Failed to load dashboard addresses.', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const updateUrlState = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams);

      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }

      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    let isMounted = true;

    const loadCoinData = async () => {
      try {
        const result = await fetchLocalMarketCoins();

        if (!isMounted) {
          return;
        }

        const nextCoinDataByType = result.reduce<Partial<Record<AddressType, LocalMarketCoin>>>(
          (accumulator, coin) => {
            const normalizedSymbol = normalizeCoinSymbol(coin.symbol);

            if (normalizedSymbol) {
              accumulator[normalizedSymbol] = coin;
            }

            return accumulator;
          },
          {},
        );

        setCoinDataByType(nextCoinDataByType);
      } catch (error) {
        console.error('Failed to load market coin data for dashboard.', error);
      }
    };

    void loadCoinData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCoinSelectorOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!coinSelectorRef.current?.contains(event.target as Node)) {
        setIsCoinSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isCoinSelectorOpen]);

  const handleCopyAddress = useCallback(async (address: AddressRecord) => {
    try {
      await navigator.clipboard.writeText(address.address);
      setCopiedAddressId(address.id);
      showSuccess('Address copied to clipboard.');

      window.setTimeout(() => {
        setCopiedAddressId((currentId) => (currentId === address.id ? null : currentId));
      }, 1600);
    } catch (error) {
      console.error('Failed to copy address from dashboard.', error);
    }
  }, [showSuccess]);

  const handleOpenAddModal = useCallback(() => {
    setAddModalError('');
    updateUrlState({ modal: 'add' });
  }, [updateUrlState]);

  const handleCloseAddModal = useCallback(() => {
    setAddModalError('');
    updateUrlState({ modal: null });
  }, [updateUrlState]);

  const handleOpenEditModal = useCallback((address: AddressRecord) => {
    setEditModalError('');
    setSelectedAddress(address);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalError('');
    setSelectedAddress(null);
  }, []);

  const handleUpdateAddress = useCallback(
    async (values: AddressFormValues) => {
      if (!selectedAddress) {
        return;
      }

      setEditModalError('');
      setIsEditSubmitting(true);

      try {
        const updatedAddress = await updateAddress(selectedAddress.id, values);

        setAddresses((previous) =>
          previous.map((address) =>
            address.id === selectedAddress.id ? updatedAddress : address,
          ),
        );

        setSelectedAddress(null);
        showSuccess('Address updated successfully.');
      } catch (error) {
        console.error('Failed to update address from dashboard.', error);
        setEditModalError(
          error instanceof Error && error.message
            ? error.message
            : 'Something went wrong while updating the address.',
        );
      } finally {
        setIsEditSubmitting(false);
      }
    },
    [selectedAddress, showSuccess],
  );

  const handleRequestDeleteAddress = useCallback((address: AddressRecord) => {
    setPendingDeleteAddress(address);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    if (isDeleteSubmitting) {
      return;
    }

    setPendingDeleteAddress(null);
  }, [isDeleteSubmitting]);

  const handleDeleteAddress = useCallback(async () => {
    if (!pendingDeleteAddress) {
      return;
    }

    setIsDeleteSubmitting(true);
    setErrorMessage('');

    try {
      await deleteAddress(pendingDeleteAddress.id);
      setAddresses((previous) =>
        previous.filter((currentAddress) => currentAddress.id !== pendingDeleteAddress.id),
      );

      if (selectedAddress?.id === pendingDeleteAddress.id) {
        setSelectedAddress(null);
      }

      setPendingDeleteAddress(null);
      showSuccess('Address deleted successfully.');
    } catch (error) {
      console.error('Failed to delete address from dashboard.', error);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : 'Something went wrong while deleting the address.',
      );
    } finally {
      setIsDeleteSubmitting(false);
    }
  }, [pendingDeleteAddress, selectedAddress, showSuccess]);

  const handleAddAddress = useCallback(
    async (values: AddressFormValues) => {
      setAddModalError('');
      setIsAddSubmitting(true);

      try {
        const createdAddress = await createAddress(values);
        setAddresses((previous) => [createdAddress, ...previous]);
        updateUrlState({ modal: null });
        showSuccess('Address saved successfully.');
      } catch (error) {
        console.error('Failed to create address from dashboard.', error);
        setAddModalError(
          error instanceof Error && error.message
            ? error.message
            : 'Something went wrong while saving the address.',
        );
      } finally {
        setIsAddSubmitting(false);
      }
    },
    [showSuccess, updateUrlState],
  );

  const sortedAddresses = useMemo(
    () => [...addresses].sort((left, right) => getTimestamp(right.createdAt) - getTimestamp(left.createdAt)),
    [addresses],
  );

  const totalAddresses = addresses.length;
  const uniqueNetworksCount = useMemo(
    () => new Set(addresses.map((address) => address.type)).size,
    [addresses],
  );
  const lastSavedAddress = sortedAddresses[0] ?? null;
  const savedThisMonthCount = useMemo(
    () =>
      sortedAddresses.filter((address) => {
        const timestamp = getTimestamp(address.createdAt);
        return timestamp > 0 && Date.now() - timestamp <= 30 * DAY_IN_MILLISECONDS;
      }).length,
    [sortedAddresses],
  );

  const activeTypeCounts = useMemo(
    () =>
      ADDRESS_TYPES.map((type) => ({
        type,
        count: addresses.filter((address) => address.type === type).length,
      })).filter((entry) => entry.count > 0),
    [addresses],
  );

  const activeDirectionCounts = useMemo(
    () =>
      ADDRESS_DIRECTIONS.map((direction) => ({
        direction,
        count: addresses.filter((address) => address.direction === direction).length,
      })),
    [addresses],
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const searchMatchedAddresses = useMemo(
    () =>
      sortedAddresses.filter((address) => {
        const haystack = [
          address.label ?? '',
          address.address,
          address.type,
          address.direction,
        ]
          .join(' ')
          .toLowerCase();

        return !normalizedSearch || haystack.includes(normalizedSearch);
      }),
    [normalizedSearch, sortedAddresses],
  );

  const coinFilterCounts = useMemo(
    () =>
      ADDRESS_TYPES.map((type) => ({
        type,
        count: searchMatchedAddresses.filter(
          (address) =>
            address.type === type &&
            (selectedDirectionFilter === 'ALL' || address.direction === selectedDirectionFilter),
        ).length,
      })),
    [searchMatchedAddresses, selectedDirectionFilter],
  );

  const directionFilterCounts = useMemo(
    () =>
      ADDRESS_DIRECTIONS.map((direction) => ({
        direction,
        count: searchMatchedAddresses.filter(
          (address) =>
            address.direction === direction &&
            (selectedFilter === 'ALL' || address.type === selectedFilter),
        ).length,
      })),
    [searchMatchedAddresses, selectedFilter],
  );

  const filterOptions = useMemo(() => {
    const options = coinFilterCounts
      .filter((entry) => entry.count > 0 || entry.type === selectedFilter)
      .map((entry) => entry.type);

    return ['ALL', ...options] as const;
  }, [coinFilterCounts, selectedFilter]);

  const filteredAddresses = useMemo(
    () =>
      searchMatchedAddresses.filter((address) => {
        const matchesType = selectedFilter === 'ALL' || address.type === selectedFilter;
        const matchesDirection =
          selectedDirectionFilter === 'ALL' || address.direction === selectedDirectionFilter;

        return matchesType && matchesDirection;
      }),
    [searchMatchedAddresses, selectedDirectionFilter, selectedFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredAddresses.length / ADDRESSES_PER_PAGE));
  const paginatedAddresses = useMemo(() => {
    const startIndex = (currentPage - 1) * ADDRESSES_PER_PAGE;
    return filteredAddresses.slice(startIndex, startIndex + ADDRESSES_PER_PAGE);
  }, [currentPage, filteredAddresses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch, selectedDirectionFilter, selectedFilter]);

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  const paginationSummary = useMemo(() => {
    if (filteredAddresses.length === 0) {
      return 'Showing 0 addresses';
    }

    const startIndex = (currentPage - 1) * ADDRESSES_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ADDRESSES_PER_PAGE, filteredAddresses.length);

    return `Showing ${startIndex}-${endIndex} of ${filteredAddresses.length} addresses`;
  }, [currentPage, filteredAddresses.length]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  const selectedCoinCount = useMemo(
    () =>
      selectedFilter === 'ALL'
        ? searchMatchedAddresses.filter(
            (address) =>
              selectedDirectionFilter === 'ALL' || address.direction === selectedDirectionFilter,
          ).length
        : coinFilterCounts.find((entry) => entry.type === selectedFilter)?.count ?? 0,
    [coinFilterCounts, searchMatchedAddresses, selectedDirectionFilter, selectedFilter],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {isLoading ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm font-medium text-[#595c5e]">Loading dashboard...</p>
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-xl border border-[#b31b25]/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#2c2f31] [font-family:Manrope,sans-serif]">Something went wrong</h2>
          <p className="mt-3 text-sm leading-7 text-[#595c5e]">{errorMessage}</p>
          <button
            className="mt-6 rounded-lg bg-[#0052d0] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            type="button"
            onClick={() => {
              void loadAddresses();
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !errorMessage ? (
        <>
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl bg-white p-6">
              <div className="relative z-10">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#595c5e]">Total Addresses</p>
                <h3 className="font-headline text-2xl font-bold text-[#2c2f31] sm:text-3xl">{totalAddresses}</h3>
                <p className="mt-2 flex items-center gap-1 text-sm font-medium text-[#0052d0]">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +{savedThisMonthCount} this month
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-5 transition-opacity group-hover:opacity-10">
                <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-white p-6">
              <div className="relative z-10">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#595c5e]">Networks Used</p>
                <h3 className="font-headline text-2xl font-bold text-[#2c2f31] sm:text-3xl">{uniqueNetworksCount}</h3>
                <p className="mt-2 text-sm font-medium text-[#595c5e]">Active on Multi-Chain</p>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-5 transition-opacity group-hover:opacity-10">
                <span className="material-symbols-outlined text-8xl">hub</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border-2 border-[#0052d0]/5 bg-white p-6">
              <div className="relative z-10">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#595c5e]">Last Saved</p>
                <h3 className="font-headline text-2xl font-bold text-[#2c2f31] sm:text-3xl">
                  {lastSavedAddress?.createdAt ? formatRelativeTime(lastSavedAddress.createdAt) : 'No data'}
                </h3>
                <p className="mt-2 text-sm font-medium text-[#595c5e]">
                  {lastSavedAddress ? getDisplayAddressLabel(lastSavedAddress.label) : 'Nothing saved yet'}
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-5 transition-opacity group-hover:opacity-10">
                <span className="material-symbols-outlined text-8xl">schedule</span>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
              <h2 className="font-headline text-xl font-bold text-[#2c2f31] sm:text-2xl">Wallet Directory</h2>

              <div className="relative w-full max-w-full xl:w-[560px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[1.5rem] text-[#5b636f] sm:left-6 sm:text-[2rem]">
                  search
                </span>
                <input
                  className="w-full rounded-full border-none bg-[#eef1f3] py-3 pl-14 pr-4 text-base text-[#2c2f31] placeholder:text-[#747779] focus:ring-2 focus:ring-[#0052d0]/20 sm:py-4 sm:pl-20 sm:pr-6 sm:text-[1.05rem]"
                  placeholder="Search labels, addresses, coins, or direction..."
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="flex flex-wrap rounded-full bg-[#eef1f3] p-1">
                <button
                  className={[
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    selectedDirectionFilter === 'ALL'
                      ? 'bg-white text-[#2c2f31] shadow-sm'
                      : 'text-[#595c5e] hover:text-[#2c2f31]',
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setSelectedDirectionFilter('ALL');
                  }}
                >
                  <span>All Views</span>
                  <span className="ml-2 text-xs opacity-70">
                    {
                      searchMatchedAddresses.filter(
                        (address) =>
                          selectedFilter === 'ALL' || address.type === selectedFilter,
                      ).length
                    }
                  </span>
                </button>

                {directionFilterCounts.map((entry) => {
                  const isActive = entry.direction === selectedDirectionFilter;

                  return (
                    <button
                      key={entry.direction}
                      className={[
                        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-white text-[#2c2f31] shadow-sm'
                          : 'text-[#595c5e] hover:text-[#2c2f31]',
                      ].join(' ')}
                      type="button"
                      onClick={() => {
                        setSelectedDirectionFilter(entry.direction);
                      }}
                    >
                      <span>{entry.direction === 'SENDING' ? 'Sending' : 'Receiving'}</span>
                      <span className="ml-2 text-xs opacity-70">{entry.count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-auto" ref={coinSelectorRef}>
                <button
                  className={[
                    'inline-flex w-full items-center justify-between gap-3 rounded-full bg-[#eef1f3] px-4 py-2 text-sm font-medium text-[#2c2f31] transition-colors hover:bg-[#e4e8eb] sm:w-auto',
                    isCoinSelectorOpen ? 'ring-2 ring-[#0052d0]/15' : '',
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setIsCoinSelectorOpen((previous) => !previous);
                  }}
                >
                  <span>{selectedFilter === 'ALL' ? 'All Coins' : selectedFilter}</span>
                  <span className="text-xs text-[#6d7782]">{selectedCoinCount}</span>
                  <span className="material-symbols-outlined text-lg text-[#6d7782]">
                    {isCoinSelectorOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {isCoinSelectorOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-2xl border border-[#d8dde3] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:left-auto sm:right-0 sm:min-w-[220px]">
                    <div className="border-b border-[#eef1f3] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d7782]">
                        Filter by coin
                      </p>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-2">
                      {filterOptions.map((option) => {
                        const isActive = option === selectedFilter;
                        const optionCount =
                          option === 'ALL'
                            ? searchMatchedAddresses.filter(
                                (address) =>
                                  selectedDirectionFilter === 'ALL' ||
                                  address.direction === selectedDirectionFilter,
                              ).length
                            : coinFilterCounts.find((entry) => entry.type === option)?.count ?? 0;

                        return (
                          <button
                            key={option}
                            className={[
                              'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                              isActive
                                ? 'bg-[#eef4ff] text-[#0052d0]'
                                : 'text-[#2c2f31] hover:bg-[#f5f7f9]',
                            ].join(' ')}
                            type="button"
                            onClick={() => {
                              setSelectedFilter(option);
                              setIsCoinSelectorOpen(false);
                            }}
                          >
                            <span className="font-medium">
                              {option === 'ALL' ? 'All Coins' : option}
                            </span>
                            <span className="text-xs text-[#6d7782]">{optionCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white">
            {filteredAddresses.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <h3 className="font-headline text-2xl font-bold text-[#2c2f31]">
                  {totalAddresses === 0 ? 'No addresses saved yet' : 'No addresses match this view'}
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#595c5e]">
                  {totalAddresses === 0
                    ? 'Start by saving your first wallet address to build the directory.'
                    : 'Try a different search or coin filter to bring more addresses into view.'}
                </p>
                <button
                  className="mt-6 rounded-lg bg-[#0052d0] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  type="button"
                  onClick={() => {
                    handleOpenAddModal();
                  }}
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full border-collapse text-left">
                <thead className="bg-[#eef1f3]/60">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#595c5e]">
                      Label
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#595c5e]">
                      Address
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#595c5e]">
                      Coin
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#595c5e]">
                      Direction
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-[#595c5e]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e9eb]">
                  {paginatedAddresses.map((address) => {
                    const coinData = coinDataByType[address.type];

                    return (
                      <tr key={address.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold text-[#2c2f31]">
                            {getDisplayAddressLabel(address.label)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="rounded bg-[#eef1f3] px-2 py-1 font-mono text-xs text-[#595c5e]">
                            {truncateAddress(address.address)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#eef3f8] shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
                              {coinData?.image ? (
                                <img
                                  alt={`${coinData.name} logo`}
                                  className="h-11 w-11 object-cover"
                                  loading="lazy"
                                  src={coinData.image}
                                />
                              ) : (
                                <span className="text-sm font-bold uppercase text-[#2c2f31]">
                                  {address.type}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-[#2c2f31]">
                                {coinData?.name ?? address.type}
                              </p>
                              <p className="mt-1 truncate text-xs font-semibold uppercase tracking-[0.24em] text-[#6d7782]">
                                {coinData?.symbol.toUpperCase() ?? address.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={[
                              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]',
                              getDirectionBadgeClasses(address.direction),
                            ].join(' ')}
                          >
                            <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                            {address.direction === 'SENDING' ? 'Sending' : 'Receiving'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            className={[
                              'mx-2 transition-colors',
                              copiedAddressId === address.id
                                ? 'text-[#0052d0]'
                                : 'text-[#595c5e] hover:text-[#0052d0]',
                            ].join(' ')}
                            title={copiedAddressId === address.id ? 'Address copied' : 'Copy address'}
                            type="button"
                            onClick={() => {
                              void handleCopyAddress(address);
                            }}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {copiedAddressId === address.id ? 'check' : 'content_copy'}
                            </span>
                          </button>
                          <button
                            className="mx-2 text-[#595c5e] transition-colors hover:text-[#0052d0]"
                            title="Edit address"
                            type="button"
                            onClick={() => {
                              handleOpenEditModal(address);
                            }}
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button
                            className="mx-2 text-[#595c5e] transition-colors hover:text-[#b31b25]"
                            title="Delete address"
                            type="button"
                            onClick={() => {
                              handleRequestDeleteAddress(address);
                            }}
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {filteredAddresses.length > ADDRESSES_PER_PAGE ? (
            <div className="mt-5 flex flex-col items-center gap-4 rounded-xl bg-white px-5 py-4 text-center">
              <p className="text-sm font-medium text-[#595c5e]">{paginationSummary}</p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  className="rounded-lg border border-[#d9dfe5] px-4 py-2 text-sm font-semibold text-[#2c2f31] transition-colors hover:bg-[#f5f7f9] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={currentPage === 1}
                  type="button"
                  onClick={() => {
                    setCurrentPage((previousPage) => Math.max(1, previousPage - 1));
                  }}
                >
                  Previous
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={[
                      'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                      currentPage === pageNumber
                        ? 'bg-[#0052d0] text-white'
                        : 'border border-[#d9dfe5] text-[#2c2f31] hover:bg-[#f5f7f9]',
                    ].join(' ')}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  className="rounded-lg border border-[#d9dfe5] px-4 py-2 text-sm font-semibold text-[#2c2f31] transition-colors hover:bg-[#f5f7f9] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  type="button"
                  onClick={() => {
                    setCurrentPage((previousPage) => Math.min(totalPages, previousPage + 1));
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <AddAddressModal
        existingAddresses={addresses}
        isOpen={isAddModalOpen}
        isSubmitting={isAddSubmitting}
        submitError={addModalError}
        onClose={handleCloseAddModal}
        onSubmit={handleAddAddress}
      />

      <EditAddressModal
        address={selectedAddress}
        existingAddresses={addresses}
        isSubmitting={isEditSubmitting}
        submitError={editModalError}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateAddress}
      />

      <ConfirmDialog
        confirmLabel="Delete address"
        description={
          pendingDeleteAddress
            ? `Delete ${getDisplayAddressLabel(pendingDeleteAddress.label)} from your wallet directory? This action cannot be undone.`
            : 'Delete this address?'
        }
        isOpen={Boolean(pendingDeleteAddress)}
        isSubmitting={isDeleteSubmitting}
        title="Delete address"
        onClose={handleCloseDeleteDialog}
        onConfirm={() => {
          void handleDeleteAddress();
        }}
      />
    </div>
  );
}
