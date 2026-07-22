"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const IDLE_LIMIT_MS = 60 * 60 * 1000; // 1 hora
const EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;

/** Faz logout automático após 1h sem atividade. Coloca este componente dentro do DashboardLayout. */
export function IdleLogout() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnedRef = useRef(false);

  useEffect(() => {
    const doLogout = () => {
      if (typeof window === "undefined") return;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      toast.error("Sessão encerrada por inatividade (1h).", { duration: 8000 });
      router.push("/login?idle=1");
    };

    const reset = () => {
      warnedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      // Aviso aos 55min, logout aos 60min
      timerRef.current = setTimeout(() => {
        if (!warnedRef.current) {
          warnedRef.current = true;
          toast.warning("Vai ser desligado em 5 minutos por inatividade. Mova o rato para continuar.", { duration: 30000 });
          timerRef.current = setTimeout(doLogout, 5 * 60 * 1000);
        }
      }, IDLE_LIMIT_MS - 5 * 60 * 1000);
    };

    EVENTS.forEach((evt) => window.addEventListener(evt, reset, { passive: true }));
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((evt) => window.removeEventListener(evt, reset));
    };
  }, [router]);

  return null;
}
