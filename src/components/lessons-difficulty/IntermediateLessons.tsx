import React from "react";
import LessonCard from "../lessons/LessonCard";
import type { LessonWithProgress } from "../lessons/LessonCard";

interface IntermediateLessonsProps {
  lessons: LessonWithProgress[];
  beginnerLessons: LessonWithProgress[];
  onStatusChange?: () => void;
}

const IntermediateLessons: React.FC<IntermediateLessonsProps> = ({
  lessons,
  beginnerLessons,
  onStatusChange,
}) => {
  // If there are no intermediate lessons, we don't render anything
  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">
        Intermediate Path
      </h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {lessons.map((lesson, index) => {
          // For the list, the first displayed lesson (index = 0) is the first one to do
          // Lessons should be unlocked in sequence as previous ones are completed
          const isFirstLesson = index === 0;
          const isPreviousLessonCompleted =
            index > 0 ? lessons[index - 1]?.status === "COMPLETED" : true;
          const areAllBeginnerLessonsCompleted = beginnerLessons.every(
            (l) => l.status === "COMPLETED"
          );

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={beginnerLessons.length + index}
              isLocked={
                !areAllBeginnerLessonsCompleted || // All beginner lessons must be completed
                (!isFirstLesson && !isPreviousLessonCompleted) // If it's not the first lesson, the previous one must be completed
              }
              onStatusChange={onStatusChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default IntermediateLessons;
