type NotificationItem = {
  title: string;
  description: string;
  time: string;
};

type NotificationListProps = {
  items: NotificationItem[];
};

export default function NotificationList({ items }: NotificationListProps) {
  return (
    <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
              <p className="text-sm text-neutral-600">{item.description}</p>
            </div>
            <span className="text-xs text-neutral-400">{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
