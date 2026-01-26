type LineChartProps = {
  label: string;
  values: number[];
};

export default function LineChart({ label, values }: LineChartProps) {
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-neutral-900">{label}</p>
      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <svg viewBox="0 0 100 100" className="h-24 w-full">
          <polyline
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="3"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
}
