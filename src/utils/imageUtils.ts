/**
 * Utility functions for handling image URLs
 */

/**
 * Validates if an image URL is from Supabase and uses HTTPS
 *
 * @param url The URL to validate
 * @returns boolean indicating if the URL is valid (contains https and supabase.co)
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;

  // URL must be HTTPS and from Supabase
  const isValid = url.includes("https") && url.includes("supabase.co");

  if (!isValid) {
    console.warn(`Invalid image URL detected: ${url}`);
  }

  return isValid;
};

/**
 * Gets a fallback image URL when the primary one is invalid
 *
 * @param word The word or letter to use in placeholder
 * @returns A placeholder image URL
 */
export const getFallbackImageUrl = (word: string): string => {
  return `https://placehold.co/200x200?text=${word}`;
};
