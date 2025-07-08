import React, { useState, useEffect } from "react";
import type { Sign } from "../../../types/lesson";
import VideoCaptureUploader from "../../../components/VideoStream"

interface SignRecognitionExerciseProps {
  prompt: string;
  sign: Sign | null;
  loadingSign: boolean;
  selectedAnswer: string | null;
  onAnswerSubmit: () => void;
  onAnswerSelection: (answer: string) => void;
}

const SignRecognitionExercise: React.FC<SignRecognitionExerciseProps> = ({
  prompt,
  sign,
  loadingSign,
  selectedAnswer,
  onAnswerSubmit,
  onAnswerSelection,
}) => {
  const [cameraActive, setCameraActive] = useState(true);
  const correctSign = sign ? sign.word.toLowerCase() : "_null";

  const handleSubmit = () => {
    onAnswerSelection(correctSign);
    console.log("Selected answer:", selectedAnswer);
    if (selectedAnswer === correctSign) {
      onAnswerSubmit();
    }
  };

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

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-4 text-[var(--color-blue)]">
        {prompt}
      </h2>

      <div className="mb-8 bg-white p-4 rounded-lg shadow-md mx-auto">
        {cameraActive && (
          <VideoCaptureUploader
            goodAnswer={handleSubmit}
            badAnswer={() => {}}
            response={correctSign}
          />
        )}
      </div>

    </div>
  );
};

export default SignRecognitionExercise;
