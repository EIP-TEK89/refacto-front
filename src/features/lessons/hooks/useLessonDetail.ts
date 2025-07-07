import { useState, useEffect } from "react";
import {
  getLessonById,
  getExercisesForLesson,
  submitExerciseAnswer,
  getLessonProgress,
  completeLessonProgress,
  startLesson,
} from "../../../services/lessonService";
import { getSignById } from "../../../services/signService";
import type {
  Lesson,
  Exercise,
  LessonProgress,
  Sign,
} from "../../../types/lesson";
import { useSignCache } from "./useSignCache";
import { isValidImageUrl } from "../../../utils/imageUtils";

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

          // console.log(lessonProgress.score, exercisesData.length, Math.round((lessonProgress.score / 100) * exercisesData.length))
          setScore(Math.round((lessonProgress.score / 100) * exercisesData.length));
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

          // Check if sign has valid URL
          if (signData && !isValidImageUrl(signData.mediaUrl)) {
            console.warn(
              `Sign loaded from cache has invalid URL: ${signData.mediaUrl}`
            );
            signData = null; // Force reload from API
          }
        }

        // If not found in cache, get from API
        if (!signData) {
          signData = await getSignById(currentExercise.signId);

          // Validate image URL from API
          if (signData && !isValidImageUrl(signData.mediaUrl)) {
            console.warn(
              `Sign loaded from API has invalid URL: ${signData.mediaUrl}`
            );

            // Try a second request
            signData = await getSignById(currentExercise.signId);

            // Check again
            if (signData && !isValidImageUrl(signData.mediaUrl)) {
              console.warn(
                `Second request still has invalid URL, making third request`
              );

              // Try a third request
              signData = await getSignById(currentExercise.signId);
            }
          }
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

  // Start the lesson if needed (and if not already loading or completed)
  useEffect(() => {
    const initializeLesson = async () => {
      if (!lessonId || loading || lessonCompleted || progress) return;

      try {
        const newProgress = await startLesson(lessonId);
        setProgress(newProgress);
      } catch (err) {
        console.error("Failed to initialize lesson progress:", err);
      }
    };

    initializeLesson();
  }, [lessonId, loading, lessonCompleted, progress]);

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

      console.log("answer:", selectedAnswer, answer);
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
          // Complete lesson using the dedicated endpoint
          const updatedProgress = await completeLessonProgress(
            progress.lessonId,
            percentageScore
          );

          // Update progress state with the new data
          setProgress(updatedProgress);
        } else if (lessonId) {
          // No progress found, try to start the lesson first
          await startLesson(lessonId);

          // Now complete the lesson
          const completedProgress = await completeLessonProgress(
            lessonId,
            percentageScore
          );
          // Update progress state with the new data
          setProgress(completedProgress);
        } else {
          console.error("No progress object found and no lessonId available");
        }

        setLessonCompleted(true);
      } catch (err) {
        console.error("Failed to complete lesson:", err);
        // Log more details about the error
        if (err instanceof Error) {
          console.error("Error details:", err.message);
          console.error("Error stack:", err.stack);
        } else {
          console.error("Unknown error type:", err);
        }
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
