import * as React from "react";

export type ToastVariant = "default" | "success" | "warning" | "error" | "info";

export type ToastData = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastState = {
  toasts: ToastData[];
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastData }
  | { type: "DISMISS_TOAST"; toastId: string };

const listeners = new Set<(state: ToastState) => void>();
let memoryState: ToastState = { toasts: [] };

const emit = (state: ToastState) => {
  listeners.forEach((listener) => listener(state));
};

const reducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return { toasts: [action.toast, ...state.toasts].slice(0, 5) };
    case "DISMISS_TOAST":
      return { toasts: state.toasts.filter((toast) => toast.id !== action.toastId) };
    default:
      return state;
  }
};

const dispatch = (action: ToastAction) => {
  memoryState = reducer(memoryState, action);
  emit(memoryState);
};

const generateId = () => Math.random().toString(36).slice(2);

export const toast = (data: Omit<ToastData, "id">) => {
  const id = generateId();
  const toastData: ToastData = { id, variant: "default", duration: 4000, ...data };
  dispatch({ type: "ADD_TOAST", toast: toastData });
  if (toastData.duration && toastData.duration > 0) {
    window.setTimeout(() => dispatch({ type: "DISMISS_TOAST", toastId: id }), toastData.duration);
  }
  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
};

export const dismissToast = (toastId: string) => {
  dispatch({ type: "DISMISS_TOAST", toastId });
};

export const useToast = () => {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: dismissToast,
  };
};
