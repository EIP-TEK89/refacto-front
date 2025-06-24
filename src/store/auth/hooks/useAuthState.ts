import { useState, useEffect } from "react";
import { initialAuthState } from "../authContext";
import { useAuthActions } from "./useAuthActions";
import { useUserActions } from "./useUserActions";
import { useGoogleAuth } from "./useGoogleAuth";
import type { AuthState } from "../types";

// Main hook that combines all auth functionality
export const useAuthState = () => {
  const [state, setState] = useState<AuthState>(initialAuthState);

  // Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        setState({
          ...state,
          isAuthenticated: true,
          user: JSON.parse(user),
        });
      } catch (error) {
        // If user data is invalid, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Import all the auth hooks
  const authActions = useAuthActions(state, setState);
  const userActions = useUserActions(state, setState);
  const googleAuth = useGoogleAuth(state, setState);

  return {
    ...state,
    ...authActions,
    ...userActions,
    ...googleAuth,
  };
};
