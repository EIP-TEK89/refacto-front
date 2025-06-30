import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { ROUTES } from "../../constants/routes";
import { useLessonDetail } from "./hooks";
import { LessonHeader, ExerciseContent, LessonCompleted } from "./components";
import { useTranslation } from "react-i18next";

const LessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    lesson,
    exercises,
    currentExerciseIndex,
    selectedAnswer,
    isAnswerCorrect,
    feedback,
    score,
    loading,
    error,
    lessonCompleted,
    sign,
    loadingSign,
    handleAnswerSelection,
    handleAnswerSubmit,
    goToNextExercise,
    resetLesson,
    currentExercise,
    signCache,
  } = useLessonDetail(lessonId);

  const handleExitLesson = () => {
    navigate(ROUTES.LESSONS);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-[var(--color-blue)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-red-500 mb-4">{error}</h2>
        <Button onClick={() => window.location.reload()}>
          {t("lessons.tryAgain")}
        </Button>
      </div>
    );
  }

  if (lessonCompleted) {
    return (
      <LessonCompleted
        lessonTitle={lesson?.title}
        score={score}
        totalExercises={exercises.length}
        onRetry={resetLesson}
        onBackToLessons={handleExitLesson}
      />
    );
  }

  if (!currentExercise) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl mb-4">{t("lessons.detail.noExercises")}</h2>
        <Button onClick={handleExitLesson}>{t("lessons.detail.back")}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-2xl p-6 shadow-md">
        {/* Lesson header with title, level and progress */}
        <LessonHeader
          title={lesson?.title}
          level={lesson?.level}
          currentExerciseIndex={currentExerciseIndex}
          totalExercises={exercises.length}
        />

        {/* Exercise content */}
        <div className="mb-6">
          <ExerciseContent
            exercise={currentExercise}
            selectedAnswer={selectedAnswer}
            isAnswerCorrect={isAnswerCorrect}
            feedback={feedback}
            sign={sign}
            loadingSign={loadingSign}
            onAnswerSelection={handleAnswerSelection}
            onAnswerSubmit={handleAnswerSubmit}
            onNextExercise={goToNextExercise}
            onExitLesson={handleExitLesson}
            isLastExercise={currentExerciseIndex === exercises.length - 1}
            signCache={signCache}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
