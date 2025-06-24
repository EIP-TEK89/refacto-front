import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import {
  getLessonById,
  getExercisesForLesson,
  submitExerciseAnswer,
  updateLessonProgress,
  getLessonProgress,
} from "../services/lessonService";
import type { Lesson, Exercise, LessonProgress } from "../types/lesson";

const LessonDetail = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

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

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !exercises[currentExerciseIndex]) return;

    try {
      const exerciseId = exercises[currentExerciseIndex].id;
      const result = await submitExerciseAnswer(exerciseId, selectedAnswer);

      setIsAnswerCorrect(result.isCorrect);
      setFeedback(
        result.explanation || (result.isCorrect ? "Correct!" : "Incorrect!")
      );

      if (result.isCorrect) {
        setScore((prev) => prev + 1);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-[var(--color-blue)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-red-500 mb-4">{error}</h2>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (lessonCompleted) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="bg-white rounded-2xl p-8 shadow-md text-center">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 text-green-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-[var(--color-blue)]">
            Lesson Completed!
          </h1>

          <p className="text-lg mb-6">
            Congratulations! You've completed the lesson "{lesson?.title}".
          </p>

          <div className="bg-gray-100 rounded-lg p-4 mb-8">
            <h3 className="text-xl font-bold mb-2">Your Score</h3>
            <div className="text-4xl font-bold text-[var(--color-blue)]">
              {Math.round((score / exercises.length) * 100)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {score} correct out of {exercises.length} exercises
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/lessons")} variant="secondary">
              Back to Lessons
            </Button>

            <Button
              onClick={() => {
                setCurrentExerciseIndex(0);
                setScore(0);
                setLessonCompleted(false);
                setSelectedAnswer(null);
                setIsAnswerCorrect(null);
                setFeedback("");
              }}
            >
              Retry Lesson
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];

  if (!currentExercise) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl mb-4">No exercises found for this lesson.</h2>
        <Button onClick={() => navigate("/lessons")}>Back to Lessons</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-2xl p-6 shadow-md">
        {/* Lesson header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-[var(--color-blue)]">
            {lesson?.title}
          </h1>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Level: {lesson?.level}
            </span>
            <div className="text-sm text-[var(--color-blue)]">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-[var(--color-blue)] h-2 rounded-full"
              style={{
                width: `${(currentExerciseIndex / exercises.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Exercise content */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {currentExercise.question}
          </h2>

          {/* Video content if present */}
          {currentExercise.type === "VIDEO" && currentExercise.videoUrl && (
            <div className="aspect-w-16 aspect-h-9 mb-6">
              <iframe
                src={currentExercise.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-64 rounded-lg"
              ></iframe>
            </div>
          )}

          {/* Multiple choice options */}
          {currentExercise.type === "MULTIPLE_CHOICE" &&
            currentExercise.options && (
              <div className="space-y-3 mt-4">
                {currentExercise.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelection(option)}
                    className={`
                    p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${
                      selectedAnswer === option
                        ? "border-[var(--color-blue)] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                    ${
                      isAnswerCorrect !== null && selectedAnswer === option
                        ? isAnswerCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : ""
                    }
                  `}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}

          {/* Matching or drag-drop would have more complex UI components */}

          {/* Feedback area */}
          {feedback && (
            <div
              className={`
              mt-6 p-4 rounded-lg
              ${
                isAnswerCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            `}
            >
              <p className="font-medium">{feedback}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => navigate("/lessons")}>
            Exit Lesson
          </Button>

          {isAnswerCorrect === null ? (
            <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
              Check Answer
            </Button>
          ) : (
            <Button onClick={goToNextExercise}>
              {currentExerciseIndex < exercises.length - 1
                ? "Next Exercise"
                : "Complete Lesson"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
