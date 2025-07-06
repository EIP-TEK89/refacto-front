/**
 * VideoFetcher - Utility class for managing camera access and video frame retrieval
 * 
 * This class allows:
 * - Starting, stopping, or toggling the camera state
 * - Retrieving the current video stream or screenshots as canvas elements
 * - Automatically managing camera resources (releasing tracks)
 */
export default class VideoFetcher {
  /**
   * The media stream from the active camera
   * Null when the camera is inactive
   */
  private stream: MediaStream | null = null;
  
  /**
   * Indicates whether the camera is currently active and streaming
   */
  private isStreaming: boolean = false;
  
  /**
   * The video element used to receive and process the camera stream
   * This element is created but not displayed in the DOM
   */
  private video: HTMLVideoElement;

  /**
   * Initializes the VideoFetcher and creates a hidden video element
   */
  constructor() {
    this.video = document.createElement("video");
    this.video.style.display = "none"; // Ensure the video element is not displayed
    document.body.appendChild(this.video);

    // Binding methods to ensure correct 'this' context when called
    this.startCamera = this.startCamera.bind(this);
    this.stopCamera = this.stopCamera.bind(this);
    this.toggleCamera = this.toggleCamera.bind(this);
  }

  /**
   * Starts the camera and initializes the video stream
   * 
   * @returns {Promise<boolean>} true if the camera was successfully started (or was already active), false in case of error
   */
  async startCamera(): Promise<boolean> {
    if (this.isStreaming) {
      return true;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = this.stream;
      this.isStreaming = true;
      await this.video.play(); // Start playing the video stream
      return true;
    } catch (err) {
      console.error("Error accessing webcam:", err);
      return false;
    }
  }

  /**
   * Stops the camera and releases all associated resources
   * 
   * @returns {Promise<boolean>} true if the camera was successfully stopped (or was already inactive)
   */
  async stopCamera(): Promise<boolean> {
    if (!this.isStreaming || !this.stream) {
      return true;
    }
    this.stream.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.isStreaming = false;
    return true;
  }

  /**
   * Toggles the camera state (activates if off, turns off if active)
   * 
   * @returns {Promise<boolean>} true if the operation succeeded
   */
  async toggleCamera(): Promise<boolean> {
    if (this.stream) {
      return await this.stopCamera();
    } else {
      return await this.startCamera();
    }
  }

  /**
   * Gets the current video frame either as a video element or as a canvas capture
   * 
   * This method provides two modes of operation:
   * 1. Retrieve the raw video element (useful for continuous display)
   * 2. Capture the current image on a canvas (useful for image processing)
   * 
   * @param {boolean} asCanvas - If true, returns the frame as a canvas element instead of the video element
   * @returns {HTMLVideoElement | HTMLCanvasElement | null} The video or canvas element containing the frame,
   *                                                        or null if the camera is not active
   */
  getFrame(asCanvas: boolean = false): HTMLVideoElement | HTMLCanvasElement | null {
    if (!this.isStreaming || !this.stream) {
      return null;
    }
    
    if (asCanvas) {
      const canvas = document.createElement('canvas');
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        return canvas;
      }
      return null;
    }
    
    return this.video;
  }
}
