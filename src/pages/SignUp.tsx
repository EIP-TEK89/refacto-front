import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import {
  CloseButton,
  PrimaryButton,
  // GoogleButton,
  SecondaryButton,
} from "../components/ui";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // const { signup, loginWithGoogle, error, isLoading, clearError } = useAuth();
  const { signup, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    clearError();

    try {
      // Split the name into first name and last name if only one field is used
      let userFirstName = firstName;
      let userLastName = lastName;

      if (!lastName && firstName.includes(" ")) {
        const nameParts = firstName.split(" ");
        userFirstName = nameParts[0];
        userLastName = nameParts.slice(1).join(" ");
      }

      // If username is not provided, create one from the email
      const userUsername = username || email.split("@")[0];

      // Call the signup function from auth context
      await signup({
        email,
        password,
        username: userUsername,
        firstName: userFirstName,
        lastName: userLastName || "",
      });

      // Redirect to home page on successful signup
      navigate("/");
    } catch (error) {
      // Error is handled in the auth context
      console.error("Signup failed:", error);
    }
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     clearError();
  //     await loginWithGoogle();
  //   } catch (error) {
  //     console.error("Google login failed:", error);
  //   }
  // };

  return (
    <div className="flex flex-col items-center justify-center bg-[var(--color-background-main)] min-h-screen py-8">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <CloseButton onClick={() => (window.location.href = "/")} />
      </div>

      <div className="w-full max-w-[400px] p-6 flex flex-col space-y-6 mt-12">
        <h1 className="text-[var(--color-text)] text-2xl font-bold text-center mb-8">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-900/10 border-l-3 border-[#ff5252] text-[#ff5252] p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col w-full">
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
              className="w-full py-3 px-4 border border-[var(--color-border)] rounded-2xl bg-[rgb(25,39,45)] text-[var(--color-text)] text-base"
            />
          </div>

          <div className="flex flex-col w-full">
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="w-full py-3 px-4 border border-[var(--color-border)] rounded-2xl bg-[rgb(25,39,45)] text-[var(--color-text)] text-base"
            />
          </div>

          <div className="flex flex-col w-full">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username (optional)"
              className="w-full py-3 px-4 border border-[var(--color-border)] rounded-2xl bg-[rgb(25,39,45)] text-[var(--color-text)] text-base"
            />
          </div>

          <div className="flex flex-col w-full">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
                placeholder="Password"
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
          </div>

          <PrimaryButton
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            fullWidth
            size="lg"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </PrimaryButton>
        </form>

        {/* <div className="flex items-center text-center my-4">
          <div className="flex-1 border-b-2 border-[var(--color-border)]"></div>
          <span className="px-4 text-[var(--color-text-blue)] text-sm font-bold">
            OR
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
            {isLoading ? "Connecting..." : "Google"}
          </GoogleButton>
        </div> */}

        <div className="text-center text-[rgba(255,255,255,0.6)] text-sm mt-4">
          Already have an account?
        </div>

        <div className="mb-4 mt-2 flex justify-center">
          <Link to="/login">
            <SecondaryButton className="w-[150px]">Sign In</SecondaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
