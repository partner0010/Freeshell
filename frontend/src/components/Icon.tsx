type IconProps = {
  symbol: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses: Record<NonNullable<IconProps["size"]>, string> = {
  sm: "h-4 w-4 text-xs",
  md: "h-5 w-5 text-sm",
  lg: "h-6 w-6 text-base",
};

export default function Icon({
  symbol,
  label,
  size = "md",
  className,
}: IconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-neutral-100 text-neutral-700 ${sizeClasses[size]} ${className ?? ""}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {symbol}
    </span>
  );
}
