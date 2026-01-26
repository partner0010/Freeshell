type DropdownMenuProps = {
  label: string;
  items: string[];
};

export default function DropdownMenu({ label, items }: DropdownMenuProps) {
  return (
    <div className="group relative inline-flex">
      <button className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
        {label}
      </button>
      <div className="absolute top-full left-0 z-10 mt-2 hidden w-40 rounded-lg border border-neutral-200 bg-white shadow group-hover:block">
        {items.map((item) => (
          <button
            key={item}
            className="block w-full px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-100"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
