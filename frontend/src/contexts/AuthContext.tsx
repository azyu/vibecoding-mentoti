'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse, SignupData, LoginData } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        try {
          const userData = await apiClient.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          apiClient.clearToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setError(null);
      const response = await apiClient.login(data);
      const userData = await apiClient.getMe();
      setUser(userData);
      
      if (userData.role === 'mentor') {
        router.push('/requests');
      } else {
        router.push('/mentors');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '로그인에 실패했습니다.');
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setError(null);
      const response = await apiClient.signup(data);
      const userData = await apiClient.getMe();
      setUser(userData);
      router.push('/profile');
    } catch (error: any) {
      setError(error.response?.data?.message || '회원가입에 실패했습니다.');
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}