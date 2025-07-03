import { useState, useEffect, useRef } from "react";
import { drawHandLandmarkerResult, SignRecognizer } from "triosigno-lib-core";
import VideoFetcher from "../utils/videoFetcher";
import { OnnxRunnerWeb, MediapipeRunnerWeb } from "triosigno-lib-web";
import { useTranslation } from "react-i18next";
import "../styles/VideoStream.css";

export const API_URL: string =
  import.meta.env.VITE_API_URL + import.meta.env.VITE_API_SUFFIX_URL;

interface VideoCaptureUploaderProps {
  goodAnswer: () => void;
  badAnswer: () => void;
  response: string;
}

const VideoCaptureUploader = ({
  goodAnswer,
  response,
}: VideoCaptureUploaderProps) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outputSign, setOutputSign] = useState<string>("");
  const [hasMatched, setHasMatched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [text, setText] = useState<string>("");

  // Effet pour vérifier si la réponse correspond au signe détecté
  useEffect(() => {
    if (response === outputSign && outputSign && !hasMatched) {
      goodAnswer();
      setHasMatched(true);

      // Réinitialiser hasMatched après un court délai pour permettre de nouvelles correspondances
      setTimeout(() => {
        setHasMatched(false);
      }, 2000);
    }
  }, [outputSign, response, goodAnswer, hasMatched]);

  // Initialisation du video fetcher, du canvas et du sign recognizer
  useEffect(() => {
    setIsLoading(true);
    let animationFrameId: number;

    // Obtenez l'élément canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configurez les dimensions du canvas
    canvas.width = 640;
    canvas.height = 480;

    // Obtenez le contexte de dessin
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Créez les instances nécessaires
    const videoFetcher = new VideoFetcher();

    // Utilisez une URL directe au modèle pour éviter les problèmes de chemin
    const modelUrl = `${API_URL}/files/models/alphabet`;
    console.log("Model URL:", modelUrl);

    // Démarrez la caméra d'abord
    videoFetcher
      .startCamera()
      .then(async (success) => {
        setCameraActive(success);

        if (!success) {
          console.error("Failed to start camera");
          setIsLoading(false);
          return;
        }

        try {
          // Suivons l'approche Svelte avec OnnxRunnerWeb et MediapipeRunnerWeb
          console.log("Creating runners...");

          // Initialisation de OnnxRunnerWeb avec l'URL du modèle directement
          const onnxRunner = new OnnxRunnerWeb(
            `${API_URL}/files/models/alphabet`
          );

          // Initialisation de MediapipeRunnerWeb
          const mediapipeRunner = new MediapipeRunnerWeb();

          console.log("Initializing SignRecognizer...");

          // Créez une instance du SignRecognizer avec les deux runners
          const signRecognizer = new SignRecognizer<HTMLVideoElement>(
            onnxRunner as any,
            mediapipeRunner as any
          );

          console.log("SignRecognizer initialized successfully");
          setIsLoading(false);

          // Fonction de dessin sur le canvas similaire à l'exemple Svelte
          function draw() {
            if (!canvas) return;

            // Récupération de la frame vidéo
            const frame = videoFetcher.getFrame();

            if (frame && ctx) {
              // Effacez le canvas et dessinez la nouvelle frame
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

              try {
                // Prédiction du signe à partir de la frame
                const result = signRecognizer.predict(frame);
                console.log(result);

                // Si des landmarks de main sont détectés, dessinez-les
                if (result && result.landmarks) {
                  console.log(
                    "Sign Recognizer Result:",
                    result,
                    result.landmarks.l_hand_position
                  );
                  drawHandLandmarkerResult(ctx, result.landmarks);
                }

                // Mise à jour du signe détecté
                if (result && result.signLabel) {
                  setOutputSign(result.signLabel);
                  setText(`Output sign: ${result.signLabel}`);
                }
              } catch (error) {
                console.error("Error during sign prediction:", error);
                setText(
                  `Error: ${
                    error instanceof Error ? error.message : String(error)
                  }`
                );
              }
            }

            // Boucle d'animation
            animationFrameId = requestAnimationFrame(draw);
          }

          // Démarrer la boucle de dessin
          draw();
        } catch (error) {
          console.error("Failed to initialize SignRecognizer:", error);
          setIsLoading(false);
          return;
        }
      })
      .catch((error) => {
        console.error("Error initializing camera:", error);
        setIsLoading(false);
      });

    // Nettoyage lors du démontage du composant
    return () => {
      videoFetcher.stopCamera();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="video-stream-container">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={`video-canvas ${
            !cameraActive || isLoading ? "hidden" : ""
          }`}
        ></canvas>

        {isLoading && (
          <div className="loading-overlay">
            <p>{t("ai.camera.loading")}</p>
          </div>
        )}

        {!cameraActive && !isLoading && (
          <div className="camera-error-overlay">
            <div className="camera-error-message">
              <p className="mb-2">{t("ai.camera.unavailable")}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                {t("ai.camera.retry")}
              </button>
            </div>
          </div>
        )}
      </div>

      {outputSign && (
        <div className="sign-output text-[#3c3c40]">
          <h1>{outputSign}</h1>
        </div>
      )}

      <p className="text-info">{text}</p>
    </div>
  );
};

export default VideoCaptureUploader;
