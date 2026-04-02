declare const __EZ_CRYPT0_API_BASE_URL__: string;

type BackgroundCryptoType = 'ETH' | 'BTC';
const LAST_DETECTED_ADDRESS_KEY = 'lastDetectedAddress';
const AUTH_TOKEN_KEY = 'authToken';
const API_BASE_URL = __EZ_CRYPT0_API_BASE_URL__;
const ADDRESS_API_PATH = '/addresses';
const LOGIN_API_PATH = '/auth/login';

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
  payload: StoredDetectedAddress;
}

interface LoginMessage {
  type: 'LOGIN';
  payload: {
    email: string;
    password: string;
  };
}

interface StoredDetectedAddress {
  address: string;
  type: BackgroundCryptoType;
}

interface ConfirmSaveResponse {
  success: boolean;
  error?: string;
}

interface LoginResponse {
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
  body: unknown;
  token?: string;
}

interface ApiRequestResult {
  response: Response;
  url: string;
}

function getSessionValue<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.session.get(key, (result) => {
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

async function postToApi(path: string, options: ApiRequestOptions): Promise<ApiRequestResult> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify(options.body),
  });

  return {
    response,
    url,
  };
}

async function saveAddressToApi(
  addressPayload: StoredDetectedAddress,
  options?: { clearDetectedAddress?: boolean },
): Promise<ConfirmSaveResponse> {
  const authToken = await getSessionValue<string>(AUTH_TOKEN_KEY);

  if (!authToken) {
    console.error('Missing auth token');
    return {
      success: false,
      error: 'Please log in before saving an address.',
    };
  }

  try {
    const { response, url } = await postToApi(ADDRESS_API_PATH, {
      body: addressPayload,
      token: authToken,
    });

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

type ExtensionMessage =
  | AddressDetectedMessage
  | ConfirmSaveMessage
  | SaveAddressMessage
  | LoginMessage;

// Manifest V3 service workers must stay stateless between wake-ups.
// Future auth and API orchestration belongs here, not in the content script.
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
        } satisfies ConfirmSaveResponse);
        return;
      }

      const result = await saveAddressToApi(storedAddress, { clearDetectedAddress: true });
      sendResponse(result satisfies ConfirmSaveResponse);
    })();

    return true;
  }

  if (message.type === 'SAVE_ADDRESS') {
    void (async () => {
      const result = await saveAddressToApi(message.payload);
      sendResponse(result satisfies ConfirmSaveResponse);
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

  return undefined;
});
