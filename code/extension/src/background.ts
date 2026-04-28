declare const __EZ_CRYPT0_API_BASE_URL__: string;

export {};

type BackgroundCryptoType =
  | 'ADA'
  | 'ATOM'
  | 'BTC'
  | 'DOGE'
  | 'DOT'
  | 'ETH'
  | 'LTC'
  | 'SOL'
  | 'TON'
  | 'TRX'
  | 'XRP';
type AddressDirection = 'RECEIVING' | 'SENDING';
type AddressListItem = {
  id: string;
  address: string;
  direction: AddressDirection;
  label: string | null;
  type: BackgroundCryptoType;
};
const LAST_DETECTED_ADDRESS_KEY = 'lastDetectedAddress';
const AUTH_TOKEN_KEY = 'authToken';
const WORKING_API_BASE_URL_KEY = 'workingApiBaseUrl';
const ADDRESS_API_PATH = '/addresses/from-extension';
const ADDRESS_LIST_API_PATH = '/addresses';
const LOGIN_API_PATH = '/auth/login';
const LOGOUT_API_PATH = '/auth/logout';
const REFRESH_API_PATH = '/auth/refresh';

function createApiBaseUrls(apiBaseUrl: string): string[] {
  const apiBaseUrls = [apiBaseUrl];

  try {
    const parsedApiUrl = new URL(apiBaseUrl);

    if (parsedApiUrl.protocol === 'http:' && parsedApiUrl.hostname === 'localhost') {
      parsedApiUrl.hostname = '127.0.0.1';
      apiBaseUrls.push(parsedApiUrl.toString().replace(/\/+$/, ''));
    } else if (parsedApiUrl.protocol === 'http:' && parsedApiUrl.hostname === '127.0.0.1') {
      parsedApiUrl.hostname = 'localhost';
      apiBaseUrls.push(parsedApiUrl.toString().replace(/\/+$/, ''));
    }
  } catch (error) {
    console.warn('Failed to parse API base URL', error);
  }

  return Array.from(new Set(apiBaseUrls));
}

const API_BASE_URLS = createApiBaseUrls(__EZ_CRYPT0_API_BASE_URL__);

function normalizeBackgroundCryptoType(value: unknown): BackgroundCryptoType | null {
  if (
    value === 'BTC' ||
    value === 'DOGE' ||
    value === 'DOT' ||
    value === 'ETH' ||
    value === 'LTC' ||
    value === 'ADA' ||
    value === 'ATOM' ||
    value === 'SOL' ||
    value === 'TON' ||
    value === 'TRX' ||
    value === 'XRP'
  ) {
    return value;
  }

  return null;
}

interface AddressDetectedMessage {
  type: 'ADDRESS_DETECTED';
  payload: {
    address: string;
    type: BackgroundCryptoType;
  };
}

interface ConfirmSaveMessage {
  type: 'CONFIRM_SAVE';
}

interface SaveAddressMessage {
  type: 'SAVE_ADDRESS';
  payload: {
    address: string;
    direction: AddressDirection;
    label: string;
    type: BackgroundCryptoType;
  };
}

interface GetAddressesMessage {
  type: 'GET_ADDRESSES';
}

interface DeleteAddressMessage {
  type: 'DELETE_ADDRESS';
  payload: {
    id: string;
  };
}

interface UpdateAddressMessage {
  type: 'UPDATE_ADDRESS';
  payload: {
    id: string;
    address: string;
    direction: AddressDirection;
    label: string;
    type: BackgroundCryptoType;
  };
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

interface StoredDetectedAddress {
  address: string;
  direction?: AddressDirection;
  label?: string;
  type: BackgroundCryptoType;
}

interface PersistedAddressPayload {
  address: string;
  direction?: AddressDirection;
  label?: string;
  type: BackgroundCryptoType;
}

interface ConfirmSaveResponse {
  success: boolean;
  error?: string;
}

interface MutationResponse {
  success: boolean;
  error?: string;
}

interface LoginResponse {
  success: boolean;
  error?: string;
}

interface LogoutResponse {
  success: boolean;
  error?: string;
}

interface GetAddressesResponse {
  success: boolean;
  data?: AddressListItem[];
  error?: string;
}

interface RestoreSessionResponse {
  authenticated: boolean;
  success: boolean;
  error?: string;
}

interface LoginApiResponse {
  success?: boolean;
  data?: {
    token?: string;
  };
}

interface ApiRequestOptions {
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  token?: string;
}

interface ApiRequestResult {
  response: Response;
  url: string;
  apiBaseUrl: string;
}

interface AddressListApiResponse {
  success?: boolean;
  data?: AddressListApiRecord[];
}

interface AddressListApiRecord {
  id?: unknown;
  address?: unknown;
  direction?: unknown;
  label?: unknown;
  type?: unknown;
  createdAt?: unknown;
}

function normalizeAddressDirection(value: unknown): AddressDirection | null {
  if (value === 'RECEIVING' || value === 'SENDING') {
    return value;
  }

  return null;
}

function getSessionValue<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.session.get(key, (result) => {
      resolve(result[key] as T | undefined);
    });
  });
}

function getLocalValue<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] as T | undefined);
    });
  });
}

function setSessionValues(values: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.session.set(values, () => {
      resolve();
    });
  });
}

function removeSessionValue(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.session.remove(key, () => {
      resolve();
    });
  });
}

function setLocalValues(values: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(values, () => {
      resolve();
    });
  });
}

async function getApiBaseUrls(): Promise<string[]> {
  const storedApiBaseUrl = await getLocalValue<string>(WORKING_API_BASE_URL_KEY);

  if (!storedApiBaseUrl || !API_BASE_URLS.includes(storedApiBaseUrl)) {
    return API_BASE_URLS;
  }

  return [storedApiBaseUrl, ...API_BASE_URLS.filter((apiBaseUrl) => apiBaseUrl !== storedApiBaseUrl)];
}

function shouldTryNextApiBaseUrl(response: Response): boolean {
  return response.status === 404 || response.status === 405;
}

async function postToApi(path: string, options: ApiRequestOptions): Promise<ApiRequestResult> {
  const apiBaseUrls = await getApiBaseUrls();
  let lastResponse: ApiRequestResult | null = null;
  let lastError: unknown;

  for (const apiBaseUrl of apiBaseUrls) {
    const url = `${apiBaseUrl}${path}`;

    try {
      const method = options.method ?? (options.body === undefined ? 'GET' : 'POST');
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        },
        ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      });

      const result = {
        response,
        url,
        apiBaseUrl,
      } satisfies ApiRequestResult;

      if (response.ok) {
        await setLocalValues({
          [WORKING_API_BASE_URL_KEY]: apiBaseUrl,
        });

        return result;
      }

      if (shouldTryNextApiBaseUrl(response)) {
        lastResponse = result;
        continue;
      }

      return result;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError ?? new Error('Unable to reach any configured API base URL.');
}

async function restoreSessionToken(): Promise<string | null> {
  try {
    const { response, url } = await postToApi(REFRESH_API_PATH, {
      method: 'POST',
    });

    if (!response.ok) {
      console.error(`Session refresh failed via ${url}`, response.status);
      await removeSessionValue(AUTH_TOKEN_KEY);
      return null;
    }

    const responseBody = (await response.json()) as LoginApiResponse;
    const token = responseBody.data?.token;

    if (typeof token !== 'string' || !token) {
      await removeSessionValue(AUTH_TOKEN_KEY);
      return null;
    }

    await setSessionValues({
      [AUTH_TOKEN_KEY]: token,
    });

    return token;
  } catch (error) {
    console.error('Session refresh failed', error);
    return null;
  }
}

async function getOrRestoreAuthToken(): Promise<string | null> {
  const existingToken = await getSessionValue<string>(AUTH_TOKEN_KEY);

  if (existingToken) {
    return existingToken;
  }

  return restoreSessionToken();
}

async function performAuthenticatedApiRequest(
  path: string,
  options: Omit<ApiRequestOptions, 'token'>,
): Promise<ApiRequestResult | null> {
  let authToken = await getOrRestoreAuthToken();

  if (!authToken) {
    return null;
  }

  let result = await postToApi(path, {
    ...options,
    token: authToken,
  });

  if (result.response.status !== 401) {
    return result;
  }

  authToken = await restoreSessionToken();

  if (!authToken) {
    return null;
  }

  result = await postToApi(path, {
    ...options,
    token: authToken,
  });

  if (result.response.status === 401) {
    await removeSessionValue(AUTH_TOKEN_KEY);
    return null;
  }

  return result;
}

async function saveAddressToApi(
  addressPayload: PersistedAddressPayload,
  options?: { clearDetectedAddress?: boolean },
): Promise<MutationResponse> {
  try {
    const result = await performAuthenticatedApiRequest(ADDRESS_API_PATH, {
      body: addressPayload,
    });

    if (!result) {
      return {
        success: false,
        error: 'Please log in before saving an address.',
      };
    }

    const { response, url } = result;

    if (!response.ok) {
      console.error(`Failed to save address via ${url}`, response.status);
      return {
        success: false,
        error: response.status === 401 ? 'Your session expired. Please log in again.' : 'Failed to save address',
      };
    }

    if (options?.clearDetectedAddress) {
      await chrome.storage.session.remove(LAST_DETECTED_ADDRESS_KEY);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to save address', error);
    return {
      success: false,
      error: 'Unable to reach the EZ-CRYPT0 API.',
    };
  }
}

async function updateAddressInApi(payload: {
  id: string;
  address: string;
  direction: AddressDirection;
  label: string;
  type: BackgroundCryptoType;
}): Promise<MutationResponse> {
  try {
    const result = await performAuthenticatedApiRequest(`${ADDRESS_LIST_API_PATH}/${payload.id}`, {
      method: 'PATCH',
      body: {
        address: payload.address,
        direction: payload.direction,
        label: payload.label,
        type: payload.type,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Please log in before updating an address.',
      };
    }

    const { response, url } = result;

    if (!response.ok) {
      console.error(`Failed to update address via ${url}`, response.status);
      return {
        success: false,
        error:
          response.status === 401
            ? 'Your session expired. Please log in again.'
            : 'Failed to update address',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to update address', error);
    return {
      success: false,
      error: 'Unable to reach the EZ-CRYPT0 API.',
    };
  }
}

async function deleteAddressInApi(id: string): Promise<MutationResponse> {
  try {
    const result = await performAuthenticatedApiRequest(`${ADDRESS_LIST_API_PATH}/${id}`, {
      method: 'DELETE',
    });

    if (!result) {
      return {
        success: false,
        error: 'Please log in before deleting an address.',
      };
    }

    const { response, url } = result;

    if (!response.ok) {
      console.error(`Failed to delete address via ${url}`, response.status);
      return {
        success: false,
        error:
          response.status === 401
            ? 'Your session expired. Please log in again.'
            : 'Failed to delete address',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to delete address', error);
    return {
      success: false,
      error: 'Unable to reach the EZ-CRYPT0 API.',
    };
  }
}

async function loginToApi(email: string, password: string): Promise<LoginResponse> {
  try {
    const { response, url } = await postToApi(LOGIN_API_PATH, {
      body: {
        email,
        password,
      },
    });

    if (!response.ok) {
      console.error(`Login failed via ${url}`, response.status);
      return {
        success: false,
        error:
          response.status === 401
            ? 'Invalid credentials'
            : response.status === 403
              ? 'Account access denied'
              : 'Login request failed',
      };
    }

    const responseBody = (await response.json()) as LoginApiResponse;
    const token = responseBody.data?.token;

    if (typeof token !== 'string' || !token) {
      return {
        success: false,
        error: 'Login response did not include a token.',
      };
    }

    await setSessionValues({
      [AUTH_TOKEN_KEY]: token,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Login failed', error);
    return {
      success: false,
      error: 'Unable to reach the EZ-CRYPT0 API.',
    };
  }
}

async function logoutFromApi(): Promise<LogoutResponse> {
  try {
    const { response, url } = await postToApi(LOGOUT_API_PATH, {
      method: 'POST',
    });

    await removeSessionValue(AUTH_TOKEN_KEY);

    if (!response.ok) {
      console.error(`Logout failed via ${url}`, response.status);
      return {
        success: false,
        error: 'Failed to log out from the EZ-CRYPT0 API.',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Logout failed', error);
    await removeSessionValue(AUTH_TOKEN_KEY);
    return {
      success: false,
      error: 'Unable to reach the EZ-CRYPT0 API.',
    };
  }
}

async function restoreSession(): Promise<RestoreSessionResponse> {
  const token = await getOrRestoreAuthToken();

  return {
    success: true,
    authenticated: Boolean(token),
  };
}

function normalizeAddressListItem(item: AddressListApiRecord): (AddressListItem & {
  createdAtTimestamp: number;
}) | null {
  if (!item) {
    return null;
  }

  if (
    typeof item.id !== 'string' ||
    typeof item.address !== 'string' ||
    typeof item.type !== 'string'
  ) {
    return null;
  }

  const normalizedType = normalizeBackgroundCryptoType(item.type);

  if (!normalizedType) {
    return null;
  }

  const createdAtTimestamp =
    typeof item.createdAt === 'string' ? Date.parse(item.createdAt) || 0 : 0;
  const direction = normalizeAddressDirection(item.direction) ?? 'RECEIVING';

  return {
    id: item.id,
    address: item.address,
    direction,
    label: typeof item.label === 'string' ? item.label : null,
    type: normalizedType,
    createdAtTimestamp,
  };
}

async function getAddressesFromApi(): Promise<GetAddressesResponse> {
  try {
    const result = await performAuthenticatedApiRequest(ADDRESS_LIST_API_PATH, {
      method: 'GET',
    });

    if (!result) {
      return {
        success: false,
        error: 'Please log in before viewing saved addresses.',
      };
    }

    const { response, url } = result;

    if (!response.ok) {
      console.error(`Failed to fetch addresses via ${url}`, response.status);
      return {
        success: false,
        error:
          response.status === 401
            ? 'Your session expired. Please log in again.'
            : 'Failed to load saved addresses.',
      };
    }

    const responseBody = (await response.json()) as AddressListApiResponse;
    const addresses = Array.isArray(responseBody.data)
      ? responseBody.data
          .map(normalizeAddressListItem)
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .sort((left, right) => right.createdAtTimestamp - left.createdAtTimestamp)
          .map(({ createdAtTimestamp: _createdAtTimestamp, ...item }) => item)
      : [];

    return {
      success: true,
      data: addresses,
    };
  } catch (error) {
    console.error('Failed to fetch addresses', error);
    return {
      success: false,
      error: 'Unable to reach the EZ-CRYPT0 API.',
    };
  }
}

type ExtensionMessage =
  | AddressDetectedMessage
  | ConfirmSaveMessage
  | SaveAddressMessage
  | GetAddressesMessage
  | DeleteAddressMessage
  | UpdateAddressMessage
  | LoginMessage
  | LogoutMessage
  | RestoreSessionMessage;

chrome.runtime.onInstalled.addListener(() => {
  // Foundation only.
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'ADDRESS_DETECTED') {
    chrome.storage.session.set({
      [LAST_DETECTED_ADDRESS_KEY]: message.payload,
    });
    return;
  }

  if (message.type === 'CONFIRM_SAVE') {
    void (async () => {
      const storedAddress = await getSessionValue<StoredDetectedAddress>(LAST_DETECTED_ADDRESS_KEY);

      if (!storedAddress) {
        console.error('Failed to save address');
        sendResponse({
          success: false,
          error: 'No detected address is ready to save.',
        } satisfies MutationResponse);
        return;
      }

      const result = await saveAddressToApi(storedAddress, { clearDetectedAddress: true });
      sendResponse(result satisfies MutationResponse);
    })();

    return true;
  }

  if (message.type === 'SAVE_ADDRESS') {
    void (async () => {
      const result = await saveAddressToApi(message.payload);
      sendResponse(result satisfies MutationResponse);
    })();

    return true;
  }

  if (message.type === 'UPDATE_ADDRESS') {
    void (async () => {
      const result = await updateAddressInApi(message.payload);
      sendResponse(result satisfies MutationResponse);
    })();

    return true;
  }

  if (message.type === 'DELETE_ADDRESS') {
    void (async () => {
      const result = await deleteAddressInApi(message.payload.id);
      sendResponse(result satisfies MutationResponse);
    })();

    return true;
  }

  if (message.type === 'LOGIN') {
    void (async () => {
      const result = await loginToApi(message.payload.email, message.payload.password);
      sendResponse(result satisfies LoginResponse);
    })();

    return true;
  }

  if (message.type === 'LOGOUT') {
    void (async () => {
      const result = await logoutFromApi();
      sendResponse(result satisfies LogoutResponse);
    })();

    return true;
  }

  if (message.type === 'RESTORE_SESSION') {
    void (async () => {
      const result = await restoreSession();
      sendResponse(result satisfies RestoreSessionResponse);
    })();

    return true;
  }

  if (message.type === 'GET_ADDRESSES') {
    void (async () => {
      const result = await getAddressesFromApi();
      sendResponse(result satisfies GetAddressesResponse);
    })();

    return true;
  }

  return undefined;
});
