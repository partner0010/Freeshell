import * as React from "react";

import { cn } from "../../lib/utils";

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-neutral-200", className)}
        {...props}
      >
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-normal ease-out"
          style={{ width: `${clampedValue}%` }}
          aria-hidden="true"
        />
      </div>
    );
  },
);

Progress.displayName = "Progress";
