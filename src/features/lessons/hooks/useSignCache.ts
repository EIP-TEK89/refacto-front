import { useState, useEffect } from "react";
import { getAllSigns, getSignByWord } from "../../../services/signService";
import type { Sign } from "../../../types/lesson";
import { isValidImageUrl } from "../../../utils/imageUtils";

const SIGN_CACHE_KEY = "triosigno_sign_cache";
const SIGN_CACHE_EXPIRY_KEY = "triosigno_sign_cache_expiry";
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface SignCache {
  signs: Record<string, Sign>; // Map of Sign ID to Sign object
  wordToId: Record<string, string>; // Map of words to Sign IDs
  lastUpdated: number;
}

export const useSignCache = () => {
  const [cache, setCache] = useState<SignCache | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize cache from localStorage or fetch all signs
  useEffect(() => {
    const initializeCache = async () => {
      try {
        setIsLoading(true);

        // Try to get cache from localStorage
        const cachedData = localStorage.getItem(SIGN_CACHE_KEY);
        const cacheExpiry = localStorage.getItem(SIGN_CACHE_EXPIRY_KEY);

        // Check if cache exists and is not expired
        if (cachedData && cacheExpiry) {
          const expiryTime = parseInt(cacheExpiry, 10);
          const now = Date.now();

          if (now < expiryTime) {
            // Cache is valid, use it
            const parsedCache: SignCache = JSON.parse(cachedData);
            setCache(parsedCache);
            setIsLoading(false);
            return;
          }
        }

        // Cache doesn't exist or is expired, fetch all signs
        await refreshCache();
      } catch (err) {
        console.error("Failed to initialize sign cache:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to initialize sign cache")
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeCache();
  }, []);

  // Function to refresh the cache with the latest data
  const refreshCache = async () => {
    try {
      setIsLoading(true);

      // Fetch all signs from the API - this first call might have invalid image links
      let signs = await getAllSigns();

      // Make a second request to get valid image links
      console.log(
        "Making second request to getAllSigns to get valid image URLs"
      );
      signs = await getAllSigns();

      // Make a third request just to be sure
      console.log(
        "Making third request to getAllSigns to ensure valid image URLs"
      );
      signs = await getAllSigns();

      // Filter out signs with invalid image URLs
      const validSigns = signs.filter((sign) => isValidImageUrl(sign.mediaUrl));
      if (validSigns.length < signs.length) {
        console.warn(
          `Filtered out ${
            signs.length - validSigns.length
          } signs with invalid image URLs`
        );
      }

      // Create the cache structure
      const newCache: SignCache = {
        signs: {},
        wordToId: {},
        lastUpdated: Date.now(),
      };

      // Populate the cache only with signs that have valid URLs
      validSigns.forEach((sign) => {
        newCache.signs[sign.id] = sign;
        newCache.wordToId[sign.word.toLowerCase()] = sign.id;

        // Mark this sign as having a validated image link
        localStorage.setItem(`sign_image_validated_${sign.id}`, "true");
      });

      // Save to localStorage
      localStorage.setItem(SIGN_CACHE_KEY, JSON.stringify(newCache));
      localStorage.setItem(
        SIGN_CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_EXPIRY_TIME).toString()
      );

      // Update state
      setCache(newCache);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh sign cache:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to refresh sign cache")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get a sign by ID from cache or API
  const getSignById = async (id: string): Promise<Sign | null> => {
    // If cache is not initialized yet, return null
    if (!cache) return null;

    // Try to get from cache first
    if (cache.signs[id]) {
      // Check if we already validated the image link
      const cacheImageValidated = localStorage.getItem(
        `sign_image_validated_${id}`
      );
      if (cacheImageValidated === "true") {
        // Double check the URL is valid
        if (isValidImageUrl(cache.signs[id].mediaUrl)) {
          return cache.signs[id];
        } else {
          console.warn(
            `Cached sign ${id} has invalid image URL: ${cache.signs[id].mediaUrl}`
          );
        }
      }
    }

    // Not in cache or image link needs validation, fetch from API
    try {
      // First request - might return invalid image link
      let sign = await import("../../../services/signService").then((module) =>
        module.getSignById(id)
      );

      // Check if the first request already has a valid URL
      if (isValidImageUrl(sign.mediaUrl)) {
        console.log(
          `First request for sign ID ${id} already has valid image URL: ${sign.mediaUrl}`
        );
      } else {
        // Make a second request to get a valid image link
        console.log(
          `First request had invalid URL (${sign.mediaUrl}). Making second request for sign ID ${id}`
        );
        sign = await import("../../../services/signService").then((module) =>
          module.getSignById(id)
        );

        // Check again
        if (isValidImageUrl(sign.mediaUrl)) {
          console.log(
            `Second request for sign ID ${id} has valid image URL: ${sign.mediaUrl}`
          );
        } else {
          // Make a third request if needed
          console.log(
            `Second request still had invalid URL. Making third request for sign ID ${id}`
          );
          sign = await import("../../../services/signService").then((module) =>
            module.getSignById(id)
          );

          if (!isValidImageUrl(sign.mediaUrl)) {
            console.error(
              `Failed to get valid image URL for sign ID ${id} after 3 attempts. Current URL: ${sign.mediaUrl}`
            );
          }
        }
      }

      // Mark this sign as having a validated image link only if the URL is valid
      if (isValidImageUrl(sign.mediaUrl)) {
        localStorage.setItem(`sign_image_validated_${id}`, "true");
      } else {
        localStorage.removeItem(`sign_image_validated_${id}`);
      }

      // Add to cache
      const updatedCache = { ...cache };
      updatedCache.signs[sign.id] = sign;
      updatedCache.wordToId[sign.word.toLowerCase()] = sign.id;

      setCache(updatedCache);
      localStorage.setItem(SIGN_CACHE_KEY, JSON.stringify(updatedCache));

      return sign;
    } catch (err) {
      console.error(`Failed to get sign by ID ${id}:`, err);
      return null;
    }
  };

  // Get a sign by word from cache or API
  const getSignByWordFromCache = async (word: string): Promise<Sign | null> => {
    // If cache is not initialized yet, return null
    if (!cache) return null;

    const normalizedWord = word.toLowerCase();

    // Try to get from cache first
    if (cache.wordToId[normalizedWord]) {
      const id = cache.wordToId[normalizedWord];

      // Check if we already validated the image link
      const cacheImageValidated = localStorage.getItem(
        `sign_image_validated_${id}`
      );
      if (cacheImageValidated === "true") {
        // Double check the URL is valid
        if (isValidImageUrl(cache.signs[id].mediaUrl)) {
          return cache.signs[id];
        } else {
          console.warn(
            `Cached sign for word "${normalizedWord}" has invalid image URL: ${cache.signs[id].mediaUrl}`
          );
        }
      }
    }

    // Not in cache or image link needs validation, fetch from API
    try {
      // First request - might return invalid image link
      let sign = await getSignByWord(word);
      if (!sign) return null;

      // Check if first request has valid URL
      if (isValidImageUrl(sign.mediaUrl)) {
        console.log(
          `First request for word "${word}" already has valid image URL: ${sign.mediaUrl}`
        );
      } else {
        // Make a second request to get a valid image link
        console.log(
          `Making second request for word "${word}" to get valid image URL`
        );
        sign = await getSignByWord(word);

        // Check again
        if (isValidImageUrl(sign.mediaUrl)) {
          console.log(
            `Second request for word "${word}" has valid image URL: ${sign.mediaUrl}`
          );
        } else {
          // Make a third request just to be sure
          console.log(
            `Making third request for word "${word}" to ensure valid image URL`
          );
          sign = await getSignByWord(word);

          if (!isValidImageUrl(sign.mediaUrl)) {
            console.error(
              `Failed to get valid image URL for word "${word}" after 3 attempts. Current URL: ${sign.mediaUrl}`
            );
          }
        }
      }

      // Mark this sign as having a validated image link only if URL is valid
      if (isValidImageUrl(sign.mediaUrl)) {
        localStorage.setItem(`sign_image_validated_${sign.id}`, "true");
      } else {
        localStorage.removeItem(`sign_image_validated_${sign.id}`);
        console.warn(
          `Cannot validate image URL for sign with word "${word}": ${sign.mediaUrl}`
        );
      }

      // Add to cache
      const updatedCache = { ...cache };
      updatedCache.signs[sign.id] = sign;
      updatedCache.wordToId[sign.word.toLowerCase()] = sign.id;

      setCache(updatedCache);
      localStorage.setItem(SIGN_CACHE_KEY, JSON.stringify(updatedCache));

      return sign;
    } catch (err) {
      console.error(`Failed to get sign by word ${word}:`, err);
      return null;
    }
  };

  // Get random signs from cache (useful for generating options)
  const getRandomSigns = (count: number, excludeId?: string): Sign[] => {
    if (!cache) return [];

    // Get all signs from cache
    const signs = Object.values(cache.signs);

    // Filter signs that have invalid image URLs
    const validSigns = signs.filter((sign) => isValidImageUrl(sign.mediaUrl));

    // Filter out the excluded ID if provided
    const filteredSigns = excludeId
      ? validSigns.filter((sign) => sign.id !== excludeId)
      : validSigns;

    // Log if we had to filter out signs with invalid URLs
    if (validSigns.length < signs.length) {
      console.warn(
        `Filtered out ${
          signs.length - validSigns.length
        } signs with invalid image URLs`
      );
    }

    // Shuffle and take the requested count
    return [...filteredSigns].sort(() => Math.random() - 0.5).slice(0, count);
  };

  return {
    getSignById,
    getSignByWord: getSignByWordFromCache,
    getRandomSigns,
    refreshCache,
    isLoading,
    error,
    allSigns: cache ? Object.values(cache.signs) : [],
  };
};
