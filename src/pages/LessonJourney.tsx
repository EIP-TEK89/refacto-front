import { useState, useEffect } from "react";
import { getAllLessons, getLessonProgress } from "../services/lessonService";
import { useAuthState } from "../store/auth/hooks";
import { Button } from "../components/ui";
import {
  BeginnerLessons,
  IntermediateLessons,
  AdvancedLessons,
  type LessonWithProgress,
} from "../components/lessons";

const LessonJourney = () => {
  const { isAuthenticated } = useAuthState();
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonsWithProgress = async () => {
      try {
        setLoading(true);
        const allLessons = await getAllLessons();

        if (isAuthenticated) {
          // If user is authenticated, get their progress
          const progress = await getLessonProgress();

          // Map lessons with progress
          const lessonsWithProgress = allLessons.map((lesson) => {
            const lessonProgress = progress.find(
              (p) => p.lessonId === lesson.id
            );
            return {
              ...lesson,
              status: lessonProgress?.status || "NOT_STARTED",
            };
          });

          setLessons(lessonsWithProgress);
        } else {
          // For non-authenticated users, show all lessons as not started
          setLessons(
            allLessons.map((lesson) => ({
              ...lesson,
              status: "NOT_STARTED",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
        setError("Failed to load lessons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonsWithProgress();
  }, [isAuthenticated]);

  // Group lessons by level
  const beginnerLessons = lessons
    .filter((lesson) => lesson.level === "BEGINNER")
    .reverse();
  const intermediateLessons = lessons
    .filter((lesson) => lesson.level === "INTERMEDIATE")
    .reverse();
  const advancedLessons = lessons
    .filter((lesson) => lesson.level === "ADVANCED")
    .reverse();

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-[var(--color-blue)]">
        Your Sign Language Journey
      </h1>

      <BeginnerLessons lessons={beginnerLessons} />

      <IntermediateLessons
        lessons={intermediateLessons}
        beginnerLessons={beginnerLessons}
      />

      <AdvancedLessons
        lessons={advancedLessons}
        beginnerLessons={beginnerLessons}
        intermediateLessons={intermediateLessons}
      />
    </div>
  );
};

export default LessonJourney;
