import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  changePassword as changePasswordRequest,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
  type ChangePasswordPayload,
  type CurrentUser,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
} from '../api/auth.api';

export interface AuthContextValue {
  changeUserPassword: (data: ChangePasswordPayload) => Promise<void>;
  fetchCurrentUser: () => Promise<CurrentUser | null>;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginPayload) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  register: (data: RegisterPayload) => Promise<CurrentUser>;
  updateUser: (data: UpdateProfilePayload) => Promise<CurrentUser>;
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

  const updateUser = useCallback(async (data: UpdateProfilePayload) => {
    const updatedUser = await updateProfileRequest(data);
    setUser(updatedUser);
    setIsAuthenticated(true);
    return updatedUser;
  }, []);

  const changeUserPassword = useCallback(async (data: ChangePasswordPayload) => {
    await changePasswordRequest(data);
    setIsAuthenticated(true);
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
        updateUser,
        changeUserPassword,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
