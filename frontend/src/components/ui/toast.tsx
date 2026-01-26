import * as React from "react";

import { cn } from "../../lib/utils";
import type { ToastVariant } from "../../hooks/use-toast";

export type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ToastVariant;
  onClose?: () => void;
};

const variantClasses: Record<ToastVariant, string> = {
  default: "bg-white border-neutral-200 text-neutral-700",
  success: "bg-success-500 border-success-600 text-white",
  warning: "bg-warning-500 border-warning-600 text-white",
  error: "bg-error-500 border-error-600 text-white",
  info: "bg-info-500 border-info-600 text-white",
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", onClose, ...props }, ref) => {
    const role = variant === "error" ? "alert" : "status";
    return (
      <div
        ref={ref}
        role={role}
        aria-live={variant === "error" ? "assertive" : "polite"}
        className={cn(
          "flex w-full items-start justify-between gap-4 rounded-md border px-4 py-3 shadow-md",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  ),
);

ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-neutral-600 dark:text-neutral-300", className)} {...props} />
));

ToastDescription.displayName = "ToastDescription";

export type ToastActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800",
        className,
      )}
      {...props}
    />
  ),
);

ToastAction.displayName = "ToastAction";

export type ToastCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label="닫기"
      className={cn(
        "rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
        className,
      )}
      {...props}
    >
      ✕
    </button>
  ),
);

ToastClose.displayName = "ToastClose";

export const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed right-6 top-6 z-toast flex w-[360px] max-w-[calc(100vw-3rem)] flex-col gap-3",
        className,
      )}
      {...props}
    />
  ),
);

ToastViewport.displayName = "ToastViewport";
