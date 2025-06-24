import {
  loginService,
  signupService,
  logoutService,
} from "../services/authServices";
import type { User } from "../types";

// Custom hook for basic authentication operations
export const useAuthActions = (
  initialState: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  },
  setAuthState: (state: any) => void
) => {
  // Login function
  const login = async (email: string, password: string) => {
    setAuthState({ ...initialState, isLoading: true, error: null });

    try {
      const response = await loginService(email, password);

      // Store tokens and user data
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null,
      });

      return response.user;
    } catch (error: any) {
      setAuthState({
        ...initialState,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error.message,
      });

      throw error;
    }
  };

  // Signup function
  const signup = async (userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => {
    setAuthState({ ...initialState, isLoading: true, error: null });

    try {
      const response = await signupService(userData);

      // Store tokens and user data
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null,
      });

      return response.user;
    } catch (error: any) {
      setAuthState({
        ...initialState,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error.message,
      });

      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Reset auth state first for immediate UI feedback
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });

    // Remove tokens and user data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Optional: Call logout API if needed
    try {
      // Use async/await in a separate function to avoid blocking the UI
      const callLogoutApi = async () => {
        try {
          await logoutService();
        } catch (error) {
          // Silent fail for logout API call
          console.error("Logout API call failed:", error);
        }
      };

      callLogoutApi();
    } catch (error) {
      // Silent fail for logout API call
      console.error("Logout API call failed:", error);
    }
  };

  // Clear error
  const clearError = () => {
    setAuthState({
      ...initialState,
      error: null,
    });
  };

  return {
    login,
    signup,
    logout,
    clearError,
  };
};
