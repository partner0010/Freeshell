import { useCallback, useEffect, useRef, useState } from "react";

type ToastVariant = "success" | "info" | "warning" | "error";

type ToastProps = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  showIcon?: boolean;
  icon?: React.ReactNode;
  actionSlot?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionAlign?: "left" | "right";
  onClose?: () => void;
  autoDismissMs?: number;
  exitDurationMs?: number;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  showPausedAt?: boolean;
  pausedAtFormat?: "time" | "datetime";
  pausedAtFormatter?: (date: Date) => string;
  forcePause?: boolean;
  showRemainingBadge?: boolean;
  remainingBadgeFormat?: "seconds" | "mm:ss";
  animationFrom?: "top" | "bottom";
  closeOnEsc?: boolean;
  focusOnMount?: boolean;
  announcement?: string;
};

const variantClasses: Record<ToastVariant, string> = {
  success: "border-success-500 text-success-500",
  info: "border-info-500 text-info-500",
  warning: "border-warning-500 text-warning-500",
  error: "border-error-500 text-error-500",
};

const progressClasses: Record<ToastVariant, string> = {
  success: "bg-success-500",
  info: "bg-info-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
};

const actionClasses: Record<ToastVariant, string> = {
  success: "bg-success-500/10 text-success-600 hover:bg-success-500/20",
  info: "bg-info-500/10 text-info-600 hover:bg-info-500/20",
  warning: "bg-warning-500/10 text-warning-600 hover:bg-warning-500/20",
  error: "bg-error-500/10 text-error-600 hover:bg-error-500/20",
};

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  info: "i",
  warning: "!",
  error: "×",
};

export default function Toast({
  title,
  description,
  variant = "info",
  showIcon = false,
  icon,
  actionSlot,
  actionLabel,
  onAction,
  actionAlign = "right",
  onClose,
  autoDismissMs,
  exitDurationMs = 160,
  showProgress = false,
  pauseOnHover = false,
  showPausedAt = false,
  pausedAtFormat = "time",
  pausedAtFormatter,
  forcePause = false,
  showRemainingBadge = false,
  remainingBadgeFormat = "seconds",
  animationFrom = "top",
  closeOnEsc = false,
  focusOnMount = false,
  announcement,
}: ToastProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [remainingMs, setRemainingMs] = useState<number | null>(autoDismissMs ?? null);
  const startedAtRef = useRef<number | null>(null);
  const leaveTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const ariaRole = variant === "error" ? "alert" : "status";
  const ariaLive = variant === "error" ? "assertive" : "polite";

  const clearTimers = useCallback(() => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const startTimers = useCallback((duration: number) => {
    if (!onClose) {
      return;
    }
    const leaveDelay = Math.max(duration - exitDurationMs, 0);
    startedAtRef.current = Date.now();
    leaveTimerRef.current = window.setTimeout(() => {
      setIsLeaving(true);
    }, leaveDelay);
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, duration);
  }, [exitDurationMs, onClose]);

  useEffect(() => {
    if (!autoDismissMs || !onClose) {
      return undefined;
    }
    setRemainingMs(autoDismissMs);
    startTimers(autoDismissMs);
    return () => {
      clearTimers();
    };
  }, [autoDismissMs, clearTimers, onClose, startTimers]);

  const handleClose = useCallback(() => {
    if (!onClose) {
      return;
    }
    setIsLeaving(true);
    window.setTimeout(() => {
      onClose();
    }, exitDurationMs);
  }, [exitDurationMs, onClose]);

  useEffect(() => {
    if (!closeOnEsc || !onClose) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEsc, handleClose, onClose]);

  useEffect(() => {
    if (focusOnMount) {
      containerRef.current?.focus();
    }
  }, [focusOnMount]);

  useEffect(() => {
    if (!showRemainingBadge || !autoDismissMs) {
      return;
    }
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [autoDismissMs, showRemainingBadge]);

  useEffect(() => {
    if (!forcePause) {
      if (!isHovering && onClose && remainingMs && remainingMs > 0) {
        setIsPaused(false);
        setPausedAt(null);
        startTimers(remainingMs);
      }
      return;
    }
    if (startedAtRef.current) {
      const elapsed = Date.now() - startedAtRef.current;
      const nextRemaining = Math.max((remainingMs ?? autoDismissMs ?? 0) - elapsed, 0);
      setRemainingMs(nextRemaining);
    }
    setIsPaused(true);
    if (showPausedAt) {
      setPausedAt(new Date());
    }
    clearTimers();
  }, [
    autoDismissMs,
    clearTimers,
    forcePause,
    isHovering,
    onClose,
    remainingMs,
    showPausedAt,
    startTimers,
  ]);

  const handleMouseEnter = () => {
    if (!pauseOnHover || !autoDismissMs || !onClose) {
      return;
    }
    setIsHovering(true);
    if (startedAtRef.current) {
      const elapsed = Date.now() - startedAtRef.current;
      const nextRemaining = Math.max((remainingMs ?? autoDismissMs) - elapsed, 0);
      setRemainingMs(nextRemaining);
    }
    setIsPaused(true);
    if (showPausedAt) {
      setPausedAt(new Date());
    }
    clearTimers();
  };

  const handleMouseLeave = () => {
    if (!pauseOnHover || !onClose || !remainingMs || remainingMs <= 0) {
      return;
    }
    setIsHovering(false);
    if (forcePause) {
      return;
    }
    setIsPaused(false);
    setPausedAt(null);
    startTimers(remainingMs);
  };

  const resolveRemainingMs = (timestamp: number) => {
    const base = remainingMs ?? autoDismissMs ?? 0;
    if (!startedAtRef.current || isPaused) {
      return Math.max(base, 0);
    }
    const elapsed = timestamp - startedAtRef.current;
    return Math.max(base - elapsed, 0);
  };
  const displayRemainingMs = resolveRemainingMs(now);
  const remainingLabel =
    remainingBadgeFormat === "mm:ss"
      ? `${String(Math.floor(displayRemainingMs / 60000)).padStart(2, "0")}:${String(
          Math.ceil((displayRemainingMs % 60000) / 1000),
        ).padStart(2, "0")}`
      : `${Math.ceil(displayRemainingMs / 1000)}s`;

  const leftAlignedActions =
    actionAlign === "left" && (actionSlot || actionLabel) ? (
      <div className="mt-2 flex items-center gap-2">
        {actionLabel ? (
          <button
            type="button"
            className={`rounded-md px-2 py-1 text-xs ${actionClasses[variant]}`}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
        {actionSlot ? <div className="flex items-center gap-2">{actionSlot}</div> : null}
      </div>
    ) : null;

  return (
    <div
      ref={containerRef}
      className={`${
        isLeaving ? `toast-exit-${animationFrom}` : `toast-enter-${animationFrom}`
      } flex items-start justify-between gap-4 rounded-md border-l-4 bg-white px-4 py-3 shadow dark:bg-neutral-900 ${variantClasses[variant]}`}
      role={ariaRole}
      aria-live={ariaLive}
      aria-atomic="true"
      tabIndex={focusOnMount ? -1 : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        {showIcon ? (
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">
            {icon ?? variantIcons[variant]}
          </span>
        ) : null}
        <div>
          {announcement ? <span className="sr-only">{announcement}</span> : null}
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
          {description ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
          ) : null}
          {leftAlignedActions}
          {showPausedAt && pausedAt ? (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-300">
              일시정지:{" "}
              {pausedAtFormatter
                ? pausedAtFormatter(pausedAt)
                : pausedAtFormat === "datetime"
                ? pausedAt.toLocaleString()
                : pausedAt.toLocaleTimeString()}
            </p>
          ) : null}
          {showProgress && autoDismissMs ? (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className={`toast-progress h-full ${progressClasses[variant]}`}
                style={{
                  animationDuration: `${autoDismissMs}ms`,
                  animationPlayState: isPaused ? "paused" : "running",
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      {showRemainingBadge && autoDismissMs ? (
        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
          {remainingLabel}
        </span>
      ) : null}
      {actionAlign === "right" && (actionSlot || actionLabel || onClose) ? (
        <div className="flex items-center gap-2">
          {actionLabel ? (
            <button
              type="button"
              className={`rounded-md px-2 py-1 text-xs ${actionClasses[variant]}`}
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
          {actionSlot ? <div className="flex items-center gap-2">{actionSlot}</div> : null}
          {onClose ? (
            <button
              type="button"
              aria-label="닫기"
              className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              onClick={handleClose}
            >
              ✕
            </button>
          ) : null}
        </div>
      ) : onClose ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="닫기"
            className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
