type DrawerProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Drawer({ title, isOpen, onClose, children }: DrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/40">
      <div className="h-full w-full max-w-sm bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button
            className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
