import { useState, useEffect, useCallback } from "react";
import { getAllLessons, getLessonProgress } from "../services/lessonService";
import { useAuthState } from "../store/auth/hooks";
import { Button } from "../components/ui";
import {
  BeginnerLessons,
  IntermediateLessons,
  AdvancedLessons,
} from "../components/lessons-difficulty";
import type { LessonWithProgress } from "../components/lessons/LessonCard";
import { useLocation } from "react-router-dom";

const LessonJourney = () => {
  const { isAuthenticated } = useAuthState();
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const location = useLocation();

  // Refresh lessons when location changes (user comes back from a lesson)
  useEffect(() => {
    setLastRefresh(Date.now());
  }, [location.pathname]);

  // Manual refresh function
  const handleRefresh = () => {
    setLastRefresh(Date.now());
  };

  // Create a memoized fetchLessonsWithProgress function
  const fetchLessonsWithProgress = useCallback(async () => {
    try {
      setLoading(true);
      const allLessons = await getAllLessons();

      if (isAuthenticated) {
        // If user is authenticated, get their progress
        const progress = await getLessonProgress();

        // Map lessons with progress
        const lessonsWithProgress = allLessons.map((lesson) => {
          const lessonProgress = progress.find((p) => p.lessonId === lesson.id);

          if (!lessonProgress) {
            return {
              ...lesson,
              status: "NOT_STARTED" as const,
            };
          }

          // Use the status from progress, which should be correct now
          return {
            ...lesson,
            status: lessonProgress.status as
              | "NOT_STARTED"
              | "IN_PROGRESS"
              | "COMPLETED",
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
  }, [isAuthenticated]);

  // Effect to load lessons on initial render, auth change, or manual refresh
  useEffect(() => {
    fetchLessonsWithProgress();
  }, [fetchLessonsWithProgress, lastRefresh]);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-blue)]">
          Your Sign Language Journey
        </h1>
        <Button
          onClick={handleRefresh}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <span>{loading ? "Refreshing..." : "Refresh Progress"}</span>
          {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          )}
        </Button>
      </div>

      <BeginnerLessons
        lessons={beginnerLessons}
        onStatusChange={handleRefresh}
      />

      <IntermediateLessons
        lessons={intermediateLessons}
        beginnerLessons={beginnerLessons}
        onStatusChange={handleRefresh}
      />

      <AdvancedLessons
        lessons={advancedLessons}
        beginnerLessons={beginnerLessons}
        intermediateLessons={intermediateLessons}
        onStatusChange={handleRefresh}
      />
    </div>
  );
};

export default LessonJourney;
