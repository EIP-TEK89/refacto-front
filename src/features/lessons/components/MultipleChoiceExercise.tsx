import React from "react";

interface MultipleChoiceExerciseProps {
  prompt: string;
  options: string[] | undefined;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  onAnswerSelection: (answer: string) => void;
}

const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  prompt,
  options,
  selectedAnswer,
  isAnswerCorrect,
  onAnswerSelection,
}) => {
  if (!options) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--color-blue)]">
        {prompt}
      </h2>
      <div className="space-y-3 mt-4">
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => onAnswerSelection(option)}
            className={`
            p-4 border-2 rounded-xl cursor-pointer transition-all
            ${
              selectedAnswer === option
                ? "border-[var(--color-blue)] bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }
            ${
              isAnswerCorrect !== null && selectedAnswer === option
                ? isAnswerCorrect
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
                : ""
            }
          `}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceExercise;
