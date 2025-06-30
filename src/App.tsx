import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./store/auth";
import "./App.css";

import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

import AppLayout from "./components/Layout";

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
};

function App() {
  return (
    <BrowserRouter>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={options}
      >
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </PostHogProvider>
    </BrowserRouter>
  );
}

export default App;
