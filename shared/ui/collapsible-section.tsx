"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

interface Props {
  id: string;
  title: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({ id, title, defaultOpen = true, className = "", children }: Props) {
  const storageKey = `dash-section:${id}`;
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setOpen(stored === "true");
    } catch {}
    setMounted(true);
  }, [storageKey]);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      try { localStorage.setItem(storageKey, String(next)); } catch {}
      return next;
    });
  }

  return (
    <section className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </h2>
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={open ? "Ocultar secção" : "Mostrar secção"}
          aria-expanded={open}
        >
          {open ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`} />
        </button>
      </div>
      {mounted && open && <div>{children}</div>}
    </section>
  );
}
