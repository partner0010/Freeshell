type TopbarProps = {
  title: string;
  rightSlot?: React.ReactNode;
};

export default function Topbar({ title, rightSlot }: TopbarProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}
