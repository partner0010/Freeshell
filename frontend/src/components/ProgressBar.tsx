type ProgressBarProps = {
  label: string;
  value: number;
};

export default function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-neutral-700">
        <span>{label}</span>
        <span className="text-xs text-neutral-500">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-200">
        <div
          className="h-2 rounded-full bg-primary-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
