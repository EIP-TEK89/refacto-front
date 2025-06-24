import { useAuth } from "../store/auth";
import { useEffect } from "react";

/**
 * A hook to check if the user is authenticated and redirect if not
 */
export const useRequireAuth = (redirectUrl = "/login") => {
  const auth = useAuth();

  useEffect(() => {
    // If not authenticated and not loading, redirect
    if (!auth.isAuthenticated && !auth.isLoading) {
      window.location.href = redirectUrl;
    }
  }, [auth.isAuthenticated, auth.isLoading, redirectUrl]);

  return auth;
};
