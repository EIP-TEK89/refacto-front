import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { AuthProvider } from "./store/auth";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  loaded: (posthogInstance: typeof posthog) => {
    if (import.meta.env.DEV) {
      posthogInstance.opt_out_capturing();
      console.info("PostHog tracking disabled in development");
    } else {
      posthogInstance.opt_in_capturing();
      console.info("PostHog tracking enabled in production");
    }
  },
  // Handle network errors and ad blockers
  capture_pageview: true,
  bootstrap: {
    distinctID: "anonymous", // Default ID before identification
  },
  // Handle errors when sending data to PostHog
  on_error: (error: { statusCode?: number; message?: string }) => {
    if (error.statusCode === 0) {
      // This is likely an ad blocker
      console.warn("PostHog tracking might be blocked by an ad blocker");
    } else {
      console.error("PostHog error:", error);
    }
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </PostHogProvider>
  </StrictMode>
);
