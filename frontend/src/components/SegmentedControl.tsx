type Segment = {
  id: string;
  label: string;
};

type SegmentedControlProps = {
  segments: Segment[];
  activeId: string;
  onChange: (id: string) => void;
};

export default function SegmentedControl({
  segments,
  activeId,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-white p-1">
      {segments.map((segment) => {
        const isActive = segment.id === activeId;
        return (
          <button
            key={segment.id}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              isActive ? "bg-primary-500 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
            onClick={() => onChange(segment.id)}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
