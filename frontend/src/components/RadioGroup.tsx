type RadioOption = {
  id: string;
  label: string;
};

type RadioGroupProps = {
  label: string;
  options: RadioOption[];
  selectedId: string;
  onChange: (id: string) => void;
};

export default function RadioGroup({
  label,
  options,
  selectedId,
  onChange,
}: RadioGroupProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-neutral-700">{label}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="radio"
              name={label}
              checked={selectedId === option.id}
              onChange={() => onChange(option.id)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
