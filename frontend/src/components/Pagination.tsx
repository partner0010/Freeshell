type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
      <button
        className={`rounded-md px-2 py-1 ${canPrev ? "text-neutral-600 hover:bg-neutral-100" : "text-neutral-300"}`}
        disabled={!canPrev}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span className="text-neutral-600">
        {page} / {totalPages}
      </span>
      <button
        className={`rounded-md px-2 py-1 ${canNext ? "text-neutral-600 hover:bg-neutral-100" : "text-neutral-300"}`}
        disabled={!canNext}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
