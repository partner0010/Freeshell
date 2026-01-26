type DatePickerProps = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function DatePicker({ label, value, onChange }: DatePickerProps) {
  return (
    <label className="block text-sm font-medium text-neutral-700">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500"
      />
    </label>
  );
}
