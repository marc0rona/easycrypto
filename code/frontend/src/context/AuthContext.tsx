import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  type CurrentUser,
  type LoginPayload,
  type RegisterPayload,
} from '../api/auth.api';

export interface AuthContextValue {
  fetchCurrentUser: () => Promise<CurrentUser | null>;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginPayload) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  register: (data: RegisterPayload) => Promise<CurrentUser>;
  user: CurrentUser | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));
      return currentUser;
    } catch (error) {
      console.error('Failed to fetch current user.', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginPayload) => {
    setLoading(true);

    try {
      const response = await loginRequest(data);
      setUser(response.user);
      setIsAuthenticated(true);
      return response.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    setLoading(true);

    try {
      const response = await registerRequest(data);
      setUser(response.user);
      setIsAuthenticated(true);
      return response.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await logoutRequest();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
