import * as React from "react";

import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-400/60 disabled:text-white/80",
  secondary: "bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 disabled:bg-secondary-400/60 disabled:text-white/80",
  ghost:
    "border border-neutral-200 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400 disabled:border-neutral-200",
  danger: "bg-error-500 text-white hover:bg-error-600 active:bg-error-600 disabled:bg-error-400/60 disabled:text-white/80",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      loadingLabel = "로딩 중...",
      disabled,
      type,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-sm font-semibold shadow-sm transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <span
              className={cn(
                "h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white",
                variant === "ghost" &&
                  "border-neutral-400 border-t-neutral-700 dark:border-neutral-500 dark:border-t-neutral-200",
              )}
            />
            <span>{loadingLabel}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
