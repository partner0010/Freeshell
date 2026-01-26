import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/utils";

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within <Dialog>.");
  }
  return context;
};

type DialogContentContextValue = {
  titleId: string;
  descriptionId: string;
  registerTitle: () => void;
  registerDescription: () => void;
  hasTitle: boolean;
  hasDescription: boolean;
};

const DialogContentContext = React.createContext<DialogContentContextValue | null>(null);

const useDialogContentContext = () => {
  const context = React.useContext(DialogContentContext);
  if (!context) {
    throw new Error("DialogTitle and DialogDescription must be used within DialogContent.");
  }
  return context;
};

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

export type DialogTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();
    return (
      <button
        ref={ref}
        type="button"
        onClick={(event) => {
          onClick?.(event);
          onOpenChange(true);
        }}
        {...props}
      />
    );
  },
);

DialogTrigger.displayName = "DialogTrigger";

export type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  ariaLabel?: string;
};

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ariaLabel, ...props }, ref) => {
    const { open, onOpenChange } = useDialogContext();
    const [mounted, setMounted] = React.useState(false);
    const [hasTitle, setHasTitle] = React.useState(false);
    const [hasDescription, setHasDescription] = React.useState(false);
    const titleId = React.useId();
    const descriptionId = React.useId();
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => setMounted(true), []);

    React.useEffect(() => {
      if (!open) {
        return;
      }
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onOpenChange, open]);

    React.useEffect(() => {
      if (open) {
        window.setTimeout(() => contentRef.current?.focus(), 0);
      }
    }, [open]);

    if (!mounted || !open) {
      return null;
    }

    return createPortal(
      <div className="fixed inset-0 z-modal flex items-center justify-center px-4">
        <DialogOverlay onClick={() => onOpenChange(false)} />
        <DialogContentContext.Provider
          value={{
            titleId,
            descriptionId,
            registerTitle: () => setHasTitle(true),
            registerDescription: () => setHasDescription(true),
            hasTitle,
            hasDescription,
          }}
        >
          <div
            ref={(node) => {
              contentRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={hasTitle ? titleId : undefined}
            aria-describedby={hasDescription ? descriptionId : undefined}
            aria-label={!hasTitle ? ariaLabel : undefined}
            tabIndex={-1}
            className={cn(
              "relative z-modal w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-6 shadow-lg focus-visible:outline-none",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </DialogContentContext.Provider>
      </div>,
      document.body,
    );
  },
);

DialogContent.displayName = "DialogContent";

export type DialogOverlayProps = React.HTMLAttributes<HTMLDivElement>;

export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("fixed inset-0 bg-neutral-900/50 backdrop-blur-sm", className)}
      {...props}
    />
  ),
);

DialogOverlay.displayName = "DialogOverlay";

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4 space-y-1", className)} {...props} />
  ),
);

DialogHeader.displayName = "DialogHeader";

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  ),
);

DialogFooter.displayName = "DialogFooter";

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId, registerTitle } = useDialogContentContext();
    React.useEffect(() => {
      registerTitle();
    }, [registerTitle]);
    return (
      <h2 ref={ref} id={titleId} className={cn("text-lg font-semibold", className)} {...props} />
    );
  },
);

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { descriptionId, registerDescription } = useDialogContentContext();
  React.useEffect(() => {
    registerDescription();
  }, [registerDescription]);
  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn("text-sm text-neutral-600 dark:text-neutral-300", className)}
      {...props}
    />
  );
});

DialogDescription.displayName = "DialogDescription";

export type DialogCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ onClick, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();
    return (
      <button
        ref={ref}
        type="button"
        onClick={(event) => {
          onClick?.(event);
          onOpenChange(false);
        }}
        {...props}
      />
    );
  },
);

DialogClose.displayName = "DialogClose";
