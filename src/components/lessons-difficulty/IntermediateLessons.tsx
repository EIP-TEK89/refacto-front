import React from "react";
import LessonCard from "../lessons/LessonCard";
import type { LessonWithProgress } from "../lessons/LessonCard";

interface IntermediateLessonsProps {
  lessons: LessonWithProgress[];
  beginnerLessons: LessonWithProgress[];
}

const IntermediateLessons: React.FC<IntermediateLessonsProps> = ({
  lessons,
  beginnerLessons,
}) => {
  // Si aucune leçon intermédiaire, on ne rend rien
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
          // Pour la liste inversée, la première leçon (index 0) doit être verrouillée
          // sauf si toutes les leçons débutantes et les autres intermédiaires sont terminées
          const isFirstLesson = index === 0;
          const isPreviousLessonCompleted =
            index > 0 ? lessons[index - 1]?.status === "COMPLETED" : true;
          const areAllBeginnerLessonsCompleted = beginnerLessons.every(
            (l) => l.status === "COMPLETED"
          );
          const areAllOtherIntermediateLessonsCompleted = lessons
            .slice(1)
            .every((l) => l.status === "COMPLETED");

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={beginnerLessons.length + lessons.length - index - 1}
              isLocked={
                !areAllBeginnerLessonsCompleted ||
                (isFirstLesson
                  ? !areAllOtherIntermediateLessonsCompleted
                  : !isPreviousLessonCompleted)
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default IntermediateLessons;
