/**
 * Adapters for trio-signo-lib to work in a web environment
 */
import {
  OnnxRunner,
  ModelConfig,
  ModelConfigFromJson,
} from "../trio-signo-lib/core/src/onnx_interface";
import { MediapipeRunner } from "../trio-signo-lib/core/src/mediapipe_interface";
import { DataSample } from "../trio-signo-lib/core/src/sign_recognizer/datasample";
import { DataGestures } from "../trio-signo-lib/core/src/sign_recognizer/gestures/data_gestures";
import { SignRecognizer } from "../trio-signo-lib/core/src/sign_recognizer/sign_recognizer";

import axios from "axios";
import JSZip from "jszip";

/**
 * Web implementation of OnnxRunner interface for browser environments
 */
class WebOnnxRunner extends OnnxRunner {
  private modelConfig: ModelConfig | null = null;
  private modelLoaded: boolean = false;

  constructor(modelPath: string) {
    super(modelPath);
  }

  async init(): Promise<void> {
    // This would initialize any resources needed before loading the model
    return Promise.resolve();
  }

  isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  config(): ModelConfig | null {
    return this.modelConfig;
  }

  async load(): Promise<void> {
    if (!this.model_path) {
      throw new Error("Model path is not defined");
    }

    try {
      // Fetch and load model
      const response = await axios.get(this.model_path, {
        responseType: "arraybuffer",
      });

      const zipFile = await JSZip.loadAsync(response.data);
      const modelContent = await zipFile
        .file("model.onnx")
        ?.async("arraybuffer");
      const configContent = await zipFile.file("config.json")?.async("text");

      if (!modelContent || !configContent) {
        throw new Error("Invalid model package");
      }

      // Parse config
      const configJson = JSON.parse(configContent);
      this.modelConfig = ModelConfigFromJson(configJson);
      this.modelLoaded = true;
    } catch (error) {
      console.error("Failed to load ONNX model:", error);
      throw new Error("Failed to load ONNX model");
    }
  }

  async run(input: DataSample): Promise<number> {
    // Simplified implementation - in reality, this would use ONNX.js to run inference
    // Since we're just adapting to the new interface, we'll return mock data
    return 0; // Mock result
  }
}

/**
 * Web implementation of MediapipeRunner for browser environments
 */
class WebMediapipeRunner extends MediapipeRunner<HTMLVideoElement> {
  private handLandmarkerLoaded: boolean = false;

  constructor() {
    super();
  }

  async loadHandTrackModel(): Promise<void> {
    try {
      // In a real implementation, this would load the actual MediaPipe hand landmarker
      this.handLandmarkerLoaded = true;
      console.log("Hand tracking model loaded");
    } catch (error) {
      console.error("Failed to load hand tracking model:", error);
      throw new Error("Failed to load hand tracking model");
    }
  }

  async runHandTrackModel(_video: HTMLVideoElement): Promise<DataGestures> {
    // In a real implementation, this would use the MediaPipe hand landmarker to detect hands
    // For this adapter, we'll return a simplified data structure
    const gestures = new DataGestures();
    return gestures;
  }

  async loadBodyTrackModel(): Promise<void> {
    // Simplified implementation
    return Promise.resolve();
  }

  async runBodyTrackModel(_video: HTMLVideoElement): Promise<DataGestures> {
    // Simplified implementation
    return new DataGestures();
  }

  async loadFaceTrackModel(): Promise<void> {
    // Simplified implementation
    return Promise.resolve();
  }

  async runFaceTrackModel(_video: HTMLVideoElement): Promise<DataGestures> {
    // Simplified implementation
    return new DataGestures();
  }

  async runAll(video: HTMLVideoElement): Promise<DataGestures> {
    // Run all available models
    const handResult = await this.runHandTrackModel(video);
    // In a real implementation, we would also run body and face models

    return handResult;
  }
}

/**
 * Creates a SignRecognizer instance for web use
 */
export function createSignRecognizerForWeb(
  modelUrl: string
): SignRecognizer<HTMLVideoElement> {
  const onnxRunner = new WebOnnxRunner(modelUrl);
  const mediapipeRunner = new WebMediapipeRunner();

  return new SignRecognizer<HTMLVideoElement>(onnxRunner, mediapipeRunner);
}
