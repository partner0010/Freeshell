type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  label: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
};

export default function Dropdown({ label, options, value, onChange }: DropdownProps) {
  return (
    <label className="block text-sm font-medium text-neutral-700">
      {label}
      <select
        className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
