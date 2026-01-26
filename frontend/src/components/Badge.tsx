type BadgeVariant = "neutral" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";
type BadgeIconPosition = "left" | "right";
type BadgeAppearance = "solid" | "soft" | "outline";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  iconPosition?: BadgeIconPosition;
  appearance?: BadgeAppearance;
};

const variantClasses: Record<BadgeVariant, Record<BadgeAppearance, string>> = {
  neutral: {
    solid: "bg-neutral-100 text-neutral-700",
    soft: "bg-neutral-100 text-neutral-700",
    outline: "border border-neutral-200 text-neutral-600",
  },
  success: {
    solid: "bg-success-500 text-white",
    soft: "bg-success-500/10 text-success-500",
    outline: "border border-success-500 text-success-500",
  },
  warning: {
    solid: "bg-warning-500 text-white",
    soft: "bg-warning-500/10 text-warning-500",
    outline: "border border-warning-500 text-warning-500",
  },
  error: {
    solid: "bg-error-500 text-white",
    soft: "bg-error-500/10 text-error-500",
    outline: "border border-error-500 text-error-500",
  },
  info: {
    solid: "bg-info-500 text-white",
    soft: "bg-info-500/10 text-info-500",
    outline: "border border-info-500 text-info-500",
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
};

export default function Badge({
  label,
  variant = "neutral",
  size = "md",
  icon,
  iconPosition = "left",
  appearance = "solid",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${variantClasses[variant][appearance]} ${sizeClasses[size]}`}
    >
      {icon && iconPosition === "left" ? <span className="inline-flex">{icon}</span> : null}
      <span>{label}</span>
      {icon && iconPosition === "right" ? <span className="inline-flex">{icon}</span> : null}
    </span>
  );
}
