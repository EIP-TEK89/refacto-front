/**
 * SignRecognizer factory for web applications
 * Using the web implementations from trio-signo-lib
 */
import { SignRecognizer } from "../lib/trio-signo-lib/core/src/sign_recognizer/sign_recognizer";
import { OnnxRunner } from "../lib/trio-signo-lib/core/src/onnx_interface";
import { MediapipeRunner } from "../lib/trio-signo-lib/core/src/mediapipe_interface";
import { OnnxRunnerWeb } from "../lib/trio-signo-lib/web/src/onnx_runner";
import { MediapipeRunnerWeb } from "../lib/trio-signo-lib/web/src/mediapipe_runner";

/**
 * Creates a SignRecognizer instance for web using the trio-signo-lib implementations
 * @param modelUrl URL to the ONNX model
 * @returns Initialized SignRecognizer for web
 */
export function createSignRecognizer(
  modelUrl: string
): SignRecognizer<HTMLVideoElement> {
  // Create the ONNX and Mediapipe runners from trio-signo-lib
  const onnxRunner: OnnxRunner = new OnnxRunnerWeb(modelUrl);
  const mediapipeRunner: MediapipeRunner<HTMLVideoElement> =
    new MediapipeRunnerWeb();

  // Initialize the SignRecognizer with the runners
  return new SignRecognizer<HTMLVideoElement>(onnxRunner, mediapipeRunner);
}
