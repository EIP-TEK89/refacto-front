import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext, initialAuthState } from "./authContext";
import type { AuthResponse, User } from "./types";
import { post, get, patch } from "../../services/apiClient";
import { API_ROUTES } from "../../constants/routes";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState(initialAuthState);

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

  // Login function
  const login = async (email: string, password: string) => {
    setState({ ...state, isLoading: true, error: null });

    // Basic validation
    if (!email || !password) {
      setState({
        ...state,
        isLoading: false,
        error: "Email and password are required",
      });
      return;
    }

    try {
      const response = (await post(API_ROUTES.logIn, {
        email,
        password,
      })) as AuthResponse;

      // Store tokens and user data
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null,
      });

      // Return user for chaining if needed
      return response.user;
    } catch (error: any) {
      // More detailed error handling
      let errorMessage = "Login failed";

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (error.response.status === 404) {
          errorMessage = "User not found";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please try again later";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState({
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: errorMessage,
      });

      // Throw error for handling in UI if needed
      throw new Error(errorMessage);
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
    setState({ ...state, isLoading: true, error: null });

    // Basic validation
    if (!userData.email || !userData.password || !userData.username) {
      setState({
        ...state,
        isLoading: false,
        error: "Email, password and username are required",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setState({
        ...state,
        isLoading: false,
        error: "Please enter a valid email address",
      });
      return;
    }

    // Password strength validation
    if (userData.password.length < 8) {
      setState({
        ...state,
        isLoading: false,
        error: "Password must be at least 8 characters long",
      });
      return;
    }

    try {
      const response = (await post(
        API_ROUTES.signUp,
        userData
      )) as AuthResponse;

      // Store tokens and user data
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null,
      });

      // Return user for chaining if needed
      return response.user;
    } catch (error: any) {
      // More detailed error handling
      let errorMessage = "Signup failed";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 409) {
          errorMessage = "User with this email or username already exists";
        } else if (error.response.status === 400) {
          errorMessage = "Invalid input data";
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please try again later";
      } else if (error instanceof Error) {
        // Something happened in setting up the request
        errorMessage = error.message;
      }

      setState({
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: errorMessage,
      });

      // Throw error for handling in UI if needed
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    // Reset auth state first for immediate UI feedback
    setState({
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
          await post(API_ROUTES.logout, {});
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

  // Get current user from API
  const getCurrentUser = async (): Promise<User | null> => {
    if (!state.isAuthenticated) return null;

    setState({ ...state, isLoading: true });

    try {
      const user = (await get(API_ROUTES.currentUser)) as User;

      // Update user data in local storage and state
      localStorage.setItem("user", JSON.stringify(user));

      setState({
        ...state,
        isLoading: false,
        user,
      });

      return user;
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
      });

      return null;
    }
  };

  // Clear error
  const clearError = () => {
    setState({
      ...state,
      error: null,
    });
  };

  // Update user
  const updateUser = async (
    userId: string,
    userData: Partial<User> & { password?: string; newPassword?: string }
  ) => {
    setState({ ...state, isLoading: true, error: null });

    try {
      const response = await patch(API_ROUTES.updateUser(userId), userData);

      // If we have user data in the response, update the local storage and state
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));

        setState({
          ...state,
          isLoading: false,
          user: response.user,
        });
      } else {
        // Just update loading state if no user data returned
        setState({
          ...state,
          isLoading: false,
        });
      }

      return response;
    } catch (error: any) {
      // Handle errors
      let errorMessage = "Failed to update user";

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please try again later";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState({
        ...state,
        isLoading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    setState({ ...state, isLoading: true, error: null });

    try {
      // Open Google OAuth authorization URL in a new window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const googleAuthWindow = window.open(
        API_ROUTES.googleAuth,
        "Google Sign In",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
      );

      if (!googleAuthWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Listen for messages from the popup window
      const handleMessage = async (event: MessageEvent) => {
        // Verify origin (replace with your actual frontend URL)
        const expectedOrigin = window.location.origin;
        if (event.origin !== expectedOrigin) return;

        // Process auth data from the popup
        if (event.data && event.data.type === "google-auth-success") {
          const { accessToken, refreshToken, user } = event.data.authData;

          // Store tokens and user data
          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(user));

          // Update auth state
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            error: null,
          });

          // Close the popup
          googleAuthWindow.close();

          // Remove the event listener
          window.removeEventListener("message", handleMessage);
        } else if (event.data && event.data.type === "google-auth-error") {
          setState({
            ...state,
            isLoading: false,
            error: event.data.error || "Google authentication failed",
          });

          // Close the popup
          googleAuthWindow.close();

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
          if (state.isLoading) {
            setState({
              ...state,
              isLoading: false,
              error: "Authentication cancelled",
            });
          }
        }
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Google authentication failed";

      setState({
        ...state,
        isLoading: false,
        error: errorMessage,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        getCurrentUser,
        clearError,
        loginWithGoogle,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
