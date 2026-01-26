type BannerVariant = "info" | "success" | "warning" | "error";

type BannerProps = {
  title: string;
  description: string;
  variant?: BannerVariant;
};

const variantClasses: Record<BannerVariant, string> = {
  info: "border-info-500 text-info-500 bg-info-500/10",
  success: "border-success-500 text-success-500 bg-success-500/10",
  warning: "border-warning-500 text-warning-500 bg-warning-500/10",
  error: "border-error-500 text-error-500 bg-error-500/10",
};

export default function Banner({ title, description, variant = "info" }: BannerProps) {
  return (
    <div className={`rounded-lg border-l-4 px-4 py-3 ${variantClasses[variant]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  );
}
