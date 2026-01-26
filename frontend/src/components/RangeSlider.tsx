type RangeSliderProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

export default function RangeSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: RangeSliderProps) {
  return (
    <label className="block text-sm font-medium text-neutral-700">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-xs text-neutral-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-primary-500"
      />
    </label>
  );
}
