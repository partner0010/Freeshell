type TooltipProps = {
  label: string;
  children: React.ReactNode;
};

export default function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="relative inline-flex items-center">
      <span className="group inline-flex">
        {children}
        <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white group-hover:block">
          {label}
        </span>
      </span>
    </span>
  );
}
