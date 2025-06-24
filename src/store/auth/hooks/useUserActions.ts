import {
  getCurrentUserService,
  updateUserService,
} from "../services/userServices";
import type { User } from "../types";

export const useUserActions = (
  initialState: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  },
  setAuthState: (state: any) => void
) => {
  // Get current user from API
  const getCurrentUser = async (): Promise<User | null> => {
    if (!initialState.isAuthenticated) return null;

    setAuthState({ ...initialState, isLoading: true });

    try {
      const user = await getCurrentUserService();

      // Update user data in local storage and state
      localStorage.setItem("user", JSON.stringify(user));

      setAuthState({
        ...initialState,
        isLoading: false,
        user,
      });

      return user;
    } catch (error) {
      setAuthState({
        ...initialState,
        isLoading: false,
      });

      return null;
    }
  };

  // Update user profile
  const updateUser = async (
    userId: string,
    userData: Partial<User> & { password?: string; newPassword?: string }
  ) => {
    setAuthState({ ...initialState, isLoading: true, error: null });

    try {
      const response = await updateUserService(userId, userData);

      // If we have user data in the response, update the local storage and state
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));

        setAuthState({
          ...initialState,
          isLoading: false,
          user: response.user,
        });
      } else {
        // Just update loading state if no user data returned
        setAuthState({
          ...initialState,
          isLoading: false,
        });
      }

      return response;
    } catch (error: any) {
      setAuthState({
        ...initialState,
        isLoading: false,
        error: error.message,
      });

      throw error;
    }
  };

  return {
    getCurrentUser,
    updateUser,
  };
};
