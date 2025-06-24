import apiClient from "./apiClient";
import { API_ROUTES } from "../constants/routes";
import type { Sign } from "../types/lesson";

/**
 * Fetch all available signs
 */
export const getAllSigns = async (): Promise<Sign[]> => {
  const response = await apiClient.get(API_ROUTES.getAllSigns);
  return response.data;
};

/**
 * Get a sign by its ID
 * @param id The ID of the sign
 */
export const getSignById = async (id: string): Promise<Sign> => {
  const response = await apiClient.get(API_ROUTES.getSignById(id));
  return response.data;
};

/**
 * Get a sign by its word
 * @param word The word to search for
 */
export const getSignByWord = async (word: string): Promise<Sign> => {
  const response = await apiClient.get(API_ROUTES.getSignByWord(word));
  return response.data[0]; // Assuming the API returns an array with the matching sign
};

/**
 * Search for signs by name/word
 * @param name The name/word to search for
 */
export const searchSignsByName = async (name: string): Promise<Sign[]> => {
  const response = await apiClient.get(API_ROUTES.searchSignByName(name));
  return response.data;
};
