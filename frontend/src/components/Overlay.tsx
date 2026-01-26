type OverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Overlay({ isOpen, onClose, children }: OverlayProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-900/40"
      onClick={onClose}
    >
      <div
        className="max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
