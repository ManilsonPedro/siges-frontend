"use client";
import { Zap, X } from "lucide-react";
import type { MovimentoFilters } from "@/shared/types";

interface ChipFilter {
  label: string;
  emoji?: string;
  params: Partial<MovimentoFilters>;
}

const CHIPS: ChipFilter[] = [
  { label: "Pendentes",        emoji: "⏳", params: { estado_pagamento: "pendente", page: 1 } },
  { label: "Saídas BFA",       emoji: "💸", params: { tipo_movimento: "saida", page: 1 } },
  { label: "Entradas mês",     emoji: "💰", params: { tipo_movimento: "entrada", data_inicio: monthStart(), page: 1 } },
  { label: "Pago parcial",     emoji: "🔵", params: { estado_pagamento: "pago_parcial", page: 1 } },
  { label: "Cancelados",       emoji: "❌", params: { estado_pagamento: "cancelado", page: 1 } },
  { label: "Fechados",         emoji: "✅", params: { estado_movimento: "fechado", page: 1 } },
];

function monthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

interface Props {
  current: MovimentoFilters;
  onApply: (filters: MovimentoFilters) => void;
}

function isActive(chip: ChipFilter, current: MovimentoFilters): boolean {
  return Object.entries(chip.params).every(([k, v]) => {
    if (k === "page") return true;
    return (current as Record<string, unknown>)[k] === v;
  });
}

export function QuickFilterChips({ current, onApply }: Props) {
  const hasActive = Object.entries(current).some(
    ([k, v]) => k !== "page" && k !== "page_size" && v !== undefined && v !== ""
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Zap className="h-4 w-4 text-amber-500" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Filtros rápidos:</span>
      {CHIPS.map((chip) => {
        const active = isActive(chip, current);
        return (
          <button
            key={chip.label}
            onClick={() => onApply({ ...current, ...chip.params } as MovimentoFilters)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {chip.emoji && <span>{chip.emoji}</span>}
            {chip.label}
          </button>
        );
      })}
      {hasActive && (
        <button
          onClick={() => onApply({ page: 1, page_size: current.page_size || 10 })}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        >
          <X className="h-3 w-3" /> Limpar
        </button>
      )}
    </div>
  );
}
