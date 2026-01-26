import { Toast, ToastClose, ToastDescription, ToastTitle, ToastViewport } from "./toast";
import { useToast } from "../../hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} onClose={() => dismiss(toast.id)}>
          <div className="flex-1">
            {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
            {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
            {toast.actionLabel && toast.onAction ? (
              <div className="mt-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-primary-500 hover:text-primary-600"
                  onClick={toast.onAction}
                >
                  {toast.actionLabel}
                </button>
              </div>
            ) : null}
          </div>
          <ToastClose onClick={() => dismiss(toast.id)} />
        </Toast>
      ))}
    </ToastViewport>
  );
}
