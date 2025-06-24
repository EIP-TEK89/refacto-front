import React from "react";

interface FeedbackSectionProps {
  feedback: string;
  isAnswerCorrect: boolean | null;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedback,
  isAnswerCorrect,
}) => {
  if (!feedback) return null;

  return (
    <div
      className={`
      mt-6 p-4 rounded-lg
      ${
        isAnswerCorrect
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }
    `}
    >
      <p className="font-medium">{feedback}</p>
    </div>
  );
};

export default FeedbackSection;
