import { useState, useEffect } from "react";
import { getAllSigns, getSignByWord } from "../../../services/signService";
import type { Sign } from "../../../types/lesson";

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

      // Fetch all signs from the API
      const signs = await getAllSigns();

      // Create the cache structure
      const newCache: SignCache = {
        signs: {},
        wordToId: {},
        lastUpdated: Date.now(),
      };

      // Populate the cache
      signs.forEach((sign) => {
        newCache.signs[sign.id] = sign;
        newCache.wordToId[sign.word.toLowerCase()] = sign.id;
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
      return cache.signs[id];
    }

    // Not in cache, try to fetch from API
    try {
      const sign = await import("../../../services/signService").then(
        (module) => module.getSignById(id)
      );

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
      return cache.signs[id];
    }

    // Not in cache, try to fetch from API
    try {
      const sign = await getSignByWord(word);

      if (!sign) return null;

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

    const signs = Object.values(cache.signs);
    const filteredSigns = excludeId
      ? signs.filter((sign) => sign.id !== excludeId)
      : signs;

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
