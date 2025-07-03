export default class VideoFetcher {
  private stream: MediaStream | null = null;
  private isStreaming: boolean = false;
  private video: HTMLVideoElement;

  constructor() {
    this.video = document.createElement("video");
    this.video.style.display = "none"; // Ensure the video element is not displayed
    document.body.appendChild(this.video);

    this.startCamera = this.startCamera.bind(this);
    this.stopCamera = this.stopCamera.bind(this);
    this.toggleCamera = this.toggleCamera.bind(this);
  }

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

  async stopCamera(): Promise<boolean> {
    if (!this.isStreaming || !this.stream) {
      return true;
    }
    this.stream.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.isStreaming = false;
    return true;
  }

  async toggleCamera(): Promise<boolean> {
    if (this.stream) {
      return await this.stopCamera();
    } else {
      return await this.startCamera();
    }
  }

  getFrame(): HTMLVideoElement | null {
    // console.log(this.isStreaming)
    if (!this.isStreaming) {
      return null;
    }
    // const canvas = document.createElement("canvas");
    // const video = this.video;

    // canvas.width = video.videoWidth;
    // canvas.height = video.videoHeight;

    // const ctx = canvas.getContext("2d");
    // if (!ctx) {
    //     console.error("Unable to get 2D rendering context");
    //     return null;
    // }

    // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // const image = new Image();
    // image.src = canvas.toDataURL("image/jpeg");

    // return image;

    return this.video;
  }
}
