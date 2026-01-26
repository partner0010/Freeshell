type TimelineItem = {
  title: string;
  description: string;
  time: string;
};

type TimelineProps = {
  items: TimelineItem[];
};

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative space-y-4 border-l border-neutral-200 pl-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="relative">
          <span className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full bg-primary-500" />
          <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
          <p className="text-sm text-neutral-600">{item.description}</p>
          <p className="text-xs text-neutral-400">{item.time}</p>
        </div>
      ))}
    </div>
  );
}
