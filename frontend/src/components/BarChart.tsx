type BarChartProps = {
  label: string;
  values: number[];
};

export default function BarChart({ label, values }: BarChartProps) {
  const max = Math.max(1, ...values);
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-neutral-900">{label}</p>
      <div className="flex items-end gap-2 rounded-lg border border-neutral-200 bg-white p-3">
        {values.map((value, index) => (
          <div
            key={`${label}-bar-${index}`}
            className="w-4 rounded-md bg-primary-500"
            style={{ height: `${Math.round((value / max) * 80) + 8}px` }}
            title={`${value}`}
          />
        ))}
      </div>
    </div>
  );
}
