"use client";
import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], desc: "Abrir pesquisa global" },
  { keys: ["?"], desc: "Mostrar este atalho" },
  { keys: ["Esc"], desc: "Fechar modal aberto" },
  { keys: ["G", "M"], desc: "Ir para Movimentos" },
  { keys: ["G", "D"], desc: "Ir para Dashboard" },
  { keys: ["G", "F"], desc: "Ir para Fornecedores" },
  { keys: ["G", "R"], desc: "Ir para Relatórios" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastKey: string | null = null;
    let lastKeyTime = 0;

    const handler = (e: KeyboardEvent) => {
      // Ignorar quando se está a digitar
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;

      if (e.key === "?" && !isTyping && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      // Atalhos "g <letra>" para navegação
      if (isTyping) return;
      const now = Date.now();
      if (lastKey === "g" && (now - lastKeyTime) < 1000) {
        const map: Record<string, string> = {
          m: "/dashboard/movimentos",
          d: "/dashboard",
          f: "/dashboard/fornecedores",
          r: "/dashboard/relatorios",
          c: "/dashboard/conceitos",
        };
        const dest = map[e.key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          window.location.href = dest;
        }
        lastKey = null;
        return;
      }
      if (e.key.toLowerCase() === "g") {
        lastKey = "g";
        lastKeyTime = now;
      } else {
        lastKey = null;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Atalhos de teclado</h3>
          </div>
          <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{s.desc}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">{k}</kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-4 text-center">Prima <kbd className="px-1 bg-gray-100 dark:bg-gray-800 rounded">?</kbd> a qualquer momento para abrir.</p>
      </div>
    </div>
  );
}
