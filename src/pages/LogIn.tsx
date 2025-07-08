import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
import {
  CloseButton,
  // GoogleButton,
  PrimaryButton,
  SecondaryButton,
} from "../components/ui";
import { useTranslation } from "react-i18next";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    login,
    // loginWithGoogle,
    error,
    isLoading,
    isAuthenticated,
    clearError,
  } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     clearError();
  //     await loginWithGoogle();
  //   } catch (error) {
  //     console.error("Google login failed:", error);
  //   }
  // };

  // If user is authenticated, redirect to home
  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center bg-[var(--color-background-main)] min-h-screen py-8">
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center">
        <CloseButton onClick={() => (window.location.href = "/")} />
      </div>

      <div className="w-full max-w-[400px] p-6 flex flex-col space-y-6">
        <h1 className="text-[var(--color-text)] text-2xl font-bold text-center mb-8">
          {t("auth.login")}
        </h1>

        {error && (
          <div className="bg-red-900/10 border-l-3 border-[#ff5252] text-[#ff5252] p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col w-full">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email")}
              required
              className="w-full py-3 px-4 border border-[var(--color-border)] rounded-2xl bg-[rgb(25,39,45)] text-[var(--color-text)] text-base"
            />
          </div>

          <div className="relative flex flex-col w-full">
            <div className="relative flex items-center w-full">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")}
                required
                className="w-full py-3 px-4 border border-[var(--color-border)] rounded-2xl bg-[rgb(25,39,45)] text-[var(--color-text)] text-base"
              />
              <button
                type="button"
                className="absolute right-4 bg-transparent border-none cursor-pointer flex items-center justify-center p-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img
                  src={
                    showPassword
                      ? "/icons/visibility_off.svg"
                      : "/icons/visibility.svg"
                  }
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            <button
              type="button"
              className="absolute right-10 text-[var(--color-text-blue)] text-sm cursor-pointer px-2 py-1 rounded transition-all duration-200 flex items-center top-1/2 transform -translate-y-1/2 hover:text-[var(--color-text)]"
            >
              {t("auth.forgotPassword")}
            </button>
          </div>

          <PrimaryButton
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            fullWidth
            size="lg"
          >
            {isLoading ? t("auth.signingIn") : t("auth.login")}
          </PrimaryButton>
        </form>

        {/* <div className="flex items-center text-center my-4">
          <div className="flex-1 border-b-2 border-[var(--color-border)]"></div>
          <span className="px-4 text-[var(--color-text-blue)] text-sm font-bold">
            {t("common.or")}
          </span>
          <div className="flex-1 border-b-2 border-[var(--color-border)]"></div>
        </div>

        <div className="flex gap-4 my-2">
          <GoogleButton
            onClick={handleGoogleLogin}
            disabled={isLoading}
            isLoading={isLoading && false}
            fullWidth
          >
            {isLoading ? t("auth.connecting") : t("auth.googleLogin")}
          </GoogleButton>
        </div> */}

        <div className="text-center text-[rgba(255,255,255,0.6)] text-sm mt-6">
          {t("auth.noAccount")}
        </div>

        <div className="flex justify-center mt-2 mb-4">
          <Link to="/signup">
            <SecondaryButton className="w-[150px]">
              {t("auth.signup")}
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
