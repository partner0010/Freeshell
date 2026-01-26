type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function SearchInput({
  placeholder = "검색...",
  value,
  onChange,
}: SearchInputProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2">
      <span className="text-neutral-400">⌕</span>
      <input
        className="w-full text-sm text-neutral-900 outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
}
