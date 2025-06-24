import React from "react";
import LessonCard from "../lessons/LessonCard";
import type { LessonWithProgress } from "../lessons/LessonCard";

interface BeginnerLessonsProps {
  lessons: LessonWithProgress[];
}

const BeginnerLessons: React.FC<BeginnerLessonsProps> = ({ lessons }) => {
  // Nous travaillons avec lessons qui est déjà filtré et inversé dans le composant parent

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">
        Beginner Path
      </h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {lessons.map((lesson, index) => {
          // Pour la liste inversée, la première leçon (index 0) doit être verrouillée sauf si toutes les autres sont terminées
          const isFirstLesson = index === 0;
          const isPreviousLessonCompleted =
            index > 0 ? lessons[index - 1]?.status === "COMPLETED" : true;
          const areAllOtherLessonsCompleted = lessons
            .slice(1)
            .every((l) => l.status === "COMPLETED");

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={lessons.length - index - 1}
              isLocked={
                isFirstLesson
                  ? !areAllOtherLessonsCompleted
                  : !isPreviousLessonCompleted
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default BeginnerLessons;
