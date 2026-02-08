/**
 * ORIGIN X - Authentication Context
 * Provides global authentication state management
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { getCurrentUser, logout as apiLogout } from '../services/api';

interface AuthContextType {
  user: Pick<User, 'id' | 'username' | 'email'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Pick<User, 'id' | 'username' | 'email'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshAuth,
        logout
      }}
    >
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
