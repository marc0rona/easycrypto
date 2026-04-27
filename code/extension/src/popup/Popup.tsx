import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import { getCoinData, type CoinData } from '../utils/coingecko';
import { detectCryptoType, type DetectedCryptoType } from '../utils/detector';
import { HomeScreen } from './HomeScreen';
import { MarketPanel } from './MarketPanel';
import { PortfolioScreen } from './PortfolioScreen';
import { SaveScreen } from './SaveScreen';
import { SwapPanel } from './SwapPanel';

type SavedAddress = {
  id: string;
  address: string;
  direction: AddressDirection;
  label: string | null;
  type: string;
};

type AddressDirection = 'RECEIVING' | 'SENDING';

interface SaveAddressMessage {
  type: 'SAVE_ADDRESS';
  payload: {
    address: string;
    direction: AddressDirection;
    label: string;
    type: DetectedCryptoType;
  };
}

interface UpdateAddressMessage {
  type: 'UPDATE_ADDRESS';
  payload: {
    id: string;
    address: string;
    direction: AddressDirection;
    label: string;
    type: DetectedCryptoType;
  };
}

interface DeleteAddressMessage {
  type: 'DELETE_ADDRESS';
  payload: {
    id: string;
  };
}

interface MutationResponse {
  success: boolean;
  error?: string;
}

interface LoginMessage {
  type: 'LOGIN';
  payload: {
    email: string;
    password: string;
  };
}

interface LogoutMessage {
  type: 'LOGOUT';
}

interface RestoreSessionMessage {
  type: 'RESTORE_SESSION';
}

interface GetAddressesMessage {
  type: 'GET_ADDRESSES';
}

interface LoginResponse {
  success: boolean;
  error?: string;
}

interface GetAddressesResponse {
  success: boolean;
  data?: SavedAddress[];
  error?: string;
}

interface LogoutResponse {
  success: boolean;
  error?: string;
}

interface RestoreSessionResponse {
  authenticated: boolean;
  success: boolean;
  error?: string;
}

type ToastKind = 'success' | 'error' | 'info';
type PopupScreen = 'home' | 'market' | 'receive' | 'save' | 'send' | 'swap';
type NonSavePopupScreen = Exclude<PopupScreen, 'save'>;
type PopupTheme = 'light' | 'dark';

interface ToastState {
  id: number;
  kind: ToastKind;
  message: string;
}

const AUTH_TOKEN_KEY = 'authToken';
const POPUP_THEME_STORAGE_KEY = 'ez-crypt0-popup-theme';
const DEFAULT_ADDRESS_DIRECTION: AddressDirection = 'RECEIVING';
const FILTER_OPTIONS = [
  'ALL',
  'ETH',
  'BTC',
  'ADA',
  'DOGE',
  'XRP',
  'SOL',
  'LTC',
  'TON',
  'DOT',
  'TRX',
  'ATOM',
] as const;
const FILTER_LABELS = {
  ALL: 'All',
  ETH: 'Ethereum',
  BTC: 'Bitcoin',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  XRP: 'XRP',
  SOL: 'Solana',
  LTC: 'Litecoin',
  TON: 'Toncoin',
  DOT: 'Polkadot',
  TRX: 'TRON',
  ATOM: 'Cosmos',
} as const;
const STATS_TYPE_ORDER = [
  'ETH',
  'BTC',
  'ADA',
  'XRP',
  'SOL',
  'DOGE',
  'LTC',
  'TON',
  'DOT',
  'TRX',
  'ATOM',
] as const;

type AddressFilter = (typeof FILTER_OPTIONS)[number];

const ADA_ADDRESS_PREFIX_REGEX = /^(?:addr1|Ae2|DdzFF)/;
const ATOM_ADDRESS_PREFIX_REGEX = /^cosmos1/i;
const ETH_ADDRESS_PREFIX_REGEX = /^0x/i;
const BTC_ADDRESS_PREFIX_REGEX = /^(?:bc1|[13])/i;
const DOGE_ADDRESS_PREFIX_REGEX = /^(?:D|A|9)/i;
const DOT_ADDRESS_PREFIX_REGEX = /^1/;
const TON_ADDRESS_PREFIX_REGEX = /^(?:EQ|UQ|kQ|0Q)/;
const TRX_ADDRESS_PREFIX_REGEX = /^T/i;
const XRP_ADDRESS_PREFIX_REGEX = /^r/i;
const LTC_ADDRESS_PREFIX_REGEX = /^(?:ltc1|[LM])/i;
const SOL_ADDRESS_CHARACTER_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getRuntimeMessage(fallbackMessage: string): string {
  return chrome.runtime.lastError?.message || fallbackMessage;
}

function normalizeAddressForComparison(value: string): string {
  return value.trim().toLowerCase();
}

function truncateAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getFallbackLabel(type: string): string {
  switch (type) {
    case 'BTC':
      return 'Bitcoin Address';
    case 'ADA':
      return 'Cardano Address';
    case 'ATOM':
      return 'Cosmos Address';
    case 'ETH':
      return 'Ethereum Address';
    case 'DOGE':
      return 'Dogecoin Address';
    case 'DOT':
      return 'Polkadot Address';
    case 'LTC':
      return 'Litecoin Address';
    case 'SOL':
      return 'Solana Address';
    case 'TON':
      return 'Toncoin Address';
    case 'TRX':
      return 'Tron Address';
    case 'XRP':
      return 'XRP Address';
    default:
      return 'Unnamed Address';
  }
}

function getDirectionLabel(direction: AddressDirection): string {
  return direction === 'SENDING' ? 'Sending' : 'Receiving';
}

function getFilterDisplayName(filter: AddressFilter): string {
  return FILTER_LABELS[filter];
}

function isGenericImportedLabel(label: string): boolean {
  return label.trim().toLowerCase() === 'imported from extension';
}

function getDisplayLabel(label: string | null, type: string): string {
  const trimmedLabel = typeof label === 'string' ? label.trim() : '';

  if (!trimmedLabel || isGenericImportedLabel(trimmedLabel)) {
    return getFallbackLabel(type);
  }

  return trimmedLabel;
}

function getAddressValidationMessage(address: string): string | null {
  const normalizedAddress = address.trim();

  if (!normalizedAddress) {
    return null;
  }

  if (detectCryptoType(normalizedAddress)) {
    return null;
  }

  if (ADA_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid ADA address';
  }

  if (ATOM_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid ATOM address';
  }

  if (ETH_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid ETH address';
  }

  if (DOT_ADDRESS_PREFIX_REGEX.test(normalizedAddress) && normalizedAddress.length >= 43) {
    return 'Invalid DOT address';
  }

  if (BTC_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid BTC address';
  }

  if (DOGE_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid DOGE address';
  }

  if (TON_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid TON address';
  }

  if (TRX_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid TRX address';
  }

  if (XRP_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid XRP address';
  }

  if (LTC_ADDRESS_PREFIX_REGEX.test(normalizedAddress)) {
    return 'Invalid LTC address';
  }

  if (
    normalizedAddress.length >= 32 &&
    normalizedAddress.length <= 44 &&
    SOL_ADDRESS_CHARACTER_REGEX.test(normalizedAddress)
  ) {
    return 'Invalid SOL address';
  }

  return 'Unknown or invalid address';
}

function getInitialPopupTheme(): PopupTheme {
  if (typeof document !== 'undefined') {
    const datasetTheme = document.documentElement.dataset.theme;

    if (datasetTheme === 'dark' || datasetTheme === 'light') {
      return datasetTheme;
    }
  }

  if (typeof window !== 'undefined') {
    const storedTheme = window.localStorage.getItem(POPUP_THEME_STORAGE_KEY);

    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
  }

  return 'light';
}

function LoadingDots({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{label}</span>
      <span className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}

export function Popup() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const addressIdsRef = useRef<string[]>([]);
  const nextToastIdRef = useRef(0);
  const pendingCoinTypesRef = useRef(new Set<string>());

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState<PopupScreen>('home');
  const [saveReturnScreen, setSaveReturnScreen] = useState<NonSavePopupScreen>('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [direction, setDirection] = useState<AddressDirection>(DEFAULT_ADDRESS_DIRECTION);
  const [label, setLabel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<AddressFilter>('ALL');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFilterPickerOpen, setIsFilterPickerOpen] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);
  const [pendingAddressId, setPendingAddressId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [highlightedDuplicateId, setHighlightedDuplicateId] = useState<string | null>(null);
  const [enteringAddressIds, setEnteringAddressIds] = useState<string[]>([]);
  const [removingAddressId, setRemovingAddressId] = useState<string | null>(null);
  const [isAddressInputShaking, setIsAddressInputShaking] = useState(false);
  const [coinDataByType, setCoinDataByType] = useState<Record<string, CoinData | null>>({});
  const [loadingCoinTypes, setLoadingCoinTypes] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isToastLeaving, setIsToastLeaving] = useState(false);
  const [theme, setTheme] = useState<PopupTheme>(() => getInitialPopupTheme());
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const trimmedAddress = address.trim();
  const isMarketScreenOpen = activeScreen === 'market';
  const isReceiveScreenOpen = activeScreen === 'receive';
  const isSaveScreenOpen = activeScreen === 'save';
  const isSendScreenOpen = activeScreen === 'send';
  const isSwapScreenOpen = activeScreen === 'swap';
  const currentNonSaveScreen: NonSavePopupScreen =
    activeScreen === 'save' ? saveReturnScreen : activeScreen;
  const detectedType = detectCryptoType(trimmedAddress);
  const detectedCoinData = detectedType ? coinDataByType[detectedType] ?? null : null;
  const isDetectedCoinDataLoading = detectedType ? Boolean(loadingCoinTypes[detectedType]) : false;
  const normalizedInputAddress = normalizeAddressForComparison(trimmedAddress);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const duplicateAddressMatch = useMemo(
    () =>
      normalizedInputAddress
        ? addresses.find(
            (savedAddress) =>
              savedAddress.id !== editingId &&
              normalizeAddressForComparison(savedAddress.address) === normalizedInputAddress,
          ) ?? null
        : null,
    [addresses, editingId, normalizedInputAddress],
  );

  const liveValidationError = useMemo(
    () => getAddressValidationMessage(trimmedAddress),
    [trimmedAddress],
  );
  const liveDuplicateError = duplicateAddressMatch ? 'Address already saved' : null;
  const addressErrorMessage = error ?? liveValidationError ?? liveDuplicateError;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const themeToggleLabel = theme === 'dark' ? 'Light' : 'Dark';
  const themeToggleIcon = theme === 'dark' ? '☀' : '☾';

  function resetAuthenticatedUiState() {
    setPassword('');
    setAddress('');
    setDirection(DEFAULT_ADDRESS_DIRECTION);
    setLabel('');
    setSearchTerm('');
    setSelectedFilter('ALL');
    setIsFilterPickerOpen(false);
    setAddresses([]);
    setAddressesError(null);
    setCopiedAddressId(null);
    setPendingAddressId(null);
    setEditingId(null);
    setHighlightedDuplicateId(null);
    setLoading(false);
    setSuccessMessage(null);
    setError(null);
    setAuthError(null);
    setActiveScreen('home');
    setSaveReturnScreen('home');
    setCoinDataByType({});
    setLoadingCoinTypes({});
    pendingCoinTypesRef.current.clear();
    addressIdsRef.current = [];
    setEnteringAddressIds([]);
    setRemovingAddressId(null);
    setToast(null);
    setIsToastLeaving(false);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    window.localStorage.setItem(POPUP_THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    const message: RestoreSessionMessage = {
      type: 'RESTORE_SESSION',
    };

    chrome.runtime.sendMessage(message, (response?: RestoreSessionResponse) => {
      if (!isMounted) {
        return;
      }

      setIsCheckingSession(false);

      if (chrome.runtime.lastError) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(Boolean(response?.authenticated));
    });

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== 'session' || !changes[AUTH_TOKEN_KEY]) {
        return;
      }

      const nextToken = changes[AUTH_TOKEN_KEY].newValue as string | undefined;
      setIsAuthenticated(Boolean(nextToken));
      setIsCheckingSession(false);

      if (!nextToken) {
        resetAuthenticatedUiState();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      isMounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    setIsFilterPickerOpen(false);
  }, [activeScreen]);

  useEffect(() => {
    if (!isAuthenticated && !isCheckingSession) {
      emailInputRef.current?.focus();
    }
  }, [isAuthenticated, isCheckingSession]);

  useEffect(() => {
    if (isAuthenticated && isSaveScreenOpen) {
      const focusTimer = window.setTimeout(() => {
        addressInputRef.current?.focus();
      }, 180);

      return () => {
        window.clearTimeout(focusTimer);
      };
    }

    return undefined;
  }, [isAuthenticated, isSaveScreenOpen]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2200);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [successMessage]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    setIsToastLeaving(false);

    const leaveTimer = window.setTimeout(() => {
      setIsToastLeaving(true);
    }, 1600);

    const removeTimer = window.setTimeout(() => {
      setToast((currentToast) => (currentToast?.id === toast.id ? null : currentToast));
      setIsToastLeaving(false);
    }, 1900);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [toast]);

  useEffect(() => {
    if (!copiedAddressId) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setCopiedAddressId(null);
    }, 1500);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [copiedAddressId]);

  useEffect(() => {
    if (!highlightedDuplicateId) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setHighlightedDuplicateId(null);
    }, 1800);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [highlightedDuplicateId]);

  useEffect(() => {
    if (!enteringAddressIds.length) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setEnteringAddressIds([]);
    }, 460);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [enteringAddressIds]);

  useEffect(() => {
    if (!isAddressInputShaking) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setIsAddressInputShaking(false);
    }, 320);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [isAddressInputShaking]);

  useEffect(() => {
    const coinTypesToLoad = new Set<string>();

    if (detectedType) {
      coinTypesToLoad.add(detectedType);
    }

    for (const filterOption of FILTER_OPTIONS) {
      if (filterOption !== 'ALL') {
        coinTypesToLoad.add(filterOption);
      }
    }

    for (const savedAddress of addresses) {
      if (savedAddress.type) {
        coinTypesToLoad.add(savedAddress.type.trim().toUpperCase());
      }
    }

    for (const coinType of coinTypesToLoad) {
      if (!coinType || coinDataByType[coinType] !== undefined) {
        continue;
      }

      if (pendingCoinTypesRef.current.has(coinType)) {
        continue;
      }

      pendingCoinTypesRef.current.add(coinType);
      setLoadingCoinTypes((currentState) => ({
        ...currentState,
        [coinType]: true,
      }));

      void getCoinData(coinType)
        .then((nextCoinData) => {
          setCoinDataByType((currentState) => ({
            ...currentState,
            [coinType]: nextCoinData,
          }));
        })
        .catch(() => {
          setCoinDataByType((currentState) => ({
            ...currentState,
            [coinType]: null,
          }));
        })
        .finally(() => {
          pendingCoinTypesRef.current.delete(coinType);
          setLoadingCoinTypes((currentState) => {
            const nextState = { ...currentState };
            delete nextState[coinType];
            return nextState;
          });
        });
    }
  }, [addresses, detectedType, coinDataByType]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([]);
      setAddressesError(null);
      setIsAddressesLoading(false);
      addressIdsRef.current = [];
      setEnteringAddressIds([]);
      setRemovingAddressId(null);
      return;
    }

    void fetchAddresses();
  }, [isAuthenticated]);

  function showToast(kind: ToastKind, message: string) {
    nextToastIdRef.current += 1;
    setIsToastLeaving(false);
    setToast({
      id: nextToastIdRef.current,
      kind,
      message,
    });
  }

  function triggerAddressError(message: string) {
    setSuccessMessage(null);
    setError(message);
    setIsAddressInputShaking(true);
  }

  function resetAddressForm() {
    setAddress('');
    setDirection(DEFAULT_ADDRESS_DIRECTION);
    setLabel('');
  }

  function getPortfolioData(directionFilter?: AddressDirection) {
    const scopedAddresses = directionFilter
      ? addresses.filter((savedAddress) => savedAddress.direction === directionFilter)
      : addresses;

    const visibleAddresses = scopedAddresses.filter((savedAddress) => {
      const matchesFilter =
        selectedFilter === 'ALL' || savedAddress.type.trim().toUpperCase() === selectedFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const labelText = getDisplayLabel(savedAddress.label, savedAddress.type).toLowerCase();
      const addressText = savedAddress.address.toLowerCase();

      return labelText.includes(normalizedSearchTerm) || addressText.includes(normalizedSearchTerm);
    });

    const typeCounts = scopedAddresses.reduce<Record<string, number>>((counts, savedAddress) => {
      const normalizedType = savedAddress.type.trim().toUpperCase();

      counts[normalizedType] = (counts[normalizedType] ?? 0) + 1;

      return counts;
    }, {});

    const statsTypes = [
      ...STATS_TYPE_ORDER.filter((type) => (typeCounts[type] ?? 0) > 0),
      ...Object.keys(typeCounts)
        .filter(
          (type) =>
            (typeCounts[type] ?? 0) > 0 &&
            !STATS_TYPE_ORDER.includes(type as (typeof STATS_TYPE_ORDER)[number]),
        )
        .sort(),
    ];

    return {
      totalCount: scopedAddresses.length,
      statsSummary: statsTypes.map((type) => `${type}: ${typeCounts[type]}`),
      visibleAddresses,
    };
  }

  function returnToScreen(
    screen: NonSavePopupScreen,
    options?: { clearDraft?: boolean; resetEdit?: boolean },
  ) {
    const { clearDraft = false, resetEdit = false } = options ?? {};

    setActiveScreen(screen);
    setError(null);
    setSuccessMessage(null);
    setHighlightedDuplicateId(null);

    if (resetEdit) {
      setEditingId(null);
    }

    if (clearDraft) {
      resetAddressForm();
    }
  }

  function handleOpenSaveScreen(options?: {
    direction?: AddressDirection;
    returnScreen?: NonSavePopupScreen;
  }) {
    if (loading) {
      return;
    }

    if (options?.direction) {
      setDirection(options.direction);
    }

    setSaveReturnScreen(options?.returnScreen ?? currentNonSaveScreen);
    setActiveScreen('save');
    setSuccessMessage(null);
    setAddressesError(null);
  }

  function handleOpenDirectionalPortfolio(directionToOpen: AddressDirection) {
    setActiveScreen(directionToOpen === 'SENDING' ? 'send' : 'receive');
    setSuccessMessage(null);
    setAddressesError(null);
  }

  function handleBackFromSaveScreen() {
    if (editingId) {
      returnToScreen(saveReturnScreen, { clearDraft: true, resetEdit: true });
      return;
    }

    returnToScreen(saveReturnScreen);
  }

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoggingIn) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setAuthError('Invalid credentials');
      return;
    }

    setIsLoggingIn(true);
    setAuthError(null);

    const message: LoginMessage = {
      type: 'LOGIN',
      payload: {
        email: trimmedEmail,
        password,
      },
    };

    chrome.runtime.sendMessage(message, (response?: LoginResponse) => {
      setIsLoggingIn(false);

      if (chrome.runtime.lastError || !response?.success) {
        setIsAuthenticated(false);
        setAuthError(response?.error ?? getRuntimeMessage('Invalid credentials'));
        return;
      }

      setIsAuthenticated(true);
      setPassword('');
      setAuthError(null);
      setActiveScreen('home');
      setSaveReturnScreen('home');
    });
  }

  function handleLogout() {
    const message: LogoutMessage = {
      type: 'LOGOUT',
    };

    chrome.runtime.sendMessage(message, (_response?: LogoutResponse) => {
      setIsAuthenticated(false);
      resetAuthenticatedUiState();

      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 0);
    });
  }

  function handleStartEdit(savedAddress: SavedAddress) {
    setSaveReturnScreen(currentNonSaveScreen);
    setEditingId(savedAddress.id);
    setAddress(savedAddress.address);
    setDirection(savedAddress.direction);
    setLabel(
      typeof savedAddress.label === 'string' && !isGenericImportedLabel(savedAddress.label)
        ? savedAddress.label
        : '',
    );
    setError(null);
    setSuccessMessage(null);
    setAddressesError(null);
    setHighlightedDuplicateId(null);
    setActiveScreen('save');
  }

  function handleCancelEdit() {
    returnToScreen(saveReturnScreen, { clearDraft: true, resetEdit: true });
  }

  function handleAddressChange(nextAddress: string) {
    setAddress(nextAddress);
    setError(null);
    setSuccessMessage(null);
    setHighlightedDuplicateId(null);
    setIsAddressInputShaking(false);
  }

  function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (liveValidationError) {
      triggerAddressError(liveValidationError);
      return;
    }

    if (duplicateAddressMatch) {
      triggerAddressError('Address already saved');
      setHighlightedDuplicateId(duplicateAddressMatch.id);
      return;
    }

    const currentEditingId = editingId;
    const resolvedDetectedType = detectedType;
    const normalizedLabel = label.trim() || 'Unnamed Address';

    if (!resolvedDetectedType) {
      triggerAddressError('Unknown or invalid address');
      return;
    }

    setLoading(true);
    setSuccessMessage(null);
    setError(null);
    setAddressesError(null);

    const message: SaveAddressMessage | UpdateAddressMessage = currentEditingId
      ? {
          type: 'UPDATE_ADDRESS',
          payload: {
            id: currentEditingId,
            address: trimmedAddress,
            direction,
            label: normalizedLabel,
            type: resolvedDetectedType,
          },
        }
      : {
          type: 'SAVE_ADDRESS',
          payload: {
            address: trimmedAddress,
            direction,
            label: normalizedLabel,
            type: resolvedDetectedType,
          },
        };

    chrome.runtime.sendMessage(message, (response?: MutationResponse) => {
      setLoading(false);

      if (chrome.runtime.lastError || !response?.success) {
        triggerAddressError(
          response?.error ??
            getRuntimeMessage(currentEditingId ? 'Failed to update address' : 'Failed to save'),
        );
        showToast('error', currentEditingId ? 'Update failed' : 'Save failed');
        return;
      }

      setError(null);
      setSuccessMessage(
        currentEditingId ? 'Address updated successfully' : 'Address saved successfully',
      );
      showToast('success', currentEditingId ? 'Address updated ✅' : 'Address saved ✅');
      setEditingId(null);
      setHighlightedDuplicateId(null);
      setActiveScreen(saveReturnScreen);
      resetAddressForm();
      void fetchAddresses();
    });
  }

  function handleDeleteAddress(savedAddress: SavedAddress) {
    if (loading || pendingAddressId) {
      return;
    }

    const shouldDelete = window.confirm('Are you sure?');

    if (!shouldDelete) {
      return;
    }

    setPendingAddressId(savedAddress.id);
    setSuccessMessage(null);
    setError(null);
    setAddressesError(null);

    const message: DeleteAddressMessage = {
      type: 'DELETE_ADDRESS',
      payload: {
        id: savedAddress.id,
      },
    };

    chrome.runtime.sendMessage(message, (response?: MutationResponse) => {
      if (chrome.runtime.lastError || !response?.success) {
        setAddressesError(response?.error ?? getRuntimeMessage('Failed to delete address'));
        showToast('error', 'Delete failed');
        setRemovingAddressId(null);
        setPendingAddressId(null);
        return;
      }

      setRemovingAddressId(savedAddress.id);
      showToast('info', 'Address deleted');

      window.setTimeout(() => {
        if (editingId === savedAddress.id) {
          returnToScreen(saveReturnScreen, { clearDraft: true, resetEdit: true });
          return;
        }

        if (copiedAddressId === savedAddress.id) {
          setCopiedAddressId(null);
        }

        setSuccessMessage('Address deleted successfully');
        void fetchAddresses().finally(() => {
          setRemovingAddressId(null);
          setPendingAddressId(null);
        });
      }, 180);
    });
  }

  async function handleCopyAddress(savedAddress: SavedAddress) {
    try {
      await navigator.clipboard.writeText(savedAddress.address);
      setCopiedAddressId(savedAddress.id);
      setAddressesError(null);
      showToast('success', 'Copied ✅');
    } catch (_error) {
      setCopiedAddressId(null);
      setAddressesError('Failed to copy address.');
      showToast('error', 'Copy failed');
    }
  }

  const isSaveDisabled =
    loading ||
    !trimmedAddress ||
    Boolean(liveValidationError) ||
    Boolean(liveDuplicateError);
  const isLoginDisabled = isLoggingIn || !email.trim() || !password;

  function renderThemeToggleControl(additionalClassName?: string) {
    return (
      <button
        aria-label={`Switch to ${nextTheme} mode`}
        className={classNames(
          'popup-ghost-button popup-ghost-button--sm shrink-0 gap-2',
          additionalClassName,
        )}
        onClick={() => {
          setTheme(nextTheme);
        }}
        type="button"
      >
        <span aria-hidden="true">{themeToggleIcon}</span>
        <span>{themeToggleLabel}</span>
      </button>
    );
  }

  if (isCheckingSession) {
    return (
      <main className="popup-shell popup-shell--auth">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute right-[-24px] top-1 h-28 w-28 rounded-full bg-indigo-400/15 blur-3xl" />
        </div>

        <header className="popup-auth-header">
          <div className="flex items-start gap-3">
            <div className="brand-pillar" aria-hidden="true" />
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/75">
                Chrome Extension
              </p>
              <h1 className="text-[28px] font-semibold tracking-tight text-white">EZ-CRYPT0</h1>
              <p className="max-w-[28ch] text-sm leading-6 text-slate-400">
                Restoring your secure session...
              </p>
            </div>
          </div>

          {renderThemeToggleControl()}
        </header>

        <section className="popup-auth-body">
          <div className="glass-panel glass-panel--accent popup-auth-panel space-y-5">
            <div className="feedback-banner feedback-banner--loading">
              <LoadingDots label="Checking your session" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="popup-shell popup-shell--auth">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute right-[-24px] top-1 h-28 w-28 rounded-full bg-indigo-400/15 blur-3xl" />
        </div>

        <header className="popup-auth-header">
          <div className="flex items-start gap-3">
            <div className="brand-pillar" aria-hidden="true" />
            <div className="min-w-0">
              <h1 className="text-[28px] font-semibold tracking-tight text-white">EZ-CRYPT0</h1>
            </div>
          </div>

          {renderThemeToggleControl()}
        </header>

        <section className="popup-auth-body">
          <div className="glass-panel glass-panel--accent popup-auth-panel space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                Login
              </p>
              <h2 className="text-[18px] font-semibold tracking-tight text-white">
                Connect your account
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <label className="field-label" htmlFor="popup-email">
                  Email
                </label>
                <input
                  autoComplete="email"
                  className="popup-input"
                  id="popup-email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setAuthError(null);
                  }}
                  placeholder="you@example.com"
                  ref={emailInputRef}
                  type="email"
                  value={email}
                />
              </div>

              <div className="space-y-2">
                <label className="field-label" htmlFor="popup-password">
                  Password
                </label>
                <input
                  autoComplete="current-password"
                  className="popup-input"
                  id="popup-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                />
              </div>

              {authError ? (
                <p className="feedback-banner feedback-banner--error">{authError}</p>
              ) : null}

              <button
                className="popup-primary-button w-full"
                disabled={isLoginDisabled}
                type="submit"
              >
                {isLoggingIn ? <LoadingDots label="Logging in" /> : 'Login'}
              </button>
            </form>
          </div>
        </section>

        <div className="toast-layer" aria-live="polite">
          {toast ? (
            <div
              className={classNames(
                'toast-pill',
                `toast-pill--${toast.kind}`,
                isToastLeaving && 'toast-pill--leaving',
              )}
              key={toast.id}
            >
              {toast.message}
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  function fetchAddresses(): Promise<void> {
    setIsAddressesLoading(true);
    setAddressesError(null);

    return new Promise((resolve) => {
      const message: GetAddressesMessage = {
        type: 'GET_ADDRESSES',
      };

      chrome.runtime.sendMessage(message, (response?: GetAddressesResponse) => {
        setIsAddressesLoading(false);

        if (chrome.runtime.lastError || !response?.success) {
          setAddressesError(
            response?.error ?? getRuntimeMessage('Failed to load saved addresses.'),
          );
          resolve();
          return;
        }

        const nextAddresses = response.data ?? [];
        const previousIds = new Set(addressIdsRef.current);
        const nextIds = nextAddresses.map((savedAddress) => savedAddress.id);

        addressIdsRef.current = nextIds;
        setEnteringAddressIds(nextIds.filter((id) => !previousIds.has(id)));
        setAddresses(nextAddresses);
        resolve();
      });
    });
  }

  function renderAuthenticatedScreen() {
    function renderPortfolioSection(options?: {
      directionFilter?: AddressDirection;
      description?: string;
      emptyDescription?: string;
      hideIntro?: boolean;
      title?: string;
    }) {
      const {
        directionFilter,
        description = 'Copy, refine, or remove saved entries without leaving the popup.',
        emptyDescription = 'Add your first crypto address from the Save action above.',
        hideIntro = false,
        title = 'Your addresses',
      } = options ?? {};
      const { totalCount, statsSummary, visibleAddresses } = getPortfolioData(directionFilter);

      return (
        <div className="workspace-panel space-y-4">
          {!hideIntro ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                Portfolio
              </p>
              <h2 className="text-[18px] font-semibold tracking-tight text-white">{title}</h2>
              <p className="text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ) : null}

          {successMessage ? (
            <p className="feedback-banner feedback-banner--success">{successMessage}</p>
          ) : null}

          {addressesError ? (
            <p className="feedback-banner feedback-banner--error">{addressesError}</p>
          ) : null}

          <div className="grid gap-3">
          <div className="soft-stat-card">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
                Total: {totalCount} {totalCount === 1 ? 'address' : 'addresses'}
              </p>
              {statsSummary.length > 0 ? (
                <p className="mt-1 text-xs leading-5 text-slate-400">{statsSummary.join(' | ')}</p>
              ) : null}
            </div>

            <input
              className="popup-input"
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
              placeholder="Search addresses..."
              type="text"
              value={searchTerm}
            />

            <div className="filter-trigger-row">
              <button
                className="filter-trigger-button"
                onClick={() => {
                  setIsFilterPickerOpen(true);
                }}
                type="button"
              >
                <span>{getFilterDisplayName(selectedFilter)}</span>
                <span aria-hidden="true" className="filter-trigger-button__chevron">
                  ▾
                </span>
              </button>
            </div>
          </div>

          <div
            aria-hidden={!isFilterPickerOpen}
            className={classNames('filter-picker', isFilterPickerOpen && 'filter-picker--open')}
          >
            <button
              aria-label="Close coin filter"
              className="filter-picker__scrim"
              onClick={() => {
                setIsFilterPickerOpen(false);
              }}
              tabIndex={isFilterPickerOpen ? 0 : -1}
              type="button"
            />

            <div aria-modal="true" className="filter-picker__dialog" role="dialog">
              <div className="filter-picker__header">
                <h3 className="filter-picker__title">Select network</h3>
                <button
                  aria-label="Close coin filter"
                  className="filter-picker__close"
                  onClick={() => {
                    setIsFilterPickerOpen(false);
                  }}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="filter-picker__body">
                <div className="filter-picker__section">
                <p className="filter-picker__section-label">All</p>

                  <div className="filter-picker__list popup-scroll">
                  {FILTER_OPTIONS.map((filterOption) => {
                    const isAllOption = filterOption === 'ALL';
                    const isSelected = selectedFilter === filterOption;
                    const optionCoinData = !isAllOption ? coinDataByType[filterOption] ?? null : null;
                    const optionName = getFilterDisplayName(filterOption);

                    return (
                      <button
                        className={classNames(
                          'filter-picker__item',
                          isSelected && 'filter-picker__item--active',
                        )}
                        key={filterOption}
                        onClick={() => {
                          setSelectedFilter(filterOption);
                          setIsFilterPickerOpen(false);
                        }}
                        type="button"
                      >
                        <div className="filter-picker__item-content">
                          {optionCoinData?.image ? (
                            <img
                              alt={`${optionName} logo`}
                              className="filter-picker__avatar"
                              height={36}
                              loading="lazy"
                              src={optionCoinData.image}
                              width={36}
                            />
                          ) : (
                            <span
                              className={classNames(
                                'filter-picker__avatar',
                                'filter-picker__avatar--fallback',
                                isAllOption && 'filter-picker__avatar--all',
                              )}
                            >
                              {isAllOption ? 'A' : filterOption.slice(0, 1)}
                            </span>
                          )}

                          <span className="filter-picker__item-name">{optionName}</span>
                        </div>

                        {isSelected ? (
                          <span className="filter-picker__item-state">Selected</span>
                        ) : null}
                      </button>
                    );
                  })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isAddressesLoading ? (
            <p className="feedback-banner feedback-banner--loading">
              <LoadingDots label="Loading addresses" />
            </p>
          ) : null}

          {!isAddressesLoading && !addressesError && totalCount === 0 ? (
            <div className="empty-state">
              <div className="empty-state__orb" aria-hidden="true" />
              <p className="text-base font-semibold text-white">No addresses yet</p>
              <p className="max-w-[26ch] text-sm leading-6 text-slate-400">{emptyDescription}</p>
            </div>
          ) : null}

          {!isAddressesLoading && !addressesError && totalCount > 0 && visibleAddresses.length === 0 ? (
            <div className="empty-state empty-state--compact">
              <div className="empty-state__orb" aria-hidden="true" />
              <p className="text-base font-semibold text-white">No addresses found</p>
              <p className="text-sm leading-6 text-slate-400">
                Try a different search term or filter.
              </p>
            </div>
          ) : null}

          {!isAddressesLoading && !addressesError && visibleAddresses.length > 0 ? (
            <div className="space-y-3">
              {visibleAddresses.map((savedAddress) => {
                const isEditingItem = editingId === savedAddress.id;
                const isDeletingItem = pendingAddressId === savedAddress.id;
                const isHighlightedDuplicate = highlightedDuplicateId === savedAddress.id;
                const isEnteringItem = enteringAddressIds.includes(savedAddress.id);
                const isRemovingItem = removingAddressId === savedAddress.id;
                const cardCoinData = coinDataByType[savedAddress.type] ?? null;
                const isCardCoinLoading = Boolean(loadingCoinTypes[savedAddress.type]);
                const cardCoinLine = cardCoinData
                  ? `${cardCoinData.name} (${cardCoinData.symbol})`
                  : isCardCoinLoading
                    ? 'Loading coin info...'
                    : savedAddress.type;

                return (
                  <article
                    className={classNames(
                      'address-card',
                      isEditingItem && 'address-card--editing',
                      isHighlightedDuplicate && 'address-card--duplicate',
                      isEnteringItem && 'address-card--entering',
                      isRemovingItem && 'address-card--removing',
                    )}
                    key={savedAddress.id}
                  >
                    <div className="flex items-start gap-3">
                      <div className="coin-shell">
                        {cardCoinData?.image ? (
                          <img
                            alt={`${cardCoinLine} logo`}
                            className="h-9 w-9 rounded-full object-cover"
                            height={36}
                            loading="lazy"
                            src={cardCoinData.image}
                            width={36}
                          />
                        ) : isCardCoinLoading ? (
                          <span className="spinner" aria-hidden="true" />
                        ) : (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                            {savedAddress.type}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[15px] font-semibold text-white">
                            {getDisplayLabel(savedAddress.label, savedAddress.type)}
                          </h3>
                          <span className="type-badge">{savedAddress.type}</span>
                          <span className="soft-tag soft-tag--muted">
                            {getDirectionLabel(savedAddress.direction)}
                          </span>
                          {isEditingItem ? (
                            <span className="soft-tag soft-tag--accent">
                              Editing
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-[12px] font-medium text-slate-300">
                          {cardCoinLine}
                        </p>
                        <p className="truncate text-[12px] text-slate-400">
                          {truncateAddress(savedAddress.address)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        className="popup-ghost-button popup-ghost-button--sm"
                        disabled={loading || pendingAddressId !== null}
                        onClick={() => {
                          handleStartEdit(savedAddress);
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className={classNames(
                          'popup-ghost-button popup-ghost-button--sm',
                          copiedAddressId === savedAddress.id && 'popup-ghost-button--copied',
                        )}
                        disabled={isDeletingItem}
                        onClick={() => {
                          void handleCopyAddress(savedAddress);
                        }}
                        type="button"
                      >
                        {copiedAddressId === savedAddress.id ? 'Copied ✅' : 'Copy'}
                      </button>
                      <button
                        className="popup-ghost-button popup-ghost-button--danger popup-ghost-button--sm"
                        disabled={loading || pendingAddressId !== null}
                        onClick={() => {
                          handleDeleteAddress(savedAddress);
                        }}
                        type="button"
                      >
                        {isDeletingItem ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    }

    if (isSaveScreenOpen) {
      return (
        <SaveScreen
          address={address}
          addressErrorMessage={addressErrorMessage}
          addressInputRef={addressInputRef}
          detectedCoinData={detectedCoinData}
          detectedType={detectedType}
          direction={direction}
          headerAction={renderThemeToggleControl('ml-auto')}
          isDetectedCoinDataLoading={isDetectedCoinDataLoading}
          isEditing={Boolean(editingId)}
          isSaveDisabled={isSaveDisabled}
          isShakingAddressInput={isAddressInputShaking}
          label={label}
          loading={loading}
          onAddressChange={handleAddressChange}
          onBack={handleBackFromSaveScreen}
          onCancel={handleCancelEdit}
          onLabelChange={setLabel}
          onDirectionChange={setDirection}
          onSubmit={handleAddressSubmit}
        />
      );
    }

    if (isSendScreenOpen) {
      return (
        <PortfolioScreen
          direction="SENDING"
          headerAction={renderThemeToggleControl('ml-auto')}
          onAddAddress={() => {
            handleOpenSaveScreen({
              direction: 'SENDING',
              returnScreen: 'send',
            });
          }}
          onBack={() => setActiveScreen('home')}
          portfolio={renderPortfolioSection({
            directionFilter: 'SENDING',
            title: 'Sending addresses',
            description: 'Copy, update, or remove the addresses you use when funds move out.',
            emptyDescription: 'Add your first sending address from the button above.',
            hideIntro: true,
          })}
        />
      );
    }

    if (isReceiveScreenOpen) {
      return (
        <PortfolioScreen
          direction="RECEIVING"
          headerAction={renderThemeToggleControl('ml-auto')}
          onAddAddress={() => {
            handleOpenSaveScreen({
              direction: 'RECEIVING',
              returnScreen: 'receive',
            });
          }}
          onBack={() => setActiveScreen('home')}
          portfolio={renderPortfolioSection({
            directionFilter: 'RECEIVING',
            title: 'Receiving addresses',
            description: 'Copy, update, or remove the addresses you use when funds come in.',
            emptyDescription: 'Add your first receiving address from the button above.',
            hideIntro: true,
          })}
        />
      );
    }

    if (isSwapScreenOpen) {
      return (
        <section className="popup-screen page-app">
          <header className="page-app__header">
            <button
              aria-label="Back"
              className="page-app__back"
              onClick={() => setActiveScreen('home')}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
              >
                <path
                  d="M12.5 4.5L7 10l5.5 5.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
            <h1 className="page-app__title">Swap</h1>
            {renderThemeToggleControl('ml-auto')}
          </header>

          <main className="page-app__content popup-scroll">
            <SwapPanel isOpen />
          </main>
        </section>
      );
    }

    if (isMarketScreenOpen) {
      return (
        <section className="popup-screen market-app">
          <header className="market-app__header">
            <button
              aria-label="Back"
              className="market-app__back"
              onClick={() => setActiveScreen('home')}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
              >
                <path
                  d="M12.5 4.5L7 10l5.5 5.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
            <h1 className="market-app__title">Market</h1>
            {renderThemeToggleControl('ml-auto')}
          </header>

          <main className="market-app__content popup-scroll">
            <MarketPanel isOpen />
          </main>
        </section>
      );
    }

    return (
      <HomeScreen
        themeToggleControl={renderThemeToggleControl()}
        onLogout={handleLogout}
        onOpenMarket={() => setActiveScreen('market')}
        onOpenReceive={() => handleOpenDirectionalPortfolio('RECEIVING')}
        onOpenSave={() =>
          handleOpenSaveScreen({
            returnScreen: 'home',
          })
        }
        onOpenSend={() => handleOpenDirectionalPortfolio('SENDING')}
        onOpenSwap={() => setActiveScreen('swap')}
      />
    );
  }

  return (
    <main
      className={classNames(
        'popup-shell',
        (isMarketScreenOpen ||
          isSwapScreenOpen ||
          isSendScreenOpen ||
          isReceiveScreenOpen ||
          isSaveScreenOpen) &&
          'popup-shell--edge',
      )}
    >
      {!(isMarketScreenOpen ||
        isSwapScreenOpen ||
        isSendScreenOpen ||
        isReceiveScreenOpen ||
        isSaveScreenOpen) ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-cyan-400/14 blur-3xl" />
          <div className="absolute right-[-28px] top-0 h-24 w-24 rounded-full bg-indigo-400/14 blur-3xl" />
          <div className="absolute bottom-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-sky-400/8 blur-3xl" />
        </div>
      ) : null}

      {renderAuthenticatedScreen()}

      <div className="toast-layer" aria-live="polite">
        {toast ? (
          <div
            className={classNames(
              'toast-pill',
              `toast-pill--${toast.kind}`,
              isToastLeaving && 'toast-pill--leaving',
            )}
            key={toast.id}
          >
            {toast.message}
          </div>
        ) : null}
      </div>
    </main>
  );
}
