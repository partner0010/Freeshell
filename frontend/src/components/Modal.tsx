type ModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
          </div>
          <button
            className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
