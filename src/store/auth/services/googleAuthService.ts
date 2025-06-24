import { API_ROUTES } from "../../../constants/routes";

// Login with Google
export const initiateGoogleLogin = (): {
  googleAuthWindow: Window | null;
  expectedOrigin: string;
} => {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const googleAuthWindow = window.open(
    API_ROUTES.googleAuth,
    "Google Sign In",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  );

  if (!googleAuthWindow) {
    throw new Error("Popup blocked. Please allow popups for this site.");
  }

  // Return the window object and expected origin for message validation
  return {
    googleAuthWindow,
    expectedOrigin: window.location.origin,
  };
};
