type MetricCardProps = {
  label: string;
  value: string;
  delta?: string;
};

export default function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-2xl font-semibold text-neutral-900">{value}</span>
        {delta ? <span className="text-xs text-success-500">{delta}</span> : null}
      </div>
    </div>
  );
}
