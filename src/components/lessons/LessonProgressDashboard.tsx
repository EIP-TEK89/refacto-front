import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLessonProgress, getAllLessons } from "../../services/lessonService";
import type { Lesson, LessonProgress } from "../../types/lesson";
import { useTranslation } from "react-i18next";

const LessonProgressDashboard = () => {
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [progressData, lessonsData] = await Promise.all([
          getLessonProgress(),
          getAllLessons(),
        ]);

        setLessonProgress(progressData);
        setLessons(lessonsData);
      } catch (err) {
        console.error("Failed to fetch lesson progress:", err);
        setError("Failed to load your lesson progress");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-blue)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return <div className="py-4 text-red-500">{error}</div>;
  }

  // Calculate stats
  const completedLessons = lessonProgress.filter(
    (p) => p.status === "COMPLETED"
  ).length;
  const inProgressLessons = lessonProgress.filter(
    (p) => p.status === "IN_PROGRESS"
  ).length;
  const totalLessons = lessons.length;
  const completionPercentage = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  // Get recent progress (last 5)
  const recentProgress = [...lessonProgress]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="lesson-progress-dashboard">
      {/* Overall progress */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t("profile.tabs.complete.yourLearingProgress")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-[var(--color-blue)]">
              {completedLessons}
            </div>
            <div className="text-gray-600">{t("profile.tabs.complete.completedLessons")}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-yellow-500">
              {inProgressLessons}
            </div>
            <div className="text-gray-600">{t("profile.tabs.complete.lessonsInProgress")}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-500">
              {completionPercentage}%
            </div>
            <div className="text-gray-600">{t("profile.tabs.complete.overallCompletion")}</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">{t("profile.tabs.complete.overallProgress")}</span>
          <span className="text-sm font-semibold">
            {completedLessons} / {totalLessons}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[var(--color-blue)] h-2.5 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Recent activity */}
      {recentProgress.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("profile.tabs.complete.recentActivity")}</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {recentProgress.map((progress) => {
              const lesson = lessons.find((l) => l.id === progress.lessonId);
              return (
                <div key={progress.id} className="p-4 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-[var(--color-blue)]">
                        {lesson?.title || "Unknown Lesson"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {progress.status === "COMPLETED"
                          ? `${t("profile.tabs.complete.completedOn")} ${new Date(
                              progress.updatedAt
                            ).toLocaleDateString()}`
                          : `${t("profile.tabs.complete.lastUpdated")} ${new Date(
                              progress.updatedAt
                            ).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${
                          progress.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      `}
                      >
                        {progress.status === "COMPLETED"
                          ? t("lessons.completed")
                          : t("lessons.inProgress")}
                      </span>
                    </div>
                  </div>
                  {progress.status === "COMPLETED" && (
                    <div className="mt-2">
                      <span className="text-sm font-medium">
                        Score: {progress.score}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/lessons"
              className="text-[var(--color-blue)] hover:underline"
            >
              {t("profile.tabs.complete.viewAllLessons")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-center">
            {t("profile.tabs.complete.noLessonStarted")}
            <Link
              to="/lessons"
              className="text-[var(--color-blue)] font-medium ml-1 hover:underline"
            >
              {t("profile.tabs.complete.beginLearningJourney")}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonProgressDashboard;
