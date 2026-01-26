type Breadcrumb = {
  label: string;
};

type BreadcrumbsProps = {
  items: Breadcrumb[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-neutral-600">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          <span>{item.label}</span>
          {index < items.length - 1 ? <span className="text-neutral-300">/</span> : null}
        </span>
      ))}
    </nav>
  );
}
