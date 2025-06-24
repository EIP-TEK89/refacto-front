import React from "react";

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
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2 text-[var(--color-blue)]">
        {title}
      </h1>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Level: {level}</span>
        <div className="text-sm text-[var(--color-blue)]">
          Exercise {currentExerciseIndex + 1} of {totalExercises}
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
