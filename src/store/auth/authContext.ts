import { createContext, useContext } from "react";
import type { User, AuthState } from "./types";

// Default state
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Define the auth context interface
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User | void>;
  signup: (userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => Promise<User | void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
  clearError: () => void;
  updateUser: (
    userId: string,
    userData: Partial<User> & { password?: string; newPassword?: string }
  ) => Promise<any>;
}

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  getCurrentUser: async () => null,
  clearError: () => {},
  updateUser: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
