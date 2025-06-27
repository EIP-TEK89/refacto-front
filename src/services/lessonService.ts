import apiClient from "./apiClient";
import { API_ROUTES } from "../constants/routes";
import type { Lesson, LessonProgress, Exercise } from "../types/lesson";
import axios from "axios";

/**
 * Fetch all available lessons
 */
export const getAllLessons = async (): Promise<Lesson[]> => {
  const response = await apiClient.get(API_ROUTES.getLessons);
  return response.data;
};

/**
 * Get a specific lesson by ID
 */
export const getLessonById = async (lessonId: string): Promise<Lesson> => {
  const response = await apiClient.get(API_ROUTES.getLessonById(lessonId));
  return response.data;
};

/**
 * Get the user's progress for all lessons
 */
export const getLessonProgress = async (): Promise<LessonProgress[]> => {
  try {
    const response = await apiClient.get(API_ROUTES.getLessonProgress);

    // Check if we have an array
    if (!Array.isArray(response.data)) {
      console.error(
        "Expected array of progress items but got:",
        typeof response.data
      );
      return [];
    }

    // Transform completed boolean to status enum
    const transformedData = response.data.map((item: any, index: number) => {
      console.log(`Item ${index}:`, JSON.stringify(item, null, 2));

      // Check if the item has a nested progress property
      const progressData = item.progress || item;

      // Access completed and currentStep from the right place
      const completed = progressData.completed || false;
      const currentStep = progressData.currentStep || 0;
      const lessonId = item.id || progressData.lessonId;

      // Ensure the status matches the completed flag
      let status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      if (completed === true) {
        status = "COMPLETED";
      } else if (currentStep > 0) {
        status = "IN_PROGRESS";
      } else {
        status = "NOT_STARTED";
      }

      console.log(
        `Lesson ${lessonId}: completed=${completed}, currentStep=${currentStep}, status=${status}`
      );

      // Create a valid LessonProgress object
      return {
        id: progressData.id || `temp-${index}`,
        userId: progressData.userId || "unknown",
        lessonId: lessonId,
        completed: completed,
        status: status,
        score: progressData.score || 0,
        completedAt: progressData.completedAt || null,
        createdAt: progressData.createdAt || new Date().toISOString(),
        updatedAt: progressData.updatedAt || new Date().toISOString(),
      };
    });

    console.log("Transformed lesson progress:", transformedData);
    return transformedData;
  } catch (error: any) {
    console.error("Error in getLessonProgress:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

/**
 * Update the progress for a specific lesson
 */
export const updateLessonProgress = async (
  lessonId: string,
  data: Partial<LessonProgress>
): Promise<LessonProgress> => {
  try {
    // Transform data for backend - convert status to completed if needed
    const backendData: any = { ...data };

    console.log("Original data received:", data);

    // Remove frontend status field if it exists
    if (backendData.status) {
      // Convert status to completed if needed
      if (backendData.status === "COMPLETED" && !backendData.completed) {
        backendData.completed = true;
      }
      delete backendData.status;
    }

    const endpoint = API_ROUTES.updateLessonProgress(lessonId);
    console.log("Sending to backend:", backendData);
    console.log("Using endpoint:", endpoint);
    console.log("Lesson ID:", lessonId);

    // Make API request
    const response = await apiClient.put(endpoint, backendData);

    console.log("API request completed");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    // Transform response for frontend
    const frontendData = {
      ...response.data,
      status: response.data.completed
        ? "COMPLETED"
        : response.data.currentStep > 0
        ? "IN_PROGRESS"
        : "NOT_STARTED",
    };

    console.log("Transformed data for frontend:", frontendData);

    return frontendData;
  } catch (error: any) {
    console.error("Error in updateLessonProgress:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

/**
 * Mark a lesson as completed
 */
export const completeLessonProgress = async (
  lessonId: string,
  score?: number
): Promise<LessonProgress> => {
  try {
    console.log(
      "Marking lesson as completed, lessonId:",
      lessonId,
      "score:",
      score
    );

    const endpoint = API_ROUTES.completeLessonProgress(lessonId);
    console.log("Using endpoint:", endpoint);

    // For completion, we don't need to send any data as the backend will calculate the score
    // But we can send the score if we have it
    const data = score !== undefined ? { score } : {};

    // Make API request
    const response = await apiClient.put(endpoint, data);

    console.log("API request completed");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    // Transform response for frontend
    const frontendData = {
      ...response.data,
      status: response.data.completed
        ? "COMPLETED"
        : response.data.currentStep > 0
        ? "IN_PROGRESS"
        : "NOT_STARTED",
    };

    console.log("Transformed data for frontend:", frontendData);

    return frontendData;
  } catch (error: any) {
    console.error("Error in completeLessonProgress:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

/**
 * Get exercises for a specific lesson
 */
export const getExercisesForLesson = async (
  lessonId: string
): Promise<Exercise[]> => {
  const response = await apiClient.get(API_ROUTES.getExercises(lessonId));
  return response.data;
};

/**
 * Get a specific exercise by ID
 */
export const getExerciseById = async (
  exerciseId: string
): Promise<Exercise> => {
  const response = await apiClient.get(API_ROUTES.getExerciseById(exerciseId));
  return response.data;
};

/**
 * Submit an answer for an exercise
 */
export const submitExerciseAnswer = async (
  exerciseId: string,
  answer: string,
  isMultipleChoice: boolean = true
): Promise<{
  isCorrect: boolean;
  explanation?: string;
  score?: number;
  feedback?: string;
  correctAnswer?: string;
}> => {
  const response = await apiClient.post(
    API_ROUTES.submitExerciseAnswer(exerciseId),
    { answer, multipleChoice: isMultipleChoice }
  );
  return response.data;
};

/**
 * Start a new lesson or get existing progress
 */
export const startLesson = async (
  lessonId: string
): Promise<LessonProgress> => {
  try {
    console.log("Starting lesson, lessonId:", lessonId);

    const endpoint = API_ROUTES.startLessonProgress;
    console.log("Using endpoint:", endpoint);

    // Make API request to start the lesson
    const response = await apiClient.post(endpoint, { lessonId });

    console.log("API request completed");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    // Transform response for frontend
    const frontendData = {
      ...response.data,
      status: response.data.completed
        ? "COMPLETED"
        : response.data.currentStep > 0
        ? "IN_PROGRESS"
        : "NOT_STARTED",
    };

    console.log("Transformed data for frontend:", frontendData);

    return frontendData;
  } catch (error: any) {
    console.error("Error in startLesson:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

/**
 * Reset a lesson progress
 */
export const resetLessonProgress = async (
  lessonId: string
): Promise<LessonProgress> => {
  try {
    console.log("Resetting lesson progress, lessonId:", lessonId);

    const endpoint = API_ROUTES.resetLessonProgress(lessonId);
    console.log("Using endpoint:", endpoint);

    // Make API request to reset the lesson
    const response = await apiClient.post(endpoint);

    console.log("API request completed");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    // Transform response for frontend
    const frontendData = {
      ...response.data,
      status: "NOT_STARTED",
    };

    console.log("Transformed data for frontend:", frontendData);

    return frontendData;
  } catch (error: any) {
    console.error("Error in resetLessonProgress:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};
