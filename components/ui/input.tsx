import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-fast focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-neutral-300 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export const FileInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        className={cn(
          "flex h-10 w-full cursor-pointer rounded-sm border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 file:mr-4 file:rounded-sm file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200 transition-colors duration-fast focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-neutral-300 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
          className,
        )}
        {...props}
      />
    );
  },
);

FileInput.displayName = "FileInput";
