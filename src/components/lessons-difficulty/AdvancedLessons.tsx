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
  // Si aucune leçon avancée, on ne rend rien
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
          // Pour la liste, la première leçon affichée (index = 0) est la première à faire
          // Les leçons doivent être déverrouillées en séquence au fur et à mesure que les précédentes sont terminées
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
                (!isFirstLesson && !isPreviousLessonCompleted) // Si ce n'est pas la première leçon, la précédente doit être terminée
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedLessons;
