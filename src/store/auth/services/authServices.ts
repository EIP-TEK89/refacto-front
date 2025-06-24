import { post } from "../../../services/apiClient";
import { API_ROUTES } from "../../../constants/routes";
import type { AuthResponse } from "../types";

// Login function
export const loginService = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Basic validation
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const response = (await post(API_ROUTES.logIn, {
      email,
      password,
    })) as AuthResponse;

    return response;
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

    throw new Error(errorMessage);
  }
};

// Signup function
export const signupService = async (userData: {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> => {
  // Basic validation
  if (!userData.email || !userData.password || !userData.username) {
    throw new Error("Email, password and username are required");
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error("Please enter a valid email address");
  }

  // Password strength validation
  if (userData.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  try {
    const response = (await post(API_ROUTES.signUp, userData)) as AuthResponse;

    return response;
  } catch (error: any) {
    // More detailed error handling
    let errorMessage = "Signup failed";

    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 409) {
        errorMessage = "User with this email or username already exists";
      } else if (error.response.status === 400) {
        errorMessage = "Invalid input data";
      }
    } else if (error.request) {
      errorMessage = "No response from server. Please try again later";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// Logout API call
export const logoutService = async (): Promise<void> => {
  try {
    await post(API_ROUTES.logout, {});
  } catch (error) {
    console.error("Logout API call failed:", error);
    // Silent fail for logout API call
  }
};
