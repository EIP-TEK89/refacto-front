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

  // Effect to check if the detected sign matches the expected response
  useEffect(() => {
    if (response === outputSign && outputSign && !hasMatched) {
      goodAnswer();
      setHasMatched(true);

      // Reset hasMatched after a short delay to allow new matches
      setTimeout(() => {
        setHasMatched(false);
      }, 2000);
    }
  }, [outputSign, response, goodAnswer, hasMatched]);

  // Initialization of video fetcher, canvas, and sign recognizer
  useEffect(() => {
    setIsLoading(true);
    let animationFrameId: number;

    // Get the canvas element
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = 640;
    canvas.height = 480;

    // Get drawing context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create necessary instances
    const videoFetcher = new VideoFetcher();

    // Use a direct model URL to avoid path issues
    const modelUrl = `${API_URL}/files/models/alphabet`;
    console.log("Model URL:", modelUrl);

    // Start the camera first
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
          // Following the Svelte approach with OnnxRunnerWeb and MediapipeRunnerWeb
          console.log("Creating runners...");

          // Initialize OnnxRunnerWeb with the direct model URL
          const onnxRunner = new OnnxRunnerWeb(
            `${API_URL}/files/models/alphabet`
          );

          // Initialize MediapipeRunnerWeb
          const mediapipeRunner = new MediapipeRunnerWeb();

          console.log("Initializing SignRecognizer...");

          // Create an instance of SignRecognizer with both runners
          const signRecognizer = new SignRecognizer<HTMLVideoElement>(
            onnxRunner as any,
            mediapipeRunner as any
          );

          console.log("SignRecognizer initialized successfully");
          setIsLoading(false);

          // Drawing function similar to the Svelte example
          function draw() {
            if (!canvas) return;

            // Get the video frame
            const frame = videoFetcher.getFrame();

            if (frame && ctx) {
              // Clear the canvas and draw the new frame
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

              try {
                // Predict the sign from the frame
                const result = signRecognizer.predict(frame);
                console.log(result);

                // If hand landmarks are detected, draw them
                if (result && result.landmarks) {
                  console.log(
                    "Sign Recognizer Result:",
                    result,
                    result.landmarks.l_hand_position
                  );
                  drawHandLandmarkerResult(ctx, result.landmarks);
                }

                // Update the detected sign
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

            // Animation loop
            animationFrameId = requestAnimationFrame(draw);
          }

          // Start the drawing loop
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

    // Cleanup when the component is unmounted
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
