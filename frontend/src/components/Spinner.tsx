type SpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export default function Spinner({ label, size = "md" }: SpinnerProps) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-neutral-600">
      <span
        className={`animate-spin rounded-full border-neutral-300 border-t-primary-500 ${sizeClasses[size]}`}
      />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
