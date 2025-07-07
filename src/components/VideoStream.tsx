import { useState, useEffect, useRef } from "react";
import { drawGestures, SignRecognizer, DataGestures } from "triosigno-lib-core";
import VideoFetcher from "../utils/videoFetcher";
import { OnnxRunnerWeb, MediapipeRunnerWeb, CanvasDrawer } from "triosigno-lib-web";
import { useTranslation } from "react-i18next";
import "../styles/VideoStream.css";

export const API_URL: string =
  import.meta.env.VITE_API_URL + import.meta.env.VITE_API_SUFFIX_URL;

interface VideoCaptureUploaderProps {
  goodAnswer: () => void;
  badAnswer: () => void;
  response: string;
  model?: string;
}

const VideoCaptureUploader = ({
  goodAnswer,
  response,
  model = "alphabet2.0",
}: VideoCaptureUploaderProps) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [outputSign, setOutputSign] = useState<string>("");
  const [hasMatched, setHasMatched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [text, setText] = useState<string>("");
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 640,
    height: 480,
  });
  const resizeTimeoutRef = useRef<number | null>(null);

  // Function to adjust canvas dimensions based on container size
  const adjustCanvasDimensions = () => {
    if (containerRef.current && canvasRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Get device type and orientation
      const isMobile = windowWidth < 768;
      const isPortrait = windowHeight > windowWidth;
      const aspectRatio = 4 / 3; // Standard video aspect ratio

      let width, height;

      if (isMobile) {
        if (isPortrait) {
          // Mobile portrait: use most of the screen width with padding
          const maxWidth = Math.min(windowWidth * 0.9, 320); // Max 320px or 90% of screen width
          width = Math.min(containerWidth, maxWidth);
          height = width / aspectRatio;

          // Ensure height doesn't exceed 40% of screen height
          const maxHeight = windowHeight * 0.4;
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        } else {
          // Mobile landscape: prioritize height fitting
          const maxHeight = windowHeight * 0.6; // 60% of screen height
          height = maxHeight;
          width = height * aspectRatio;

          // Ensure width doesn't exceed 70% of screen width
          const maxWidth = windowWidth * 0.7;
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
        }
      } else {
        // Desktop: use container width with standard aspect ratio
        width = Math.min(containerWidth, 640); // Max 640px for desktop
        height = width / aspectRatio;
      }

      setCanvasDimensions({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    }
  };

  // Listen for window resize and orientation change
  useEffect(() => {
    // Initial dimension calculation with a small delay to ensure DOM is ready
    const initialTimeout = setTimeout(() => {
      adjustCanvasDimensions();
    }, 100);

    const handleResize = () => {
      // Debounce resize events
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = window.setTimeout(() => {
        adjustCanvasDimensions();
      }, 150);
    };

    const handleOrientationChange = () => {
      // Delay orientation change handling to ensure viewport has updated
      setTimeout(() => {
        adjustCanvasDimensions();
      }, 300);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      clearTimeout(initialTimeout);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // Effect to check if the detected sign matches the expected response
  useEffect(() => {
    if (response === outputSign && outputSign && !hasMatched) {
      goodAnswer();
      setHasMatched(true);

      // Reset hasMatched after a short delay to allow new matches
      setTimeout(() => {
        setHasMatched(false);
      }, 0);
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
    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    // Get drawing context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create necessary instances
    const videoFetcher = new VideoFetcher();

    // Use a direct model URL to avoid path issues
    const modelUrl = `${API_URL}/files/models/${model}`;
    // const modelUrl = `http://localhost:5000/get-sign-recognizer-model/se_presenter`;
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
          const onnxRunner = new OnnxRunnerWeb(modelUrl);

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

              // Mirror the image horizontally (mirror effect)
              ctx.save(); // Save the current context state
              ctx.scale(-1, 1); // Flip the X axis
              ctx.drawImage(
                frame,
                -canvas.width,
                0,
                canvas.width,
                canvas.height
              ); // The starting point is negative due to the flip
              ctx.restore(); // Restore the context to its original state

              try {
                // Predict the sign from the frame
                // Type assertion needed because SignRecognizer only accepts HTMLVideoElement
                const result = signRecognizer.predict(
                  frame as HTMLVideoElement
                );
                // console.log(result);

                // If hand landmarks are detected, draw them
                if (result && result.landmarks) {
                  // console.log(
                  //   "Sign Recognizer Result:",
                  //   result,
                  //   result.landmarks.l_hand_position
                  // );

                  // Dessiner les landmarks avec l'inversion horizontale
                  ctx.save(); // Sauvegarder l'état actuel
                  ctx.translate(canvas.width, 0); // Déplacer l'origine vers la droite
                  ctx.scale(-1, 1); // Inverser l'axe X pour correspondre à l'image
                  const drawer = new CanvasDrawer(ctx);
                  drawGestures(result.landmarks, drawer.drawLine.bind(drawer), drawer.drawPoint.bind(drawer));
                  ctx.restore(); // Restaurer l'état d'origine
                }

                // Update the detected sign
                if (result && result.signLabel) {
                  setOutputSign(result.signLabel);
                  setText(`${t("ai.camera.outputSign")}: ${result.signLabel}`);
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
      console.log("VideoStream component unmounted - stopping camera");
      videoFetcher.stopCamera();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Assurer que les flux de média sont arrêtés
      if (navigator.mediaDevices) {
        document.querySelectorAll("video").forEach((video) => {
          if (video.srcObject) {
            const mediaStream = video.srcObject as MediaStream;
            const tracks = mediaStream.getTracks();
            tracks.forEach((track) => {
              track.stop();
            });
            video.srcObject = null;
          }
        });
      }
    };
  }, [canvasDimensions]);

  return (
    <div className="video-stream-container">
      <div ref={containerRef} className="canvas-container">
        {/* Canvas pour la vidéo avec contraintes d'aspect-ratio strictes */}
        <div className="canvas-aspect-ratio-container">
          <canvas
            ref={canvasRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            className={`video-canvas ${
              !cameraActive || isLoading ? "hidden" : ""
            }`}
          ></canvas>
        </div>

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
          <h1>
            {outputSign === "_null" ? t("ai.camera.notfound") : outputSign}
          </h1>
        </div>
      )}

      <p className="text-info">{text}</p>
    </div>
  );
};

export default VideoCaptureUploader;
