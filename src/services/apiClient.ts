import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_ROUTES, API_URL } from "../constants/routes";
import { isTokenExpired } from "../utils/tokenUtils";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL, // Base URL from environment
  timeout: 10000, // Request timeout
});

// Store for keeping track of refresh token requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Execute all registered callbacks with new token
const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// Add token to request headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    // Skip auth header for login/register/refresh routes
    const isAuthRoute = [
      API_ROUTES.logIn,
      API_ROUTES.signUp,
      API_ROUTES.refreshToken,
    ].some((route) => config.url?.includes(route));

    if (token && !isAuthRoute) {
      // Check if token is expired before using it
      if (isTokenExpired(token)) {
        // Token is expired, let's try to refresh it in the response interceptor
        // For now, we still add the expired token to the request
        // The response interceptor will handle the 401 error and refresh the token
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized errors that aren't from token refresh endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(API_ROUTES.refreshToken)
    ) {
      // If already refreshing, add request to queue
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve) => {
          subscribeTokenRefresh((token: string) => {
            // Replace old token with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axios(originalRequest));
          });
        });
      }

      // Mark that refresh is in progress
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from storage
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token available, logout
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          // Check if we're already on login page to avoid redirect loops
          if (
            !window.location.pathname.includes("/signin") &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/signin?expired=true";
          }
          return Promise.reject(error);
        }

        // Attempt to refresh the token
        const response = await axios.post(
          API_ROUTES.refreshToken,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            baseURL: "", // Avoid using instance's baseURL to prevent auth header
          }
        );

        // Store the new tokens
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update auth header for original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Notify subscribers that token is refreshed
        onTokenRefreshed(accessToken);

        isRefreshing = false;

        // Retry original request with new token
        return axios(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        // If refresh failed, logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Navigate to login page if not already there
        if (
          !window.location.pathname.includes("/signin") &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/signin?expired=true";
        }
        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

// Error handling
const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Handle 401 for specific API calls if needed
      console.error(
        "Authentication error:",
        error.response?.data?.message || "Authentication failed"
      );

      // Check if we're not already on the login page to avoid redirect loops
      if (
        !window.location.pathname.includes("/signin") &&
        !window.location.pathname.includes("/login")
      ) {
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Redirect to login with an expired parameter
        window.location.href = "/signin?expired=true";
      }
    } else if (error.response?.status === 403) {
      console.error(
        "Authorization error:",
        error.response?.data?.message || "Not authorized"
      );
    } else {
      console.error(
        "API error:",
        error.response?.data?.message || error.message
      );
    }

    throw new Error(error.response?.data?.message || "An error occurred");
  } else {
    console.error("Unknown error:", error);
    throw new Error("Unknown error");
  }
};

// API methods
export const get = async (url: string, params = {}, config = {}) => {
  try {
    const response = await apiClient.get(url, { params, ...config });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const post = async (url: string, data: any, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const del = async (url: string, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const put = async (url: string, data: any, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export default apiClient;
