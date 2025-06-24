/**
 * Types for lessons and lesson progress
 */

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  score: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  type: "WORD_TO_IMAGE" | "IMAGE_TO_WORD" | "SIGN_RECOGNITION";
  prompt: string;
  options?: string[];
  signId?: string | null;
  sign?: Sign;
}

export interface Sign {
  id: string;
  word: string;
  definition: string;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseAnswer {
  exerciseId: string;
  answer: string;
  isCorrect?: boolean;
}
