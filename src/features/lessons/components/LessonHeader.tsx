import React from "react";
import { useTranslation } from "react-i18next";

interface LessonHeaderProps {
  title: string | undefined;
  level: string | undefined;
  currentExerciseIndex: number;
  totalExercises: number;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({
  title,
  level,
  currentExerciseIndex,
  totalExercises,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2 text-[var(--color-blue)]">
        {title}
      </h1>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {t("lessons.difficulty")}: {t(`lessons.${level?.toLowerCase()}`)}
        </span>
        <div className="text-sm text-[var(--color-blue)]">
          {t("lessons.detail.exerciseCount", {
            current: currentExerciseIndex + 1,
            total: totalExercises,
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className="bg-[var(--color-blue)] h-2 rounded-full"
          style={{
            width: `${(currentExerciseIndex / totalExercises) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default LessonHeader;
