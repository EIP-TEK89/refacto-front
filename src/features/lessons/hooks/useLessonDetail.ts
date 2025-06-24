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
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
        setError("Failed to load the lesson. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId]);

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
        // Get the sign using its ID from the exercise
        const signData = await getSignById(currentExercise.signId);
        setSign(signData);
      } catch (err) {
        console.error("Failed to load sign:", err);
        setError("Failed to load sign data for this exercise.");
      } finally {
        setLoadingSign(false);
      }
    };

    loadSignForExercise();
  }, [currentExerciseIndex, exercises]);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !exercises[currentExerciseIndex]) return;

    try {
      const exerciseId = exercises[currentExerciseIndex].id;
      const currentExercise = exercises[currentExerciseIndex];

      // Determine if this is a multiple choice exercise based on the type
      const isMultipleChoice = currentExercise.type !== "SIGN_RECOGNITION";

      const result = await submitExerciseAnswer(
        exerciseId,
        selectedAnswer,
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
  };
};
