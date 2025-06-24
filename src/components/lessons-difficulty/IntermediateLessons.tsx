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
          // Pour la liste, la première leçon affichée (index = 0) est la première à faire
          // Les leçons doivent être déverrouillées en séquence au fur et à mesure que les précédentes sont terminées
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
                !areAllBeginnerLessonsCompleted || // Toutes les leçons débutantes doivent être terminées
                (!isFirstLesson && !isPreviousLessonCompleted) // Si ce n'est pas la première leçon, la précédente doit être terminée
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default IntermediateLessons;
