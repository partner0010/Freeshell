type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-700 active:bg-primary-700",
  secondary: "bg-secondary-500 text-white hover:bg-secondary-700 active:bg-secondary-700",
  ghost:
    "border border-neutral-200 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingLabel = "로딩 중...",
  fullWidth = false,
  icon,
  iconPosition = "left",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const widthClass = fullWidth ? "w-full" : "";
  const spinnerClass =
    variant === "ghost"
      ? "border-neutral-400 border-t-neutral-700 dark:border-neutral-500 dark:border-t-neutral-200"
      : "border-white/60 border-t-white";
  const content = (
    <>
      {icon && iconPosition === "left" ? <span className="inline-flex">{icon}</span> : null}
      <span>{children}</span>
      {icon && iconPosition === "right" ? <span className="inline-flex">{icon}</span> : null}
    </>
  );

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-neutral-900 ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${isDisabled ? "cursor-not-allowed opacity-60" : ""} ${className ?? ""}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className={`h-4 w-4 animate-spin rounded-full border-2 ${spinnerClass}`} />
          <span>{loadingLabel}</span>
        </>
      ) : (
        content
      )}
    </button>
  );
}
