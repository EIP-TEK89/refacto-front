import apiClient from "./apiClient";
import { API_ROUTES } from "../constants/routes";

/**
 * Get a model from the server for intern AI
 *
 */
export const downloadModel = async (modelId: string): Promise<void> => {
  try {
    const response = await apiClient.get(API_ROUTES.downloadModel(modelId), {
      responseType: "blob",
    });

    // Create a URL for the blob and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${modelId}.zip`); // Set the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading model:", error);
    throw error;
  }
};
