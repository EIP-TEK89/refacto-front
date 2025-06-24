/**
 * Utility functions for working with JWT tokens
 */

// Decode a JWT token to extract payload data
export const decodeJwtToken = (token: string): Record<string, any> | null => {
  try {
    // Split the token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT token format");
      return null;
    }

    // Decode the payload (second part)
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

// Check if a token is expired
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) return true;

  // Compare expiration timestamp with current time
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
};

// Get token expiration date
export const getTokenExpirationDate = (token: string): Date | null => {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) return null;

  return new Date(decoded.exp * 1000);
};

// Extract user ID from token
export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeJwtToken(token);
  return decoded?.sub || null;
};
