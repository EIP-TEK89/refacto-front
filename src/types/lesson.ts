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
  type: "MULTIPLE_CHOICE" | "MATCHING" | "VIDEO" | "DRAG_DROP";
  question: string;
  options?: string[];
  correctAnswer?: string;
  videoUrl?: string;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseAnswer {
  exerciseId: string;
  answer: string;
  isCorrect?: boolean;
}
