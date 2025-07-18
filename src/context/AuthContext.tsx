import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: { email?: string; username?: string; password: string }, role: 'admin' | 'delivery-boy') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setToken(token);
      // Verify token is still valid
      apiService.getCurrentUser()
        .then((response: any) => {
          setUser(response.user);
        })
        .catch(() => {
          // Token is invalid, clear it
          apiService.clearToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    credentials: { email?: string; username?: string; password: string }, 
    role: 'admin' | 'delivery-boy'
  ): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      let response: AuthResponse;
      
      if (role === 'admin' && credentials.email) {
        response = await apiService.adminLogin(credentials.email, credentials.password);
      } else if (role === 'delivery-boy' && credentials.username) {
        response = await apiService.deliveryBoyLogin(credentials.username, credentials.password);
      } else {
        throw new Error('Invalid credentials format');
      }
      
      apiService.setToken(response.token);
      setUser(response.user);
      return true;
    } catch (error: any) {
      setError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}