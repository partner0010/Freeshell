import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[100px] w-full rounded-sm border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-fast focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-neutral-300 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
