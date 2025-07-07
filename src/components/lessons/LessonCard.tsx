import { Link } from "react-router-dom";
import { Button } from "../ui";
import type { Lesson } from "../../types/lesson";
import { resetLessonProgress } from "../../services/lessonService";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface LessonWithProgress extends Lesson {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

interface LessonCardProps {
  lesson: LessonWithProgress;
  index: number;
  isLocked: boolean;
  onStatusChange?: () => void; // Callback when lesson status changes
}

const LessonCard = ({
  lesson,
  index,
  isLocked,
  onStatusChange,
}: LessonCardProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const { t } = useTranslation();

  const getStatusColor = () => {
    switch (lesson.status) {
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (lesson.status === "NOT_STARTED") return;

    try {
      setIsResetting(true);
      await resetLessonProgress(lesson.id);
      // Notify parent component about the status change
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err) {
      console.error("Failed to reset lesson progress:", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      className={`
        relative rounded-2xl p-5 border-2 w-[280px] h-[180px] flex flex-col justify-between
        ${
          isLocked
            ? "border-gray-400 bg-gray-100 opacity-70"
            : "border-[var(--color-border)] hover:shadow-md transition-all duration-200"
        }
      `}
    >
      {/* Level indicator */}
      <div className="absolute top-3 right-3 text-xs py-1 px-2 rounded-full bg-[var(--color-blue)] text-white">
        {t(`lessons.${lesson.level.toLowerCase()}`)}
      </div>

      {/* Lesson number */}
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-blue)] text-white font-bold shadow-md">
        {index + 1}
      </div>

      <div className="flex flex-col mt-5">
        <h3 className="text-lg font-bold mb-2">{lesson.title}</h3>
        <p className="text-sm line-clamp-2">{lesson.description}</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-xs">
            {lesson.status === "COMPLETED"
              ? t("lessons.completed")
              : lesson.status === "IN_PROGRESS"
              ? t("lessons.inProgress")
              : t("lessons.toDo")}
          </span>
        </div>

        {isLocked ? (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-sm text-gray-500">{t("lessons.locked")}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            {lesson.status !== "NOT_STARTED" && (
              <Button
                variant="link"
                size="sm"
                className="text-red-500 hover:bg-red-50 px-2"
                onClick={handleReset}
                disabled={isResetting}
              >
                {isResetting ? "..." : t("lessons.reset")}
              </Button>
            )}
            <Link to={`/lessons/${lesson.id}`}>
              <Button
                variant="primary"
                size="sm"
                className={lesson.status === "COMPLETED" ? "bg-green-500" : ""}
              >
                {lesson.status === "COMPLETED"
                  ? t("lessons.reDo")
                  : lesson.status === "IN_PROGRESS"
                  ? t("lessons.continue")
                  : t("lessons._start")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonCard;
