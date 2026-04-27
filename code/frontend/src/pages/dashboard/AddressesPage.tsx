import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from '../../api/address.api';
import { AddAddressModal } from '../../components/dashboard/AddAddressModal';
import { AddressTable } from '../../components/dashboard/AddressTable';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { EditAddressModal } from '../../components/dashboard/EditAddressModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { ADDRESS_TYPES, type AddressFormValues, type AddressRecord } from '../../types/address';
import { type CoinData, getCoinData } from '../../utils/coingecko';
import { getDisplayAddressLabel, normalizeAddressForComparison } from '../../utils/detector';

const FILTER_OPTIONS = ['ALL', ...ADDRESS_TYPES] as const;
const DIRECTION_FILTER_OPTIONS = ['ALL', 'RECEIVING', 'SENDING'] as const;
const ADDRESSES_PER_PAGE = 10;

type FilterOption = (typeof FILTER_OPTIONS)[number];
type DirectionFilterOption = (typeof DIRECTION_FILTER_OPTIONS)[number];

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while loading your addresses.';
}

export function AddressesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [addModalError, setAddModalError] = useState('');
  const [coinDataByType, setCoinDataByType] = useState<Record<string, CoinData | null | undefined>>({});
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);
  const [editModalError, setEditModalError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetryableError, setIsRetryableError] = useState(false);
  const [loadingCoinTypes, setLoadingCoinTypes] = useState<Record<string, boolean>>({});
  const [pendingDeleteAddress, setPendingDeleteAddress] = useState<AddressRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<AddressRecord | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('ALL');
  const [selectedDirectionFilter, setSelectedDirectionFilter] = useState<DirectionFilterOption>('ALL');
  const [successMessage, setSuccessMessage] = useState('');
  const pendingCoinTypesRef = useRef(new Set<string>());

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    setIsRetryableError(false);

    try {
      const result = await getAddresses();
      setAddresses(result);
    } catch (error) {
      console.error('Failed to load addresses.', error);
      setErrorMessage(getErrorMessage(error));
      setIsRetryableError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    const initialView = searchParams.get('view')?.trim().toUpperCase();
    const initialNetwork = searchParams.get('network')?.trim().toUpperCase();
    const shouldOpenAddModal = searchParams.get('modal') === 'add';

    if (initialView === 'SENDING' || initialView === 'RECEIVING') {
      setSelectedDirectionFilter(initialView);
    }

    if (
      initialNetwork &&
      FILTER_OPTIONS.includes(initialNetwork as FilterOption)
    ) {
      setSelectedFilter(initialNetwork as FilterOption);
    }

    if (shouldOpenAddModal) {
      setAddModalError('');
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage]);

  useEffect(() => {
    if (!copiedAddressId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedAddressId(null);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copiedAddressId]);

  useEffect(() => {
    const coinTypesToLoad = Array.from(
      new Set(addresses.map((address) => address.type.trim().toUpperCase())),
    );

    for (const coinType of coinTypesToLoad) {
      if (!coinType || coinDataByType[coinType] !== undefined) {
        continue;
      }

      if (pendingCoinTypesRef.current.has(coinType)) {
        continue;
      }

      pendingCoinTypesRef.current.add(coinType);
      setLoadingCoinTypes((previous) => ({
        ...previous,
        [coinType]: true,
      }));

      void getCoinData(coinType)
        .then((coinData) => {
          setCoinDataByType((previous) => ({
            ...previous,
            [coinType]: coinData,
          }));
        })
        .catch((error) => {
          console.error(`Failed to load local market data for ${coinType}.`, error);
          setCoinDataByType((previous) => ({
            ...previous,
            [coinType]: null,
          }));
        })
        .finally(() => {
          pendingCoinTypesRef.current.delete(coinType);
          setLoadingCoinTypes((previous) => {
            const nextState = { ...previous };
            delete nextState[coinType];
            return nextState;
          });
        });
    }
  }, [addresses, coinDataByType]);

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

  const handleOpenAddModal = useCallback(() => {
    setAddModalError('');
    setIsAddModalOpen(true);
    updateUrlState({ modal: 'add' });
  }, [updateUrlState]);

  const handleCloseAddModal = useCallback(() => {
    setAddModalError('');
    setIsAddModalOpen(false);
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

  const addressExists = useCallback(
    (address: string, currentAddressId?: string) => {
      const normalizedAddress = normalizeAddressForComparison(address);

      return addresses.some(
        (currentAddress) =>
          currentAddress.id !== currentAddressId &&
          normalizeAddressForComparison(currentAddress.address) === normalizedAddress,
      );
    },
    [addresses],
  );

  const handleAddAddress = useCallback(
    async (values: AddressFormValues) => {
      if (addressExists(values.address)) {
        setAddModalError('Address already exists');
        return;
      }

      setAddModalError('');
      setErrorMessage('');
      setIsRetryableError(false);
      setSuccessMessage('');
      setIsAddSubmitting(true);

      try {
        const createdAddress = await createAddress(values);
        setAddresses((previous) => [createdAddress, ...previous]);
        setAddModalError('');
        setIsAddModalOpen(false);
        updateUrlState({ modal: null });
        setSuccessMessage('Address added');
      } catch (error) {
        console.error('Failed to create address.', error);
        setAddModalError(getErrorMessage(error));
      } finally {
        setIsAddSubmitting(false);
      }
    },
    [addressExists, updateUrlState],
  );

  const handleUpdateAddress = useCallback(
    async (values: AddressFormValues) => {
      if (!selectedAddress) {
        return;
      }

      if (addressExists(values.address, selectedAddress.id)) {
        setEditModalError('Address already exists');
        return;
      }

      setEditModalError('');
      setErrorMessage('');
      setIsRetryableError(false);
      setSuccessMessage('');
      setIsEditSubmitting(true);

      try {
        const updatedAddress = await updateAddress(selectedAddress.id, values);

        setAddresses((previous) =>
          previous.map((address) => (address.id === selectedAddress.id ? updatedAddress : address)),
        );
        setEditModalError('');
        setSelectedAddress(null);
        setSuccessMessage('Address updated');
      } catch (error) {
        console.error('Failed to update address.', error);
        setEditModalError(getErrorMessage(error));
      } finally {
        setIsEditSubmitting(false);
      }
    },
    [addressExists, selectedAddress],
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

    setErrorMessage('');
    setIsRetryableError(false);
    setSuccessMessage('');
    setIsDeleteSubmitting(true);

    try {
      await deleteAddress(pendingDeleteAddress.id);
      setAddresses((previous) =>
        previous.filter((address) => address.id !== pendingDeleteAddress.id),
      );
      setPendingDeleteAddress(null);
      setSuccessMessage('Address deleted');
    } catch (error) {
      console.error('Failed to delete address.', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsDeleteSubmitting(false);
    }
  }, [pendingDeleteAddress]);

  const handleCopyAddress = useCallback(async (address: AddressRecord) => {
    setErrorMessage('');
    setIsRetryableError(false);
    setSuccessMessage('');

    try {
      await navigator.clipboard.writeText(address.address);
      setCopiedAddressId(address.id);
      setSuccessMessage('Address copied');
    } catch (error) {
      console.error('Failed to copy address.', error);
      setErrorMessage('Failed to copy address.');
    }
  }, []);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const totalAddresses = addresses.length;
  const receivingCount = addresses.filter((savedAddress) => savedAddress.direction === 'RECEIVING').length;
  const sendingCount = totalAddresses - receivingCount;

  const typeCounts = useMemo(
    () =>
      addresses.reduce<Record<string, number>>((counts, savedAddress) => {
        const normalizedType = savedAddress.type.trim().toUpperCase();
        counts[normalizedType] = (counts[normalizedType] ?? 0) + 1;
        return counts;
      }, {}),
    [addresses],
  );

  const activeTypeCounts = useMemo(
    () =>
      ADDRESS_TYPES.filter((type) => (typeCounts[type] ?? 0) > 0).map((type) => ({
        type,
        count: typeCounts[type],
      })),
    [typeCounts],
  );

  const filteredAddresses = useMemo(
    () =>
      addresses.filter((savedAddress) => {
        const matchesFilter =
          selectedFilter === 'ALL' || savedAddress.type.trim().toUpperCase() === selectedFilter;
        const matchesDirection =
          selectedDirectionFilter === 'ALL' || savedAddress.direction === selectedDirectionFilter;

        if (!matchesFilter || !matchesDirection) {
          return false;
        }

        if (!normalizedSearchTerm) {
          return true;
        }

        const labelText = getDisplayAddressLabel(savedAddress.label).toLowerCase();
        const addressText = savedAddress.address.toLowerCase();

        return labelText.includes(normalizedSearchTerm) || addressText.includes(normalizedSearchTerm);
      }),
    [addresses, normalizedSearchTerm, selectedDirectionFilter, selectedFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredAddresses.length / ADDRESSES_PER_PAGE));
  const paginatedAddresses = useMemo(() => {
    const startIndex = (currentPage - 1) * ADDRESSES_PER_PAGE;
    return filteredAddresses.slice(startIndex, startIndex + ADDRESSES_PER_PAGE);
  }, [currentPage, filteredAddresses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearchTerm, selectedDirectionFilter, selectedFilter]);

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

  return (
    <div className="layout-stack-xl">
      <DashboardHeader
        actions={
          <Button className="w-full justify-center sm:min-w-[160px] sm:w-auto" size="lg" onClick={handleOpenAddModal}>
            Add Address
          </Button>
        }
        eyebrow="Address workspace"
        subtitle="Organize saved addresses by sending and receiving views, search faster, and keep network context attached to each entry."
        title="My Addresses"
      />

      {successMessage ? (
        <Card className="px-5 py-4" tone="accent">
          <p className="text-sm font-medium text-cyan-100">{successMessage}</p>
        </Card>
      ) : null}

      {errorMessage ? (
        <ErrorState
          className="rounded-2xl px-5 py-4"
          message={errorMessage}
          onRetry={
            isRetryableError
              ? () => {
                  void loadAddresses();
                }
              : undefined
          }
          title="Something went wrong"
        />
      ) : null}

      {!isLoading && !errorMessage ? (
        <section className="layout-grid-12">
          <Card className="col-span-12 p-5 sm:p-8 xl:col-span-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Search, filter, and route the list</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Treat this like the extension’s full workspace: jump between sending and receiving views, then narrow the list down by network or label.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-200">Search</span>
                <Input
                  placeholder="Search by label or pasted address"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                />
              </label>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-200">View</span>
                  <div className="flex flex-wrap gap-2">
                    {DIRECTION_FILTER_OPTIONS.map((directionOption) => (
                      <Button
                        key={directionOption}
                        size="sm"
                        variant={selectedDirectionFilter === directionOption ? 'primary' : 'secondary'}
                        onClick={() => {
                          setSelectedDirectionFilter(directionOption);
                          updateUrlState({
                            view: directionOption === 'ALL' ? null : directionOption,
                          });
                        }}
                      >
                        {directionOption === 'ALL'
                          ? 'All'
                          : directionOption === 'SENDING'
                            ? 'Sending'
                            : 'Receiving'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-200">Filter by network</span>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.map((filterOption) => (
                      <Button
                        key={filterOption}
                        size="sm"
                        variant={selectedFilter === filterOption ? 'primary' : 'secondary'}
                        onClick={() => {
                          setSelectedFilter(filterOption);
                          updateUrlState({
                            network: filterOption === 'ALL' ? null : filterOption,
                          });
                        }}
                      >
                        {filterOption}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="col-span-12 p-5 sm:p-7 xl:col-span-4" tone="muted">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace split</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{totalAddresses}</p>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Saved addresses across both organizational views.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/[0.03] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Receiving</p>
                <p className="mt-2 text-2xl font-semibold text-white">{receivingCount}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sending</p>
                <p className="mt-2 text-2xl font-semibold text-white">{sendingCount}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {activeTypeCounts.length > 0 ? (
                activeTypeCounts.map((entry, index) => (
                  <span
                    key={entry.type}
                    className={[
                      'rounded-xl border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300',
                      index === 1 ? 'sm:translate-x-2' : '',
                    ].join(' ')}
                  >
                    {entry.type}: {entry.count}
                  </span>
                ))
              ) : (
                <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  No addresses yet
                </span>
              )}
            </div>
          </Card>
        </section>
      ) : null}

      {isLoading ? (
        <Card className="p-0">
          <Loader message="Loading addresses..." />
        </Card>
      ) : null}

      {!isLoading && !errorMessage && addresses.length > 0 && filteredAddresses.length === 0 ? (
        <Card className="px-6 py-14">
          <h2 className="text-2xl font-semibold text-white">Nothing matches that search</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Try a different label, paste more of the address, or change the active send/receive or network view.
          </p>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && (addresses.length === 0 || filteredAddresses.length > 0) ? (
        <div className="space-y-5">
          <AddressTable
            addresses={addresses.length === 0 ? addresses : paginatedAddresses}
            coinDataByType={coinDataByType}
            copiedAddressId={copiedAddressId}
            loadingCoinTypes={loadingCoinTypes}
            onAddAddress={handleOpenAddModal}
            onCopy={handleCopyAddress}
            onDelete={handleRequestDeleteAddress}
            onEdit={handleOpenEditModal}
          />

          {filteredAddresses.length > ADDRESSES_PER_PAGE ? (
            <Card className="flex flex-col items-center gap-4 px-5 py-4 text-center">
              <p className="text-sm font-medium text-slate-300">{paginationSummary}</p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  disabled={currentPage === 1}
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCurrentPage((previousPage) => Math.max(1, previousPage - 1));
                  }}
                >
                  Previous
                </Button>

                {pageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    size="sm"
                    variant={currentPage === pageNumber ? 'primary' : 'secondary'}
                    onClick={() => {
                      setCurrentPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </Button>
                ))}

                <Button
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCurrentPage((previousPage) => Math.min(totalPages, previousPage + 1));
                  }}
                >
                  Next
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}

      <AddAddressModal
        existingAddresses={addresses}
        isOpen={isAddModalOpen}
        isSubmitting={isAddSubmitting}
        onClose={handleCloseAddModal}
        onSubmit={handleAddAddress}
        submitError={addModalError}
      />
      <EditAddressModal
        address={selectedAddress}
        existingAddresses={addresses}
        isSubmitting={isEditSubmitting}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateAddress}
        submitError={editModalError}
      />

      <ConfirmDialog
        confirmLabel="Delete address"
        description={
          pendingDeleteAddress
            ? `Delete ${getDisplayAddressLabel(pendingDeleteAddress.label)} from your saved addresses? This action cannot be undone.`
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
