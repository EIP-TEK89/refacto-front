import React from "react";
import LessonCard from "../lessons/LessonCard";
import type { LessonWithProgress } from "../lessons/LessonCard";

interface AdvancedLessonsProps {
  lessons: LessonWithProgress[];
  beginnerLessons: LessonWithProgress[];
  intermediateLessons: LessonWithProgress[];
}

const AdvancedLessons: React.FC<AdvancedLessonsProps> = ({
  lessons,
  beginnerLessons,
  intermediateLessons,
}) => {
  // If no advanced lessons, render nothing
  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">
        Advanced Path
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
          const areAllIntermediateLessonsCompleted = intermediateLessons.every(
            (l) => l.status === "COMPLETED"
          );

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={
                beginnerLessons.length + intermediateLessons.length + index
              }
              isLocked={
                !areAllBeginnerLessonsCompleted ||
                !areAllIntermediateLessonsCompleted ||
                (!isFirstLesson && !isPreviousLessonCompleted) // If it's not the first lesson, the previous one must be completed
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedLessons;
