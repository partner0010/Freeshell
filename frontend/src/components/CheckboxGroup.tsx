type CheckboxOption = {
  id: string;
  label: string;
};

type CheckboxGroupProps = {
  label: string;
  options: CheckboxOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export default function CheckboxGroup({
  label,
  options,
  selectedIds,
  onChange,
}: CheckboxGroupProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-neutral-700">{label}</legend>
      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = selectedIds.includes(option.id);
          return (
            <label key={option.id} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  onChange(
                    isChecked
                      ? selectedIds.filter((id) => id !== option.id)
                      : [...selectedIds, option.id],
                  );
                }}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
