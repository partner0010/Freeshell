type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ToastStackProps = {
  position?: ToastPosition;
  isFixed?: boolean;
  children: React.ReactNode;
};

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

export default function ToastStack({
  position = "top-right",
  isFixed = true,
  children,
}: ToastStackProps) {
  return (
    <div
      className={`${isFixed ? "fixed" : "absolute"} ${positionClasses[position]} z-50 flex w-72 flex-col gap-2`}
    >
      {children}
    </div>
  );
}
