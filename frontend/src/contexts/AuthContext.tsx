import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_URL } from '../constants'; 
import api from '../lib/api';   

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    console.log("AuthContext: Initializing token from localStorage.");
    return localStorage.getItem('token');
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token); // Initially true if token exists

  useEffect(() => {
    let isMounted = true;
    console.log("AuthContext useEffect triggered. Current Token:", token?.substring(0,10)+"...");

    const verifyTokenAndFetchProfile = async () => {
      if (!token) {
        console.log("AuthContext useEffect: No token found. Clearing user and setting isLoading false.");
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
          delete api.defaults.headers.common['Authorization'];
        }
        return;
      }

      console.log("AuthContext useEffect: Token found. Setting isLoading true, attempting to fetch profile.");
      if (isMounted) setIsLoading(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const response = await api.get<User>(`${API_URL}/auth/profile`);
        if (isMounted) {
          console.log("AuthContext useEffect: Profile fetched successfully for", response.data.email);
          setUser(response.data);
        }
      } catch (error) {
        console.error('AuthContext useEffect: Failed to fetch profile with existing token, logging out.', error);
        if (isMounted) {
          localStorage.removeItem('token');
          setUser(null);             
          setToken(null);          
          delete api.defaults.headers.common['Authorization'];
        }
      } finally {
        // Only set isLoading to false if we've actually completed an attempt WITH a token.
        // If token became null due to an error, the next effect run will set isLoading.
        if (isMounted && token) {
            console.log("AuthContext useEffect: Profile fetch attempt finished. Setting isLoading false.");
            setIsLoading(false);
        }
      }
    };

    verifyTokenAndFetchProfile();

    return () => {
      console.log("AuthContext useEffect: Cleanup function running (component unmount or token change).");
      isMounted = false;
    };
  }, [token]);

  const login = (newToken: string, userData: User) => {
    console.log("AuthContext login called. User:", userData.email, "Token:", newToken?.substring(0,10)+"...");
    localStorage.setItem('token', newToken);
    // It's crucial to set user state immediately for responsiveness,
    // and then set token state, which will trigger useEffect to verify & re-fetch profile.
    setIsLoading(true); // Signal that auth state is changing, profile will be fetched
    setUser(userData);
    setToken(newToken); 
  };

  const logout = async () => {
    console.log("AuthContext logout called. Clearing state and localStorage.");
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsLoading(false); // No longer loading, definitely logged out
    setToken(null);      // This will trigger useEffect to confirm logged-out state
    // Optional: await api.post(`${API_URL}/auth/logout`);
  };
  
  const isAuthenticated = (): boolean => {
    const authStatus = !!token && !!user;
    // console.log("AuthContext isAuthenticated called. Returning:", authStatus, "(isLoading:", isLoading, ")");
    return authStatus;
    // For stricter check if needed: return !!token && !!user && !isLoading;
  };

  // console.log("AuthContext rendering. State:", { user: user?.email, token: token?.substring(0,10)+"...", isLoading });

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};