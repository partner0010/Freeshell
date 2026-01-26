type CardListItem = {
  title: string;
  description: string;
  badge?: React.ReactNode;
};

type CardListProps = {
  items: CardListItem[];
};

export default function CardList({ items }: CardListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
        <div
          key={`${item.title}-${index}`}
          className="rounded-lg border border-neutral-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
            {item.badge ? <span>{item.badge}</span> : null}
          </div>
          <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
