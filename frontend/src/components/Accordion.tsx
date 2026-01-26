type AccordionItem = {
  id: string;
  title: string;
  content: string;
};

type AccordionProps = {
  items: AccordionItem[];
  openId?: string;
  onChange?: (id: string) => void;
};

export default function Accordion({ items, openId, onChange }: AccordionProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="rounded-lg border border-neutral-200 bg-white">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-neutral-900"
              onClick={() => onChange?.(item.id)}
            >
              {item.title}
              <span className="text-neutral-400">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen ? (
              <div className="border-t border-neutral-100 px-4 py-3 text-sm text-neutral-600">
                {item.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
