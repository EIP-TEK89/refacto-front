import React, { useState } from "react";
import type { Sign } from "../../../types/lesson";

interface SignRecognitionExerciseProps {
  prompt: string;
  sign: Sign | null;
  loadingSign: boolean;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  onAnswerSelection: (answer: string) => void;
}

const SignRecognitionExercise: React.FC<SignRecognitionExerciseProps> = ({
  prompt,
  sign,
  loadingSign,
  selectedAnswer,
  isAnswerCorrect,
  onAnswerSelection,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAnswerSelection(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

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

          <div className="w-full mt-4">
            <div className="relative">
              <input
                type="text"
                value={selectedAnswer !== null ? selectedAnswer : inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isAnswerCorrect !== null}
                placeholder="Type the sign meaning here..."
                className={`
                  w-full p-3 border-2 rounded-lg 
                  ${
                    isAnswerCorrect === true
                      ? "border-green-500 bg-green-50"
                      : isAnswerCorrect === false
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }
                  outline-none focus:border-blue-500
                `}
              />
              {isAnswerCorrect === null && (
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-2.5 bg-[var(--color-blue)] text-white px-4 py-1 rounded-lg disabled:opacity-50"
                >
                  Submit
                </button>
              )}
            </div>
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

export default SignRecognitionExercise;
