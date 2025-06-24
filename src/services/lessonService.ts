import apiClient from "./apiClient";
import { API_ROUTES } from "../constants/routes";
import type { Lesson, LessonProgress, Exercise } from "../types/lesson";

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
  const response = await apiClient.get(API_ROUTES.getLessonProgress);
  return response.data;
};

/**
 * Update the progress for a specific lesson
 */
export const updateLessonProgress = async (
  progressId: string,
  data: Partial<LessonProgress>
): Promise<LessonProgress> => {
  const response = await apiClient.put(
    API_ROUTES.updateLessonProgress(progressId),
    data
  );
  return response.data;
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
  answer: string
): Promise<{ isCorrect: boolean; explanation?: string }> => {
  const response = await apiClient.post(
    API_ROUTES.submitExerciseAnswer(exerciseId),
    { answer }
  );
  return response.data;
};
