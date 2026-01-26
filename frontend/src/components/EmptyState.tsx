type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white px-6 py-8 text-center">
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
