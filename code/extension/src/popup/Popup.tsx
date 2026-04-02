import { useEffect, useState } from 'react';

type CryptoType = 'ETH' | 'BTC';

const AUTH_TOKEN_KEY = 'authToken';

interface SaveAddressMessage {
  type: 'SAVE_ADDRESS';
  payload: {
    address: string;
    type: CryptoType;
  };
}

interface SaveAddressResponse {
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

interface LoginResponse {
  success: boolean;
  error?: string;
}

const inputStyle = {
  width: '100%',
  minHeight: '42px',
  padding: '0 14px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '14px',
  background: 'rgba(15, 23, 42, 0.72)',
  color: '#f8fbff',
} satisfies React.CSSProperties;

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
} satisfies React.CSSProperties;

const formStyle = {
  display: 'grid',
  gap: '12px',
  width: '100%',
} satisfies React.CSSProperties;

const headerActionsStyle = {
  marginLeft: 'auto',
} satisfies React.CSSProperties;

const singleActionStyle = {
  gridTemplateColumns: '1fr',
} satisfies React.CSSProperties;

function validateAddress(address: string, type: CryptoType): string | null {
  if (!address) {
    return 'Address is required';
  }

  if (type === 'ETH' && !address.startsWith('0x')) {
    return 'Invalid address';
  }

  if (type === 'BTC' && !/^(1|3|bc1)/i.test(address)) {
    return 'Invalid address';
  }

  return null;
}

export function Popup() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [addressType, setAddressType] = useState<CryptoType>('ETH');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.session.get(AUTH_TOKEN_KEY, (result) => {
      const authToken = result[AUTH_TOKEN_KEY] as string | undefined;
      setIsAuthenticated(Boolean(authToken));
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

      if (!nextToken) {
        setPassword('');
        setAddress('');
        setAddressType('ETH');
        setLoading(false);
        setSuccess(false);
        setError(null);
        setAuthError(null);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!success) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setSuccess(false);
    }, 2000);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [success]);

  const handleLogin = () => {
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
        setAuthError(response?.error ?? 'Invalid credentials');
        return;
      }

      setIsAuthenticated(true);
      setPassword('');
      setAuthError(null);
    });
  };

  const handleLogout = () => {
    chrome.storage.session.remove(AUTH_TOKEN_KEY, () => {
      setIsAuthenticated(false);
      setPassword('');
      setAddress('');
      setAddressType('ETH');
      setLoading(false);
      setSuccess(false);
      setError(null);
      setAuthError(null);
    });
  };

  const handleAddressChange = (nextAddress: string) => {
    setAddress(nextAddress);
    setError(null);
    setSuccess(false);
  };

  const handleAddressTypeChange = (nextType: CryptoType) => {
    setAddressType(nextType);
    setError(null);
    setSuccess(false);
  };

  const handleSaveAddress = () => {
    const trimmedAddress = address.trim();
    const validationError = validateAddress(trimmedAddress, addressType);

    if (validationError) {
      setSuccess(false);
      setError(validationError);
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);

    const message: SaveAddressMessage = {
      type: 'SAVE_ADDRESS',
      payload: {
        address: trimmedAddress,
        type: addressType,
      },
    };

    chrome.runtime.sendMessage(message, (response?: SaveAddressResponse) => {
      if (chrome.runtime.lastError || !response?.success) {
        setLoading(false);
        setSuccess(false);
        setError(response?.error ?? 'Failed to save address');
        return;
      }

      setLoading(false);
      setSuccess(true);
      setError(null);
      setAddress('');
    });
  };

  if (!isAuthenticated) {
    return (
      <main className="popup">
        <header className="popup__header">
          <div className="popup__brand-mark" aria-hidden="true" />
          <div>
            <p className="popup__eyebrow">Chrome Extension</p>
            <h1 className="popup__title">Login</h1>
          </div>
        </header>

        <section className="popup__body" aria-live="polite">
          <div className="popup__panel">
            <div style={formStyle}>
              <input
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setAuthError(null);
                }}
                placeholder="Email"
                style={inputStyle}
                type="email"
                value={email}
              />
              <input
                autoComplete="current-password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setAuthError(null);
                }}
                placeholder="Password"
                style={inputStyle}
                type="password"
                value={password}
              />
            </div>

            {authError ? <p className="popup__feedback popup__feedback--error">{authError}</p> : null}

            <div className="popup__actions" style={singleActionStyle}>
              <button
                className="popup__button popup__button--primary"
                disabled={isLoggingIn}
                onClick={handleLogin}
                type="button"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </div>
        </section>

        <footer className="popup__footer">
          <p className="popup__footer-text">Extension ready</p>
        </footer>
      </main>
    );
  }

  return (
    <main className="popup">
      <header className="popup__header">
        <div className="popup__brand-mark" aria-hidden="true" />
        <div>
          <p className="popup__eyebrow">Chrome Extension</p>
          <h1 className="popup__title">EZ-CRYPT0</h1>
        </div>
        <div style={headerActionsStyle}>
          <button className="popup__button popup__button--secondary" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      <section className="popup__body" aria-live="polite">
        <div className="popup__panel">
          <p className="popup__status">Save a crypto address</p>
          <p className="popup__description">
            Enter an ETH or BTC address manually and save it to your account.
          </p>

          <div style={formStyle}>
            <input
              onChange={(event) => handleAddressChange(event.target.value)}
              placeholder="Enter a wallet address"
              style={inputStyle}
              type="text"
              value={address}
            />
            <select
              onChange={(event) => handleAddressTypeChange(event.target.value as CryptoType)}
              style={selectStyle}
              value={addressType}
            >
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
            </select>
          </div>

          {loading ? <p className="popup__feedback popup__feedback--loading">Saving...</p> : null}
          {success ? <p className="popup__feedback popup__feedback--success">Address saved</p> : null}
          {error ? <p className="popup__feedback popup__feedback--error">{error}</p> : null}

          <div className="popup__actions" style={singleActionStyle}>
            <button
              className="popup__button popup__button--primary"
              disabled={loading}
              onClick={handleSaveAddress}
              type="button"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </div>
      </section>

      <footer className="popup__footer">
        <p className="popup__footer-text">Extension ready</p>
      </footer>
    </main>
  );
}
