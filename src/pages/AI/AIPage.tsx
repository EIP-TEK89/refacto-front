import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ModelsPredictions } from "../../lib/trio-signo-lib/core/src/sign_recognizer/sign_recognizer";
import { SignRecognizer } from "../../lib/trio-signo-lib/core/src/sign_recognizer/sign_recognizer";
import { OnnxRunnerWeb } from "../../lib/trio-signo-lib/web/src/onnx_runner";
import { MediapipeRunnerWeb } from "../../lib/trio-signo-lib/web/src/mediapipe_runner";

import "./AIPage.css";

// URL to the ONNX model used for recognition
const MODEL_URL = "https://triosigno.com/api/files/download/alphabet.zip";

// Hand landmark connections based on Google's Mediapipe Hand Model
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // Thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // Index finger
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12], // Middle finger
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16], // Ring finger
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // Pinky finger
  [5, 9],
  [9, 13],
  [13, 17], // Palm connections
];

// Options for customizing the drawing
interface DrawOptions {
  pointColor?: string;
  pointSize?: number;
  lineColor?: string;
  lineWidth?: number;
}

// Simplified version of drawHandLandmarkerResult that works with our data format
function drawHandLandmarkerResult(
  ctx: CanvasRenderingContext2D,
  result: { landmarks: Array<{ x: number; y: number; z: number }[]> },
  options: DrawOptions = {}
): void {
  if (!result || !result.landmarks || result.landmarks.length === 0) return;

  // Default styling options
  const {
    pointColor = "red",
    pointSize = 5,
    lineColor = "blue",
    lineWidth = 2,
  } = options;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = lineColor;
  ctx.fillStyle = pointColor;

  const landmarks = result.landmarks[0];

  // Draw lines between hand landmarks
  ctx.beginPath();
  for (const [start, end] of HAND_CONNECTIONS) {
    const startLandmark = landmarks[start];
    const endLandmark = landmarks[end];

    if (startLandmark && endLandmark) {
      ctx.moveTo(
        startLandmark.x * ctx.canvas.width,
        startLandmark.y * ctx.canvas.height
      );
      ctx.lineTo(
        endLandmark.x * ctx.canvas.width,
        endLandmark.y * ctx.canvas.height
      );
    }
  }
  ctx.stroke();

  // Draw landmark points
  for (let i = 0; i < landmarks.length; i++) {
    const point = landmarks[i];
    if (!point) continue;

    ctx.beginPath();
    ctx.arc(
      point.x * ctx.canvas.width,
      point.y * ctx.canvas.height,
      pointSize,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

// Helper function to map landmark index to field name
const getLandmarkFieldName = (index: number): string => {
  const fieldNames = [
    "wrist",
    "thumb_cmc",
    "thumb_mcp",
    "thumb_ip",
    "thumb_tip",
    "index_mcp",
    "index_pip",
    "index_dip",
    "index_tip",
    "middle_mcp",
    "middle_pip",
    "middle_dip",
    "middle_tip",
    "ring_mcp",
    "ring_pip",
    "ring_dip",
    "ring_tip",
    "pinky_mcp",
    "pinky_pip",
    "pinky_dip",
    "pinky_tip",
  ];

  return fieldNames[index] || "wrist";
};

const AIPage = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognizer, setRecognizer] =
    useState<SignRecognizer<HTMLVideoElement> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSign, setCurrentSign] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signConfidence, setSignConfidence] = useState<number>(0);
  const [showSign, setShowSign] = useState<boolean>(false);

  // Animation frame ID for real-time rendering
  const requestAnimationRef = useRef<number | undefined>(undefined);

  // Reference for the canvas context
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize the recognizer when the component loads
  useEffect(() => {
    const initRecognizer = async () => {
      try {
        // Créer les instances des runners web
        const onnxRunner = new OnnxRunnerWeb(MODEL_URL);
        const mediapipeRunner = new MediapipeRunnerWeb();

        // Créer le reconnaisseur avec ces runners
        const newRecognizer = new SignRecognizer<HTMLVideoElement>(
          onnxRunner,
          mediapipeRunner
        );

        setRecognizer(newRecognizer);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize SignRecognizer:", err);
        setError(t("ai.errorInitializing"));
        setIsLoading(false);
      }
    };

    initRecognizer();

    return () => {
      // Cleanup resources
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [t]);

  // Effect to handle sign display animation
  useEffect(() => {
    if (currentSign) {
      setShowSign(true);
    }
  }, [currentSign]);

  // Start the camera
  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      videoRef.current.srcObject = stream;
      setCameraActive(true);

      // Initialize the canvas with the video dimensions
      if (canvasRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
        canvasCtxRef.current = canvasRef.current.getContext("2d");
      }

      // Start real-time detection
      startRealTimeDetection();
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(t("ai.cameraAccessError"));
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
    }

    setCameraActive(false);
    setCurrentSign("");
    setShowSign(false);
  };

  // Function for real-time detection
  const startRealTimeDetection = () => {
    if (
      !recognizer ||
      !videoRef.current ||
      !canvasRef.current ||
      !canvasCtxRef.current
    )
      return;

    const detectFrame = () => {
      if (!videoRef.current || !recognizer || !canvasCtxRef.current) return;

      if (videoRef.current.readyState === 4) {
        // 4 = HAVE_ENOUGH_DATA
        // Make a prediction with the SignRecognizer
        const prediction: ModelsPredictions = recognizer.predict(
          videoRef.current
        );

        // Update the detected sign
        if (prediction.signId !== -1 && prediction.signLabel !== "Null") {
          setCurrentSign(prediction.signLabel);
          // Set a mock confidence value between 75-100% for visual feedback
          setSignConfidence(75 + Math.random() * 25);
        }

        // Clear the canvas
        const ctx = canvasCtxRef.current;
        ctx.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );

        // Draw the video stream on the canvas
        ctx.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );

        // Draw landmarks if available
        if (prediction.landmarks) {
          // Vérifier si des landmarks sont disponibles
          const hasLandmarks = Object.keys(prediction.landmarks).some(
            (key) =>
              key.includes("wrist") ||
              key.includes("thumb") ||
              key.includes("index")
          );

          if (hasLandmarks) {
            // Créer un objet avec la structure attendue par notre fonction drawHandLandmarkerResult
            const handLandmarks = {
              landmarks: [
                // Convertir les coordonnées 3D en objets x, y, z
                Array.from({ length: 21 }).map((_, i) => {
                  // const fieldName = getLandmarkFieldName(i);

                  // Chercher le fieldName avec préfixe l_ ou r_
                  // const leftKey = `l_${fieldName}`;
                  // const rightKey = `r_${fieldName}`;

                  // Utiliser le premier ensemble de landmarks trouvé (gauche ou droite)
                  let coords = [0, 0, 0];
                  // if (prediction.landmarks[leftKey]) {
                  //   coords = prediction.landmarks[leftKey];
                  // } else if (prediction.landmarks[rightKey]) {
                  //   coords = prediction.landmarks[rightKey];
                  // }

                  return {
                    x: coords[0] || 0,
                    y: coords[1] || 0,
                    z: coords[2] || 0,
                  };
                }),
              ],
            };

            // Dessiner les landmarks sur le canvas
            drawHandLandmarkerResult(ctx, handLandmarks, {
              pointColor: "#FF0000",
              lineColor: "#00FF00",
            });
          }
        }
      }

      // Continue real-time detection
      requestAnimationRef.current = requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  // Function to get confidence class based on confidence level
  const getConfidenceClass = () => {
    if (signConfidence >= 90) return "high-confidence";
    if (signConfidence >= 80) return "medium-confidence";
    return "low-confidence";
  };

  return (
    <div className="ai-page-container">
      <h1>{t("ai.title")}</h1>

      {isLoading ? (
        <div className="loading-container">
          <p>{t("ai.loading")}</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      ) : (
        <div className="ai-content">
          <div className="camera-container">
            <canvas ref={canvasRef} className="detection-canvas" />
            <video
              ref={videoRef}
              className="video-stream"
              autoPlay
              playsInline
              muted
            />
          </div>

          <div className="controls">
            {!cameraActive ? (
              <button className="camera-button start" onClick={startCamera}>
                <span className="button-icon">📷</span> {t("ai.startCamera")}
              </button>
            ) : (
              <button className="camera-button stop" onClick={stopCamera}>
                <span className="button-icon">⏹️</span> {t("ai.stopCamera")}
              </button>
            )}
          </div>

          {showSign && currentSign && (
            <div className="detection-result">
              <h2>{t("ai.detectedSign")}</h2>
              <div className={`sign-box high-confidence`}>
                <div className="sign-content">
                  <span className="sign-icon">✓</span>
                  <p>{currentSign}</p>
                </div>
                <div className="confidence-meter">
                  <div
                    className="confidence-bar"
                    style={{ width: `${signConfidence}%` }}
                  ></div>
                  <span className="confidence-value">
                    {Math.round(signConfidence)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="instructions">
            <h3>
              <span className="instruction-icon">💡</span>{" "}
              {t("ai.instructions")}
            </h3>
            <p>{t("ai.instructionsText")}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPage;
