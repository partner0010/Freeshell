import * as React from "react";

import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: SpinnerSize;
  label?: string;
};

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[3px]",
  lg: "h-8 w-8 border-4",
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", label = "로딩 중", ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <span
        className={cn(
          "animate-spin rounded-full border-neutral-300 border-t-primary-500",
          sizeClasses[size],
        )}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-neutral-600">{label}</span>}
    </div>
  ),
);

Spinner.displayName = "Spinner";
