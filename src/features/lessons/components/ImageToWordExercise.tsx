import React from "react";
import type { Sign } from "../../../types/lesson";

interface ImageToWordExerciseProps {
  prompt: string;
  options: string[] | undefined;
  sign: Sign | null;
  loadingSign: boolean;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  onAnswerSelection: (answer: string) => void;
}

const ImageToWordExercise: React.FC<ImageToWordExerciseProps> = ({
  prompt,
  options,
  sign,
  loadingSign,
  selectedAnswer,
  isAnswerCorrect,
  onAnswerSelection,
}) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-4 text-[var(--color-blue)]">
        {prompt}
      </h2>

      {loadingSign ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-blue)] border-t-transparent rounded-full"></div>
        </div>
      ) : sign ? (
        <div className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl">
          <img
            src={sign.mediaUrl}
            alt="Sign to identify"
            className="w-64 h-64 object-contain mb-4"
          />

          {/* Grid for options */}
          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            {options?.map((option, index) => (
              <div
                key={index}
                onClick={() => onAnswerSelection(option)}
                className={`
                p-4 border-2 rounded-xl cursor-pointer transition-all text-center font-semibold
                ${
                  selectedAnswer === option
                    ? "border-[var(--color-blue)] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }
                ${
                  isAnswerCorrect !== null && selectedAnswer === option
                    ? isAnswerCorrect
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-red-500 bg-red-50 text-red-700"
                    : "text-[#58cc02]"
                }
              `}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-red-500">
          Sign data not available
        </div>
      )}
    </div>
  );
};

export default ImageToWordExercise;
