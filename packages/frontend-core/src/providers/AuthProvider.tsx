import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Session } from '@workspace/shared-types';
import { authApi, apiClient } from '@workspace/api-client';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionData = await authApi.refreshToken();
        if (sessionData?.accessToken) {
          apiClient.setToken(sessionData.accessToken);
          setSession(sessionData);
          const user = await authApi.getCurrentUser();
          setUser(user);
        }
      } catch (err) {
        // failed to refresh
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();

    apiClient.onUnauthorized(() => {
      setUser(null);
      setSession(null);
      apiClient.setToken(null);
    });
  }, []);

  const login = async (data: any) => {
    queryClient.clear();
    const sessionData = await authApi.login(data);
    
    if (sessionData.accessToken) {
      apiClient.setToken(sessionData.accessToken);
    }
    
    setSession(sessionData);
    setUser(sessionData.user);
  };

  const logout = async () => {
    await authApi.logout();
    queryClient.clear();
    apiClient.setToken(null);
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
