import { useState } from "react";

type DismissibleBannerVariant = "info" | "success" | "warning" | "error";

type DismissibleBannerProps = {
  title: string;
  description: string;
  variant?: DismissibleBannerVariant;
};

const variantClasses: Record<DismissibleBannerVariant, string> = {
  info: "border-info-500 text-info-500 bg-info-500/10",
  success: "border-success-500 text-success-500 bg-success-500/10",
  warning: "border-warning-500 text-warning-500 bg-warning-500/10",
  error: "border-error-500 text-error-500 bg-error-500/10",
};

export default function DismissibleBanner({
  title,
  description,
  variant = "info",
}: DismissibleBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className={`flex items-start justify-between gap-4 rounded-lg border-l-4 px-4 py-3 ${variantClasses[variant]}`}>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      <button
        className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
        onClick={() => setVisible(false)}
      >
        ✕
      </button>
    </div>
  );
}
