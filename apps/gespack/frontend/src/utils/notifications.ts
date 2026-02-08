import { toast, type ToastOptions } from "react-toastify";

const BASE: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  pauseOnHover: true,
  closeOnClick: true,
  draggable: true,
};

export const notify = {
  success: (msg: string, opts?: ToastOptions) => toast.success(msg, { ...BASE, ...opts }),
  error:   (msg: string, opts?: ToastOptions) => toast.error(msg,   { ...BASE, ...opts }),
  warn:    (msg: string, opts?: ToastOptions) => toast.warn(msg,    { ...BASE, ...opts }),
  info:    (msg: string, opts?: ToastOptions) => toast.info(msg,    { ...BASE, ...opts }),
  loading: (msg: string, opts?: ToastOptions) => toast.loading(msg, { ...BASE, ...opts }),
  
  // Para toasts de promesa con mensajes estáticos (sin funciones para evitar TS)
  promise: <T>(p: Promise<T>, msgs: { pending: string; success: string; error: string }, opts?: ToastOptions) =>
    toast.promise(p, { pending: msgs.pending, success: msgs.success, error: msgs.error }, { ...BASE, ...opts }),
};