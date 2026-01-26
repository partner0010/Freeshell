import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/utils";

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu>.");
  }
  return context;
};

export type DropdownMenuProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const resolvedOpen = open ?? internalOpen;

  const setOpen = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <DropdownContext.Provider value={{ open: resolvedOpen, setOpen, triggerRef }}>
      {children}
    </DropdownContext.Provider>
  );
}

export type DropdownMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownContext();
    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          onClick?.(event);
          setOpen(!open);
        }}
        className={className}
        {...props}
      />
    );
  },
);

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "end";
  sideOffset?: number;
};

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "start", sideOffset = 8, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownContext();
    const [mounted, setMounted] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    React.useEffect(() => setMounted(true), []);

    React.useEffect(() => {
      if (!open) {
        return;
      }
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          contentRef.current &&
          !contentRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [open, setOpen, triggerRef]);

    React.useLayoutEffect(() => {
      if (!open || !triggerRef.current) {
        return;
      }
      const rect = triggerRef.current.getBoundingClientRect();
      const contentWidth = contentRef.current?.offsetWidth ?? 0;
      const left = align === "end" ? rect.right - contentWidth : rect.left;
      setPosition({ top: rect.bottom + sideOffset, left });
    }, [align, open, sideOffset, triggerRef]);

    if (!mounted || !open) {
      return null;
    }

    return createPortal(
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="menu"
        style={{ top: position.top, left: position.left }}
        className={cn(
          "fixed z-dropdown min-w-[180px] rounded-sm border border-neutral-200 bg-white p-1 text-body shadow-md",
          className,
        )}
        {...props}
      />,
      document.body,
    );
  },
);

DropdownMenuContent.displayName = "DropdownMenuContent";

export type DropdownMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 transition-colors duration-fast",
        className,
      )}
      {...props}
    />
  ),
);

DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-xs font-semibold text-neutral-500", className)}
      {...props}
    />
  ),
);

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("my-1 h-px bg-neutral-200 dark:bg-neutral-800", className)} {...props} />
  ),
);

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
