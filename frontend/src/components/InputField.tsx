type InputFieldProps = {
  id?: string;
  name?: string;
  label: string;
  subLabel?: string;
  prefixSlot?: React.ReactNode;
  suffixSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  showCount?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  helperSlotAlign?: "left" | "right";
  helperWrap?: "wrap" | "nowrap";
  requiredBadge?: boolean;
  requiredBadgeLabel?: string;
  helperIconSlot?: React.ReactNode;
  helperIconSize?: "sm" | "md" | "lg";
  helperIconClickable?: boolean;
  helperIconAriaLabel?: string;
  onHelperIconClick?: () => void;
  helperIconColor?: "muted" | "primary" | "warning" | "error";
  helperIconTooltip?: string;
  helperSlot?: React.ReactNode;
  helperText?: string;
  errorText?: string;
  prefixClickable?: boolean;
  suffixClickable?: boolean;
  prefixDisabled?: boolean;
  suffixDisabled?: boolean;
  prefixHoverable?: boolean;
  suffixHoverable?: boolean;
  onPrefixClick?: () => void;
  onSuffixClick?: () => void;
  prefixAriaLabel?: string;
  suffixAriaLabel?: string;
  status?: "default" | "success" | "warning" | "error";
  disabled?: boolean;
  required?: boolean;
  statusIcon?: React.ReactNode;
  list?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function InputField({
  id,
  name,
  label,
  subLabel,
  prefixSlot,
  suffixSlot,
  actionSlot,
  placeholder,
  type = "text",
  autoComplete,
  value,
  onChange,
  maxLength,
  showCount = false,
  clearable = false,
  onClear,
  clearLabel = "지우기",
  helperSlotAlign = "right",
  helperWrap = "nowrap",
  requiredBadge = false,
  requiredBadgeLabel = "필수",
  helperIconSlot,
  helperIconSize = "sm",
  helperIconClickable = false,
  helperIconAriaLabel = "도움말 아이콘",
  onHelperIconClick,
  helperIconColor = "muted",
  helperIconTooltip,
  helperSlot,
  helperText,
  errorText,
  prefixClickable = false,
  suffixClickable = false,
  prefixDisabled = false,
  suffixDisabled = false,
  prefixHoverable = true,
  suffixHoverable = true,
  onPrefixClick,
  onSuffixClick,
  prefixAriaLabel = "접두 아이콘",
  suffixAriaLabel = "접미 아이콘",
  status = "default",
  disabled = false,
  required = false,
  statusIcon,
  list,
  onBlur,
  onKeyUp,
  onKeyDown,
}: InputFieldProps) {
  const baseId = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const fieldId = id ?? (baseId ? `input-${baseId}` : "input-field");
  const describedBy = errorText ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined;
  const resolvedStatus = errorText ? "error" : status;
  const helperColor =
    resolvedStatus === "error"
      ? "text-error-500"
      : resolvedStatus === "success"
      ? "text-success-500"
      : resolvedStatus === "warning"
      ? "text-warning-500"
      : "text-neutral-500 dark:text-neutral-400";
  const borderColor =
    resolvedStatus === "error"
      ? "border-error-500"
      : resolvedStatus === "success"
      ? "border-success-500"
      : resolvedStatus === "warning"
      ? "border-warning-500"
      : "border-neutral-200 dark:border-neutral-700";
  const disabledStyles = disabled
    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700"
    : "";

  const statusIconByState: Record<Exclude<NonNullable<InputFieldProps["status"]>, "default">, string> = {
    success: "✓",
    warning: "!",
    error: "×",
  };
  const resolvedStatusIcon =
    status === "default" ? null : statusIcon ?? statusIconByState[status];
  const hasLeftSlot = Boolean(prefixSlot);
  const canClear = clearable && Boolean(value?.length) && !disabled;
  const hasRightSlot = Boolean(actionSlot || suffixSlot || resolvedStatusIcon || canClear);
  const canShowStatusIcon = !actionSlot && !canClear;
  const countLabel =
    showCount && typeof maxLength === "number" ? `${value?.length ?? 0}/${maxLength}` : null;
  const helperAnimationClass =
    resolvedStatus === "error"
      ? "validation-enter-error"
      : resolvedStatus === "warning"
      ? "validation-enter-warning"
      : resolvedStatus === "success"
      ? "validation-enter-success"
      : "";
  const helperWrapClass = helperWrap === "wrap" ? "flex-wrap" : "flex-nowrap";
  const helperTextWrap = helperWrap === "wrap" ? "whitespace-normal" : "whitespace-nowrap";

  return (
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
      <span>
        {label}
        {required ? (
          requiredBadge ? (
            <span className="ml-2 rounded-full bg-error-500/10 px-2 py-0.5 text-xs text-error-500">
              {requiredBadgeLabel}
            </span>
          ) : (
            <span className="ml-1 text-error-500">*</span>
          )
        ) : null}
      </span>
      {subLabel ? <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{subLabel}</p> : null}
      <div className="relative mt-2">
        <input
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          list={list}
          aria-invalid={Boolean(errorText)}
          aria-describedby={describedBy}
          className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 ${borderColor} ${disabledStyles} ${
            hasLeftSlot ? "pl-9" : ""
          } ${hasRightSlot ? "pr-10" : ""}`}
        />
        {prefixSlot ? (
          prefixClickable ? (
            <button
              type="button"
              className={`absolute left-2 top-1/2 -translate-y-1/2 rounded px-1 text-sm ${
                prefixDisabled
                  ? "text-neutral-300 opacity-60"
                  : `text-neutral-400 ${prefixHoverable ? "hover:bg-neutral-100" : ""}`
              }`}
              onClick={onPrefixClick}
              disabled={prefixDisabled}
              aria-label={prefixAriaLabel}
            >
              {prefixSlot}
            </button>
          ) : (
            <span
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
                prefixDisabled ? "text-neutral-300 opacity-60" : "text-neutral-400"
              }`}
            >
              {prefixSlot}
            </span>
          )
        ) : null}
        {actionSlot || canClear ? (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {actionSlot}
            {canClear ? (
              <button
                type="button"
                className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
                onClick={() => {
                  if (onClear) {
                    onClear();
                    return;
                  }
                  onChange?.({
                    target: { value: "" },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                aria-label={clearLabel}
              >
                {clearLabel}
              </button>
            ) : null}
          </div>
        ) : suffixSlot ? (
          suffixClickable ? (
            <button
              type="button"
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 text-sm ${
                suffixDisabled
                  ? "text-neutral-300 opacity-60"
                  : `text-neutral-400 ${suffixHoverable ? "hover:bg-neutral-100" : ""}`
              }`}
              onClick={onSuffixClick}
              disabled={suffixDisabled}
              aria-label={suffixAriaLabel}
            >
              {suffixSlot}
            </button>
          ) : (
            <span
              className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                suffixDisabled ? "text-neutral-300 opacity-60" : "text-neutral-400"
              }`}
            >
              {suffixSlot}
            </span>
          )
        ) : canShowStatusIcon && resolvedStatusIcon ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
            {resolvedStatusIcon}
          </span>
        ) : null}
      </div>
      {helperText || errorText || helperSlot || countLabel ? (
        <div className={`mt-1 flex items-center justify-between gap-2 text-xs ${helperWrapClass}`}>
          <div className="flex items-center gap-2">
            {helperIconSlot ? (
              helperIconClickable ? (
                <button
                  type="button"
                  className={`rounded ${
                    helperIconColor === "primary"
                      ? "text-primary-500"
                      : helperIconColor === "warning"
                      ? "text-warning-500"
                      : helperIconColor === "error"
                      ? "text-error-500"
                      : "text-neutral-400"
                  } ${
                    helperIconSize === "lg"
                      ? "text-base"
                      : helperIconSize === "md"
                      ? "text-sm"
                      : "text-xs"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60`}
                  aria-label={helperIconAriaLabel}
                  onClick={onHelperIconClick}
                  title={helperIconTooltip}
                >
                  {helperIconSlot}
                </button>
              ) : (
                <span
                  className={`${
                    helperIconColor === "primary"
                      ? "text-primary-500"
                      : helperIconColor === "warning"
                      ? "text-warning-500"
                      : helperIconColor === "error"
                      ? "text-error-500"
                      : "text-neutral-400"
                  } ${
                    helperIconSize === "lg"
                      ? "text-base"
                      : helperIconSize === "md"
                      ? "text-sm"
                      : "text-xs"
                  }`}
                  title={helperIconTooltip}
                >
                  {helperIconSlot}
                </span>
              )
            ) : null}
            {helperText || errorText ? (
              <p
                id={errorText ? `${fieldId}-error` : `${fieldId}-helper`}
                className={`${helperColor} ${helperAnimationClass} ${helperTextWrap}`}
              >
                {errorText ?? helperText}
              </p>
            ) : null}
            {helperSlotAlign === "left" && (helperSlot || countLabel) ? (
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                {helperSlot}
                {countLabel ? <span>{countLabel}</span> : null}
              </div>
            ) : null}
          </div>
          {helperSlotAlign === "right" && (helperSlot || countLabel) ? (
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              {helperSlot}
              {countLabel ? <span>{countLabel}</span> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </label>
  );
}
