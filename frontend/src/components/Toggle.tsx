type ToggleProps = {
  label: string;
  checked?: boolean;
  onChange?: (nextValue: boolean) => void;
  disabled?: boolean;
};

export default function Toggle({
  label,
  checked = false,
  onChange,
  disabled = false,
}: ToggleProps) {
  const trackClasses = checked
    ? "bg-primary-500 border-primary-500"
    : "bg-neutral-200 border-neutral-200";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <label className="flex items-center gap-3 text-sm text-neutral-700">
      <span>{label}</span>
      <span
        className={`inline-flex h-6 w-11 items-center rounded-full border transition ${trackClasses} ${disabledClasses}`}
        aria-checked={checked}
        role="switch"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            onChange?.(!checked);
          }
        }}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onChange?.(!checked);
          }
        }}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}
