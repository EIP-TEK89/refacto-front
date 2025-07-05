import { del, get, patch } from "../../../services/apiClient";
import { API_ROUTES } from "../../../constants/routes";
import type { User } from "../types";

// Get current user from API
export const getCurrentUserService = async (): Promise<User> => {
  try {
    const user = (await get(API_ROUTES.currentUser)) as User;
    return user;
  } catch (error) {
    throw new Error("Failed to get current user");
  }
};

// Update user profile
export const updateUserService = async (
  userId: string,
  userData: Partial<User> & { password?: string; newPassword?: string }
): Promise<any> => {
  try {
    const response = await patch(API_ROUTES.updateUser(userId), userData);
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

    throw new Error(errorMessage);
  }
};

// Delete user profile
export const deleteUserService = async (password?: string): Promise<any> => {
  try {
    const config = password ? { data: { password } } : {};
    const response = await del(API_ROUTES.deleteProfile, config);
    return response;
  } catch (error: any) {
    // Handle errors
    let errorMessage = "Failed to delete user";

    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = "No response from server. Please try again later";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};
