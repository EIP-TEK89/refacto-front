import React from "react";
import LessonCard from "../lessons/LessonCard";
import type { LessonWithProgress } from "../lessons/LessonCard";

interface BeginnerLessonsProps {
  lessons: LessonWithProgress[];
  onStatusChange?: () => void;
}

const BeginnerLessons: React.FC<BeginnerLessonsProps> = ({
  lessons,
  onStatusChange,
}) => {
  // We are working with lessons that are already filtered and reversed in the parent component

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">
        Beginner Path
      </h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {lessons.map((lesson, index) => {
          // For the reversed list, the first displayed lesson (index = 0) is the first one to do
          // The lessons should be unlocked in sequence as the previous ones are completed
          const isFirstLesson = index === 0;
          const isPreviousLessonCompleted =
            index > 0 ? lessons[index - 1]?.status === "COMPLETED" : true;

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index} // Displays the real number (1, 2, 3...)
              isLocked={
                !isFirstLesson && // If it's not the first displayed lesson (which is always unlocked)
                !isPreviousLessonCompleted // It is locked if the previous lesson is not completed
              }
              onStatusChange={onStatusChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BeginnerLessons;
