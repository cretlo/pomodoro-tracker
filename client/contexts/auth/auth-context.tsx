'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
  Reducer,
  ReducerAction,
} from 'react';
import { useToast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/services/api';
import {
  AuthenticatedUser,
  User,
  RegistrationData,
  AuthContextType,
  AuthState,
  Credentials,
} from '@/types/types';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { reducer } from './auth-reducer';

type AuthContextProviderProps = {
  children: React.ReactNode;
};

const initialState: AuthState = {
  user: null,
  token: '',
  isLoading: false,
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const login = async (credentials: Credentials) => {
    try {
      const response = await axiosInstance.post('/login', credentials);

      // Consider validating response data
      const data: AuthenticatedUser = response.data;
      const loggedInUser: User = {
        username: data.username,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      dispatch({
        type: 'login_success',
        payload: {
          user: loggedInUser,
          token: data.token,
        },
      });

      toast({
        description: 'Login Success!',
      });
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Error should already be handled in the axios error response interceptor.
      } else {
        toast({ description: 'Server error occured', variant: 'destructive' });
      }
    }
  };

  const register = async (formData: RegistrationData) => {
    try {
      const response = await axiosInstance.post('/register', formData);
      const data: AuthenticatedUser = response.data;
      const loggedInUser: User = {
        username: data.username,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      dispatch({
        type: 'register_success',
        payload: {
          user: loggedInUser,
          token: data.token,
        },
      });

      toast({
        description: 'Registration Success!',
      });
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Error should already be handled in the axios error response interceptor.
      } else {
        toast({ description: 'Server error occured', variant: 'destructive' });
      }
    }
  };

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({
      type: 'logout',
    });
    queryClient.clear();
    router.push('/login');
  }

  function isAuthenticated() {
    return !!state.user;
  }

  // Restore user session on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    let user: string | User | null = localStorage.getItem('user');

    // Consider validating local storage
    if (token && user) {
      user = JSON.parse(user) as User;

      dispatch({
        type: 'login_success',
        payload: { user, token },
      });

      toast({
        description: 'User loaded',
      });
    }
  }, []);

  const contextValue: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within a AuthContextProvider');
  }

  return context;
}
