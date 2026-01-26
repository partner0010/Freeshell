type ListItem = {
  title: string;
  description?: string;
  meta?: string;
};

type ListProps = {
  items: ListItem[];
};

export default function List({ items }: ListProps) {
  return (
    <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
              {item.description ? (
                <p className="text-sm text-neutral-600">{item.description}</p>
              ) : null}
            </div>
            {item.meta ? <span className="text-xs text-neutral-500">{item.meta}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
