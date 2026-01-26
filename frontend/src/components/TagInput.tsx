type TagInputProps = {
  label: string;
  tags: string[];
  placeholder?: string;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
};

export default function TagInput({
  label,
  tags,
  placeholder = "태그 추가",
  onAdd,
  onRemove,
}: TagInputProps) {
  return (
    <label className="block text-sm font-medium text-neutral-700">
      {label}
      <div className="mt-2 flex flex-wrap gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
            onClick={() => onRemove(tag)}
          >
            {tag}
            <span className="text-neutral-400">×</span>
          </button>
        ))}
        <input
          className="min-w-[120px] flex-1 text-sm text-neutral-900 outline-none"
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.currentTarget.value.trim()) {
              event.preventDefault();
              onAdd(event.currentTarget.value.trim());
              event.currentTarget.value = "";
            }
          }}
        />
      </div>
    </label>
  );
}
