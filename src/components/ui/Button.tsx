import React from "react";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "icon"
  | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...rest
}) => {
  const baseClasses = "font-bold cursor-pointer transition-all duration-200";

  const sizeClasses = {
    sm: "py-2 px-4 text-sm rounded-xl",
    md: "py-3 px-6 text-base rounded-2xl",
    lg: "py-4 px-8 text-base rounded-[20px]",
  };

  const variantClasses = {
    primary:
      "bg-[var(--color-blue)] text-black border-none shadow-[0_3px_0_var(--color-blue-shadow)] hover:translate-y-0.5 hover:shadow-[0_1px_0_var(--color-blue-shadow)] disabled:bg-[#384e5a] disabled:text-[#748a99] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
    secondary:
      "border-2 border-[var(--color-border)] text-[var(--color-blue)] shadow-[0_3px_0_var(--color-border)] bg-transparent hover:translate-y-0.5 hover:shadow-[0_1px_0_var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed",
    outline:
      "border-2 border-[var(--color-border)] text-[var(--color-blue)] bg-transparent hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed",
    icon: "bg-transparent border-none p-2 hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed",
    link: "bg-transparent border-none underline text-[var(--color-text-blue)] p-0 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </div>
      )}
    </button>
  );
};

export default Button;
