type SidebarItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type SidebarSection = {
  id: string;
  label: string;
  items: SidebarItem[];
};

type SidebarProps = {
  items?: SidebarItem[];
  sections?: SidebarSection[];
  activeId?: string;
  onChange?: (id: string) => void;
};

export default function Sidebar({
  items = [],
  sections,
  activeId,
  onChange,
}: SidebarProps) {
  const renderItems = (list: SidebarItem[]) =>
    list.map((item) => {
      const isActive = item.id === activeId;
      return (
        <button
          key={item.id}
          type="button"
          aria-current={isActive ? "page" : undefined}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
            isActive
              ? "bg-primary-500 text-white"
              : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          }`}
          onClick={() => onChange?.(item.id)}
        >
          {item.icon ? <span className="text-base">{item.icon}</span> : null}
          <span>{item.label}</span>
        </button>
      );
    });

  return (
    <aside className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      {sections?.length
        ? sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {section.label}
              </p>
              <div className="flex flex-col gap-2">{renderItems(section.items)}</div>
            </div>
          ))
        : renderItems(items)}
    </aside>
  );
}
