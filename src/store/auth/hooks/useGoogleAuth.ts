import { initiateGoogleLogin } from "../services/googleAuthService";
import type { User } from "../types";
import posthog from "posthog-js";

export const useGoogleAuth = (
  initialState: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  },
  setAuthState: (state: any) => void
) => {
  // Login with Google
  const loginWithGoogle = async () => {
    setAuthState({ ...initialState, isLoading: true, error: null });

    try {
      // Open Google OAuth authorization URL in a new window
      const { googleAuthWindow, expectedOrigin } = initiateGoogleLogin();

      // Listen for messages from the popup window
      const handleMessage = async (event: MessageEvent) => {
        // Verify origin
        if (event.origin !== expectedOrigin) return;

        // Process auth data from the popup
        if (event.data && event.data.type === "google-auth-success") {
          const { accessToken, refreshToken, user } = event.data.authData;

          // Store tokens and user data
          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(user));

          // Identify user in PostHog after Google authentication
          posthog.identify(user.id, {
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            username: user.username,
            role: user.role,
            auth_provider: "google",
          });

          // Update auth state
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
            error: null,
          });

          // Close the popup
          if (googleAuthWindow) {
            googleAuthWindow.close();
          }

          // Remove the event listener
          window.removeEventListener("message", handleMessage);
        } else if (event.data && event.data.type === "google-auth-error") {
          setAuthState({
            ...initialState,
            isLoading: false,
            error: event.data.error || "Google authentication failed",
          });

          // Close the popup
          if (googleAuthWindow) {
            googleAuthWindow.close();
          }

          // Remove the event listener
          window.removeEventListener("message", handleMessage);
        }
      };

      // Add event listener for communication from the popup
      window.addEventListener("message", handleMessage);

      // Set a timeout to handle cases where the popup is closed without completing auth
      const popupCheckInterval = setInterval(() => {
        if (googleAuthWindow && googleAuthWindow.closed) {
          clearInterval(popupCheckInterval);
          window.removeEventListener("message", handleMessage);

          // Only update state if still loading (i.e., auth wasn't successful)
          if (initialState.isLoading) {
            setAuthState({
              ...initialState,
              isLoading: false,
              error: "Authentication cancelled",
            });
          }
        }
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Google authentication failed";

      setAuthState({
        ...initialState,
        isLoading: false,
        error: errorMessage,
      });
    }
  };

  return {
    loginWithGoogle,
  };
};
