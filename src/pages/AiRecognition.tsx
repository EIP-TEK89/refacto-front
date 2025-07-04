import { useState } from "react";
import { useTranslation } from "react-i18next";
import VideoCaptureUploader from "../components/VideoStream";

// Liste des signes à reconnaître
const AVAILABLE_SIGNS = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
  { id: "d", label: "D" },
  { id: "e", label: "E" },
  { id: "f", label: "F" },
  { id: "g", label: "G" },
  { id: "h", label: "H" },
];

const AiRecognitionPage = () => {
  const { t } = useTranslation();
  const [currentSign, setCurrentSign] = useState(AVAILABLE_SIGNS[0]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success"
  );

  // Fonction appelée lorsque le signe reconnu est correct
  const handleCorrectAnswer = () => {
    setCorrectAnswers((prev) => prev + 1);
    setTotalAttempts((prev) => prev + 1);
    setFeedbackMessage(t("ai.feedback.correct"));
    setFeedbackType("success");
    setShowFeedback(true);

    // Choisir aléatoirement un nouveau signe après 2 secondes
    setTimeout(() => {
      setShowFeedback(false);
      const nextSignIndex = Math.floor(Math.random() * AVAILABLE_SIGNS.length);
      setCurrentSign(AVAILABLE_SIGNS[nextSignIndex]);
    }, 2000);
  };

  // Fonction appelée lorsque l'utilisateur abandonne ou souhaite passer au signe suivant
  const handleSkip = () => {
    setTotalAttempts((prev) => prev + 1);
    setFeedbackMessage(t("ai.feedback.skipped"));
    setFeedbackType("error");
    setShowFeedback(true);

    // Choisir aléatoirement un nouveau signe après 1 seconde
    setTimeout(() => {
      setShowFeedback(false);
      const nextSignIndex = Math.floor(Math.random() * AVAILABLE_SIGNS.length);
      setCurrentSign(AVAILABLE_SIGNS[nextSignIndex]);
    }, 1000);
  };

  // Calcul de la précision
  const accuracy =
    totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[var(--color-blue)]">
        {t("ai.title")}
      </h1>

      <div className="mb-8 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-[var(--color-blue)]">
          {t("ai.instructions.title")}
        </h2>
        <p className="mb-4 text-[#3c3c40]">
          {t("ai.instructions.description")}
        </p>
        <div className="flex items-center justify-center bg-white p-4 rounded-lg shadow-md mb-4">
          <span className="text-4xl font-bold text-[var(--color-blue)]">
            {currentSign.label}
          </span>
        </div>
        <p className="font-medium text-[#3c3c40]">
          {t("ai.currentTask")}:{" "}
          <span className="text-[var(--color-blue)] font-bold">
            {t("ai.makeSign", { sign: currentSign.label })}
          </span>
        </p>
      </div>

      {/* Feedback message */}
      {showFeedback && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            feedbackType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedbackMessage}
        </div>
      )}

      {/* Video capture component */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-md mx-auto">
        <VideoCaptureUploader
          goodAnswer={handleCorrectAnswer}
          badAnswer={() => {}}
          response={currentSign.id}
        />
      </div>

      {/* Stats */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-[var(--color-blue)]">
            {t("ai.stats.correct")}
          </h3>
          <p className="text-2xl font-bold text-[#3c3c60]">{correctAnswers}</p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-[var(--color-blue)]">
            {t("ai.stats.attempts")}
          </h3>
          <p className="text-2xl font-bold text-[#3c3c60]">{totalAttempts}</p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-[var(--color-blue)]">
            {t("ai.stats.accuracy")}
          </h3>
          <p className="text-2xl font-bold text-[#3c3c60]">{accuracy}%</p>
        </div>
      </div>

      {/* Skip button */}
      <div className="flex justify-center">
        <button
          onClick={handleSkip}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition duration-200"
        >
          {t("ai.actions.skip")}
        </button>
      </div>
    </div>
  );
};

export default AiRecognitionPage;
