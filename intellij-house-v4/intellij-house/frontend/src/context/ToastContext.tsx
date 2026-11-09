import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Tipo = "info" | "erro";

interface ToastApi {
  mostrar: (mensagem: string, tipo?: Tipo) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ mensagem: string; tipo: Tipo; visivel: boolean }>({ mensagem: "", tipo: "info", visivel: false });
  const timer = useRef<number>();

  const mostrar = useCallback((mensagem: string, tipo: Tipo = "info") => {
    setToast({ mensagem, tipo, visivel: true });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast((t) => ({ ...t, visivel: false })), 3000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const api = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={`toast${toast.visivel ? " show" : ""}${toast.tipo === "erro" ? " err" : ""}`} role="status">
        {toast.mensagem}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}
