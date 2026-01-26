type BannerActionVariant = "info" | "success" | "warning" | "error";

type BannerActionProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: BannerActionVariant;
};

const variantClasses: Record<BannerActionVariant, string> = {
  info: "border-info-500 text-info-500 bg-info-500/10",
  success: "border-success-500 text-success-500 bg-success-500/10",
  warning: "border-warning-500 text-warning-500 bg-warning-500/10",
  error: "border-error-500 text-error-500 bg-error-500/10",
};

export default function BannerAction({
  title,
  description,
  actionLabel,
  onAction,
  variant = "info",
}: BannerActionProps) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-lg border-l-4 px-4 py-3 ${variantClasses[variant]}`}>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      <button
        className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-neutral-700 shadow"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}
