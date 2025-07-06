import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import VideoCaptureUploader from "../components/VideoStream";
import { ALPHABET_SIGNS, BASIC_SIGNS } from "../constants/signs";

const AiRecognitionPage = () => {
  const { t } = useTranslation();
  const [useFullAlphabet, setUseFullAlphabet] = useState(true); // Modifié à true par défaut
  const signsToUse = useFullAlphabet ? ALPHABET_SIGNS : BASIC_SIGNS;
  const [currentSign, setCurrentSign] = useState(() => {
    // Choisir un signe aléatoire dès le départ
    const randomIndex = Math.floor(Math.random() * signsToUse.length);
    return signsToUse[randomIndex];
  });
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success"
  );
  const [cameraActive, setCameraActive] = useState(true);

  // Si le mode (alphabet complet/simplifié) change, mettre à jour le signe actuel
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * signsToUse.length);
    setCurrentSign(signsToUse[randomIndex]);
  }, [useFullAlphabet, signsToUse]);

  // Désactiver la caméra lorsqu'on quitte la page
  useEffect(() => {
    // Activer la caméra lorsque le composant est monté
    setCameraActive(true);

    // Fonction de nettoyage qui sera appelée lors du démontage du composant
    return () => {
      console.log("AiRecognition page unmounting - disabling camera");
      setCameraActive(false);
    };
  }, []);

  // Si l'URL change, désactiver la caméra
  useEffect(() => {
    const handleBeforeUnload = () => {
      setCameraActive(false);
    };

    // Ajouter un gestionnaire pour les événements de déchargement de page
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
      const nextSignIndex = Math.floor(Math.random() * signsToUse.length);
      setCurrentSign(signsToUse[nextSignIndex]);
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
      const nextSignIndex = Math.floor(Math.random() * signsToUse.length);
      setCurrentSign(signsToUse[nextSignIndex]);
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

        {/* Mode selector */}
        <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm mb-4">
          <span className="text-sm font-medium text-[#3c3c40]">
            {useFullAlphabet
              ? t("ai.mode.full") || "Alphabet complet"
              : t("ai.mode.basic") || "Mode simplifié (A-H)"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useFullAlphabet}
              onChange={() => setUseFullAlphabet((prev) => !prev)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-blue)]"></div>
          </label>
        </div>

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
        {cameraActive && (
          <VideoCaptureUploader
            goodAnswer={handleCorrectAnswer}
            badAnswer={() => {}}
            response={currentSign.id}
          />
        )}
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
