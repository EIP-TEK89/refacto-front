import { useState, useEffect, useCallback } from "react";
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

  // Function to refresh the cache with the latest data
  const refreshCache = useCallback(async () => {
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
        localStorage.setItem(`sign_image_validated_${sign.id}`, "true");
      });

      // Save to localStorage
      localStorage.setItem(SIGN_CACHE_KEY, JSON.stringify(newCache));
      localStorage.setItem(
        SIGN_CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_EXPIRY_TIME).toString()
      );

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
  }, []);

  // Initialize cache from localStorage or fetch all signs
  useEffect(() => {
    const initializeCache = async () => {
      try {
        setIsLoading(true);

        const cachedData = localStorage.getItem(SIGN_CACHE_KEY);
        const cacheExpiry = localStorage.getItem(SIGN_CACHE_EXPIRY_KEY);

        if (cachedData && cacheExpiry) {
          const expiryTime = parseInt(cacheExpiry, 10);
          const now = Date.now();

          if (now < expiryTime) {
            const parsedCache: SignCache = JSON.parse(cachedData);
            setCache(parsedCache);
            setIsLoading(false);
            return;
          }
        }

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
  }, [refreshCache]);

  // Get a sign by ID from cache or API
  const getSignById = useCallback(
    async (id: string): Promise<Sign | null> => {
      if (!cache) return null;

      if (cache.signs[id]) {
        const cacheImageValidated = localStorage.getItem(
          `sign_image_validated_${id}`
        );
        if (cacheImageValidated === "true") {
          if (isValidImageUrl(cache.signs[id].mediaUrl)) {
            return cache.signs[id];
          } else {
            console.warn(
              `Cached sign ${id} has invalid image URL: ${cache.signs[id].mediaUrl}`
            );
          }
        }
      }

      try {
        let sign = await import("../../../services/signService").then(
          (module) => module.getSignById(id)
        );

        if (!isValidImageUrl(sign.mediaUrl)) {
          sign = await import("../../../services/signService").then((module) =>
            module.getSignById(id)
          );
          if (!isValidImageUrl(sign.mediaUrl)) {
            sign = await import("../../../services/signService").then(
              (module) => module.getSignById(id)
            );
          }
        }

        if (isValidImageUrl(sign.mediaUrl)) {
          localStorage.setItem(`sign_image_validated_${id}`, "true");
        } else {
          localStorage.removeItem(`sign_image_validated_${id}`);
        }

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
    },
    [cache]
  );

  // Get a sign by word from cache or API
  const getSignByWordFromCache = useCallback(
    async (word: string): Promise<Sign | null> => {
      if (!cache) return null;
      const normalizedWord = word.toLowerCase();

      if (cache.wordToId[normalizedWord]) {
        const id = cache.wordToId[normalizedWord];
        const cacheImageValidated = localStorage.getItem(
          `sign_image_validated_${id}`
        );
        if (cacheImageValidated === "true") {
          if (isValidImageUrl(cache.signs[id].mediaUrl)) {
            return cache.signs[id];
          } else {
            console.warn(
              `Cached sign for word "${normalizedWord}" has invalid image URL: ${cache.signs[id].mediaUrl}`
            );
          }
        }
      }

      try {
        let sign = await getSignByWord(word);
        if (!sign) return null;

        if (!isValidImageUrl(sign.mediaUrl)) {
          sign = await getSignByWord(word);
          if (!isValidImageUrl(sign.mediaUrl)) {
            sign = await getSignByWord(word);
          }
        }

        if (isValidImageUrl(sign.mediaUrl)) {
          localStorage.setItem(`sign_image_validated_${sign.id}`, "true");
        } else {
          localStorage.removeItem(`sign_image_validated_${sign.id}`);
          console.warn(
            `Cannot validate image URL for sign with word "${word}": ${sign.mediaUrl}`
          );
        }

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
    },
    [cache]
  );

  // Get random signs from cache (useful for generating options)
  const getRandomSigns = useCallback(
    (count: number, excludeId?: string): Sign[] => {
      if (!cache) return [];
      const signs = Object.values(cache.signs);
      const validSigns = signs.filter((sign) => isValidImageUrl(sign.mediaUrl));
      const filteredSigns = excludeId
        ? validSigns.filter((sign) => sign.id !== excludeId)
        : validSigns;
      if (validSigns.length < signs.length) {
        console.warn(
          `Filtered out ${
            signs.length - validSigns.length
          } signs with invalid image URLs`
        );
      }
      return [...filteredSigns].sort(() => Math.random() - 0.5).slice(0, count);
    },
    [cache]
  );

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
