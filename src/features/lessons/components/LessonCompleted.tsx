import React from "react";
import { Button } from "../../../components/ui";
import { useTranslation } from "react-i18next";

interface LessonCompletedProps {
  lessonTitle: string | undefined;
  score: number;
  totalExercises: number;
  onRetry: () => void;
  onBackToLessons: () => void;
}

const LessonCompleted: React.FC<LessonCompletedProps> = ({
  lessonTitle,
  score,
  totalExercises,
  onRetry,
  onBackToLessons,
}) => {
  const percentageScore = Math.round((score / totalExercises) * 100);
  const { t } = useTranslation();

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
          {t("lessons.completed.title")}
        </h1>

        <p className="text-lg mb-6 text-[#384e5a]">
          {t("lessons.completed.congratulations", { lessonTitle })}
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-8">
          <h3 className="text-xl font-bold mb-2 text-[#384e5a]">
            {t("lessons.completed.yourScore")}
          </h3>
          <div className="text-4xl font-bold text-[var(--color-blue)]">
            {percentageScore}%
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {t("lessons.completed.scoreDetails", {
              score,
              total: totalExercises,
            })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onBackToLessons} variant="secondary">
            {t("lessons.detail.back")}
          </Button>

          <Button onClick={onRetry}>{t("lessons.completed.retry")}</Button>
        </div>
      </div>
    </div>
  );
};

export default LessonCompleted;
