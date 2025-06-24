import { useState, useEffect } from "react";
import {
  getLessonById,
  getExercisesForLesson,
  submitExerciseAnswer,
  updateLessonProgress,
  getLessonProgress,
} from "../../../services/lessonService";
import { getSignById } from "../../../services/signService";
import type {
  Lesson,
  Exercise,
  LessonProgress,
  Sign,
} from "../../../types/lesson";
import { useSignCache } from "./useSignCache";

export const useLessonDetail = (lessonId: string | undefined) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [sign, setSign] = useState<Sign | null>(null);
  const [loadingSign, setLoadingSign] = useState(false);

  // Use our sign cache
  const signCache = useSignCache();

  // Fetch lesson data
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) return;

      try {
        setLoading(true);

        // Fetch lesson details
        const lessonData = await getLessonById(lessonId);
        setLesson(lessonData);

        // Fetch exercises for this lesson
        const exercisesData = await getExercisesForLesson(lessonId);
        setExercises(exercisesData);

        // Fetch progress for this lesson
        const allProgress = await getLessonProgress();
        const lessonProgress = allProgress.find((p) => p.lessonId === lessonId);

        if (lessonProgress) {
          setProgress(lessonProgress);

          // If lesson is already completed, set the flag
          if (lessonProgress.status === "COMPLETED") {
            setLessonCompleted(true);
          }
        }

        // Make sure sign cache is initialized
        if (signCache.isLoading) {
          await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              if (!signCache.isLoading) {
                clearInterval(checkInterval);
                resolve(true);
              }
            }, 100);
          });
        }
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
        setError("Failed to load the lesson. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, signCache.isLoading]);

  // Load sign when an exercise has a signId
  useEffect(() => {
    const loadSignForExercise = async () => {
      const currentExercise = exercises[currentExerciseIndex];
      if (!currentExercise || !currentExercise.signId) {
        setSign(null);
        return;
      }

      try {
        setLoadingSign(true);

        // Try to get the sign from cache first, then fallback to API
        let signData;
        if (!signCache.isLoading) {
          signData = await signCache.getSignById(currentExercise.signId);
        }

        // If not found in cache, get from API
        if (!signData) {
          signData = await getSignById(currentExercise.signId);
        }

        setSign(signData);
      } catch (err) {
        console.error("Failed to load sign:", err);
        setError("Failed to load sign data for this exercise.");
      } finally {
        setLoadingSign(false);
      }
    };

    loadSignForExercise();
  }, [currentExerciseIndex, exercises, signCache.isLoading]);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleAnswerSubmit = async () => {
    if (!exercises[currentExerciseIndex]) return;

    const currentExercise = exercises[currentExerciseIndex];
    // If no answer is selected, and it's not a recognition exercise, do nothing
    if (!selectedAnswer && currentExercise.type !== "SIGN_RECOGNITION") return;

    try {
      const exerciseId = currentExercise.id;

      // Determine if this is a multiple choice exercise based on the type
      const isMultipleChoice = currentExercise.type !== "SIGN_RECOGNITION";

      // For IMAGE_TO_WORD type exercises, we submit the selected ID
      // For SIGN_RECOGNITION type exercises, we submit the entered text
      // For other exercises, we submit the selected answer
      let answer = selectedAnswer || "";

      const result = await submitExerciseAnswer(
        exerciseId,
        answer,
        isMultipleChoice
      );

      setIsAnswerCorrect(result.isCorrect);
      setFeedback(
        result.explanation ||
          result.feedback ||
          (result.isCorrect ? "Correct!" : "Incorrect!")
      );

      if (result.isCorrect) {
        // If score is provided from the API, use that, otherwise default to 1
        const exerciseScore =
          result.score !== undefined ? result.score / 100 : 1;
        setScore((prev) => prev + exerciseScore);
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setFeedback("Failed to submit your answer. Please try again.");
    }
  };

  const goToNextExercise = async () => {
    // Reset state for next exercise
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setFeedback("");

    if (currentExerciseIndex < exercises.length - 1) {
      // Go to next exercise
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      // Lesson completed
      try {
        // Calculate percentage score
        const percentageScore = Math.round((score / exercises.length) * 100);

        if (progress) {
          // Update existing progress
          await updateLessonProgress(progress.id, {
            status: "COMPLETED",
            score: percentageScore,
            completedAt: new Date().toISOString(),
          });
        }

        setLessonCompleted(true);
      } catch (err) {
        console.error("Failed to update lesson progress:", err);
      }
    }
  };

  const resetLesson = () => {
    setCurrentExerciseIndex(0);
    setScore(0);
    setLessonCompleted(false);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setFeedback("");
  };

  return {
    lesson,
    exercises,
    currentExerciseIndex,
    selectedAnswer,
    isAnswerCorrect,
    feedback,
    score,
    loading,
    error,
    lessonCompleted,
    sign,
    loadingSign,
    handleAnswerSelection,
    handleAnswerSubmit,
    goToNextExercise,
    resetLesson,
    currentExercise: exercises[currentExerciseIndex] || null,
    signCache, // Expose sign cache to components
  };
};
