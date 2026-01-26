type AlertVariant = "info" | "success" | "warning" | "error";
type AlertSize = "sm" | "md";

type AlertProps = {
  title: string;
  description: string;
  variant?: AlertVariant;
  size?: AlertSize;
  icon?: React.ReactNode;
};

const variantClasses: Record<AlertVariant, string> = {
  info: "border-info-500 text-info-500 bg-info-500/10",
  success: "border-success-500 text-success-500 bg-success-500/10",
  warning: "border-warning-500 text-warning-500 bg-warning-500/10",
  error: "border-error-500 text-error-500 bg-error-500/10",
};

const sizeClasses: Record<AlertSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm",
};

export default function Alert({
  title,
  description,
  variant = "info",
  size = "md",
  icon,
}: AlertProps) {
  return (
    <div
      className={`rounded-md border-l-4 ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      <div className="flex items-start gap-3">
        {icon ? <span className="mt-0.5 inline-flex">{icon}</span> : null}
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
