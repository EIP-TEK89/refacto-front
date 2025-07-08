import React from "react";
import { Button } from "../../../components/ui";
import type { Exercise, Sign } from "../../../types/lesson";
import WordToImageExercise from "./WordToImageExercise";
import ImageToWordExercise from "./ImageToWordExercise";
import SignRecognitionExercise from "./SignRecognitionExercise";
import FeedbackSection from "./FeedbackSection";
import { useTranslation } from "react-i18next";

interface ExerciseContentProps {
  exercise: Exercise;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  feedback: string;
  sign: Sign | null;
  loadingSign: boolean;
  onAnswerSelection: (answer: string) => void;
  onAnswerSubmit: () => void;
  onNextExercise: () => void;
  onExitLesson: () => void;
  isLastExercise: boolean;
  signCache?: {
    getSignByWord: (word: string) => Promise<Sign | null>;
    getRandomSigns: (count: number, excludeId?: string) => Sign[];
  };
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  selectedAnswer,
  isAnswerCorrect,
  feedback,
  sign,
  loadingSign,
  onAnswerSelection,
  onAnswerSubmit,
  onNextExercise,
  onExitLesson,
  isLastExercise,
  signCache,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Exercise content based on type */}
      {exercise.type === "WORD_TO_IMAGE" && (
        <WordToImageExercise
          prompt={exercise.prompt}
          options={exercise.options}
          sign={sign}
          loadingSign={loadingSign}
          selectedAnswer={selectedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          onAnswerSelection={onAnswerSelection}
        />
      )}

      {exercise.type === "IMAGE_TO_WORD" && (
        <ImageToWordExercise
          prompt={exercise.prompt}
          options={exercise.options}
          sign={sign}
          loadingSign={loadingSign}
          selectedAnswer={selectedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          onAnswerSelection={onAnswerSelection}
          signCache={signCache}
        />
      )}

      {exercise.type === "SIGN_RECOGNITION" && (
        <SignRecognitionExercise
          prompt={exercise.prompt}
          sign={sign}
          loadingSign={loadingSign}
          selectedAnswer={selectedAnswer}
          onAnswerSubmit={onAnswerSubmit}
          onAnswerSelection={onAnswerSelection}
        />
      )}

      {/* Feedback area */}
      <FeedbackSection feedback={feedback === "Try again!" ? "Incorrect!" : feedback} isAnswerCorrect={isAnswerCorrect} />

      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={onExitLesson}>
          {t("lessons.exitLesson")}
        </Button>

        {isAnswerCorrect === null ? (
          <Button
            onClick={onAnswerSubmit}
            disabled={exercise.type !== "SIGN_RECOGNITION" && !selectedAnswer}
          >
            {t("lessons.checkAnswer")}
          </Button>
        ) : (
          <Button onClick={onNextExercise}>
            {isLastExercise ? t("lessons.completeLesson") : t("lessons.nextExercice")}
          </Button>
        )}
      </div>
    </>
  );
};

export default ExerciseContent;
