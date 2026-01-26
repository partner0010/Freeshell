type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
};

export default function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              isActive ? "bg-primary-500 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
