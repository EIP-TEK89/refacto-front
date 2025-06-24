import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../store/auth";
import GoogleIcon from "../components/GoogleIcon";
import { Link } from "react-router-dom";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    login,
    loginWithGoogle,
    error,
    isLoading,
    isAuthenticated,
    clearError,
  } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    try {
      clearError();
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  // If user is authenticated, redirect to home
  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center bg-[var(--color-background-main)] min-h-screen py-8">
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center">
        <button
          className="cursor-pointer bg-transparent border-none p-0"
          onClick={() => (window.location.href = "/")}
        >
          <img
            src="/icons/close.svg"
            alt="Close"
            className="w-[18px] h-[18px]"
          />
        </button>
      </div>

      <div className="w-full max-w-[400px] p-6 flex flex-col space-y-6">
        <h1
          className="text-[var(--color-text)] text-2xl font-bold text-center mb-8"
          style={{ marginBottom: "2rem" }}
        >
          Sign In
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
              placeholder="Email"
              required
              style={{ padding: "0.75rem 1rem" }}
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
                placeholder="Password"
                required
                style={{ padding: "0.75rem 1rem" }}
                className="w-full py-3 px-4 border border-[var(--color-border)] rounded-2xl bg-[rgb(25,39,45)] text-[var(--color-text)] text-base"
              />
              <button
                type="button"
                className="absolute right-4 bg-transparent border-none cursor-pointer flex items-center justify-center p-2"
                style={{ padding: "0.5rem" }}
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
              style={{ padding: "0.25rem 0.5rem" }}
            >
              Forgot?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-[var(--color-blue)] text-black border-none rounded-[20px] font-bold cursor-pointer my-5 shadow-[0_3px_0_var(--color-blue-shadow)] transition-all duration-200 hover:translate-y-0.5 hover:shadow-[0_1px_0_var(--color-blue-shadow)] disabled:bg-[#384e5a] disabled:text-[#748a99] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            style={{ padding: "1rem" }}
          >
            <span className="flex items-center justify-center gap-2 py-2">
              {isLoading ? "Signing in..." : "Sign In"}
            </span>
          </button>
        </form>

        <div
          className="flex items-center text-center my-4"
          style={{ margin: "1rem 0" }}
        >
          <div className="flex-1 border-b-2 border-[var(--color-border)]"></div>
          <span
            className="px-4 text-[var(--color-text-blue)] text-sm font-bold"
            style={{ padding: "0 1rem" }}
          >
            OR
          </span>
          <div className="flex-1 border-b-2 border-[var(--color-border)]"></div>
        </div>

        <div className="flex gap-4 my-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex-1 py-2 px-6 border-2 border-[var(--color-border)] rounded-2xl text-[var(--color-blue)] text-base font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_3px_0_var(--color-border)] bg-transparent transition-all duration-200 h-[50px] hover:translate-y-0.5 hover:shadow-[0_1px_0_var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: "0.5rem 1.5rem" }}
          >
            <div className="w-5 h-5">
              <GoogleIcon className="w-full h-full fill-[var(--color-blue)]" />
            </div>
            {isLoading ? "Connecting..." : "Google"}
          </button>
        </div>

        <div
          className="text-center text-[rgba(255,255,255,0.6)] text-sm mt-6"
          style={{ marginTop: "1rem" }}
        >
          Don't have an account?
        </div>

        <div
          className="flex justify-center mt-2 mb-4"
          style={{ marginTop: "0.5rem", marginBottom: "1rem" }}
        >
          <Link to="/signup">
            <button
              className="border-2 border-[var(--color-border)] mx-2 rounded-2xl py-2 px-6 text-[var(--color-blue)] w-[150px] h-[50px] font-bold text-base shadow-[0_3px_0_var(--color-border)] bg-transparent cursor-pointer transition-all duration-200 hover:translate-y-0.5 hover:shadow-[0_1px_0_var(--color-border)]"
              style={{ margin: "0 0.5rem", padding: "0.5rem 1.5rem" }}
            >
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
