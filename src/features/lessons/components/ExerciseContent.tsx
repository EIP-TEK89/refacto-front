import React from "react";
import { Button } from "../../../components/ui";
import type { Exercise, Sign } from "../../../types/lesson";
import WordToImageExercise from "./WordToImageExercise";
import ImageToWordExercise from "./ImageToWordExercise";
import SignRecognitionExercise from "./SignRecognitionExercise";
import FeedbackSection from "./FeedbackSection";

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
}) => {
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
        />
      )}

      {exercise.type === "SIGN_RECOGNITION" && (
        <SignRecognitionExercise
          prompt={exercise.prompt}
          sign={sign}
          loadingSign={loadingSign}
          selectedAnswer={selectedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          onAnswerSelection={onAnswerSelection}
        />
      )}

      {/* Feedback area */}
      <FeedbackSection feedback={feedback} isAnswerCorrect={isAnswerCorrect} />

      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={onExitLesson}>
          Exit Lesson
        </Button>

        {isAnswerCorrect === null ? (
          <Button onClick={onAnswerSubmit} disabled={!selectedAnswer}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={onNextExercise}>
            {isLastExercise ? "Complete Lesson" : "Next Exercise"}
          </Button>
        )}
      </div>
    </>
  );
};

export default ExerciseContent;
