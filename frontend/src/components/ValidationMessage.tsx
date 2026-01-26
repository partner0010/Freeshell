type ValidationVariant = "success" | "warning" | "error" | "info";

type ValidationMessageProps = {
  message: string;
  variant?: ValidationVariant;
};

const variantClasses: Record<ValidationVariant, string> = {
  success: "text-success-500",
  warning: "text-warning-500",
  error: "text-error-500",
  info: "text-info-500",
};

export default function ValidationMessage({
  message,
  variant = "error",
}: ValidationMessageProps) {
  return <p className={`text-sm ${variantClasses[variant]}`}>{message}</p>;
}
