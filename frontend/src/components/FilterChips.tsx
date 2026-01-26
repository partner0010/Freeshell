type FilterChip = {
  id: string;
  label: string;
};

type FilterChipsProps = {
  chips: FilterChip[];
  activeIds: string[];
  onToggle: (id: string) => void;
};

export default function FilterChips({ chips, activeIds, onToggle }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const isActive = activeIds.includes(chip.id);
        return (
          <button
            key={chip.id}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isActive
                ? "bg-primary-500 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
            onClick={() => onToggle(chip.id)}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
