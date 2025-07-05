// Extend the Window interface to include React Native WebView
interface Window {
  ReactNativeWebView?: {
    postMessage(message: string): void;
  };
}
