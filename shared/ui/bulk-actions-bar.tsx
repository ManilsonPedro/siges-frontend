"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckSquare, X, Ban, Check, ChevronDown, Loader2 } from "lucide-react";
import { movimentoService } from "@/shared/services/financeiro.service";

interface Props {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkActionsBar({ selectedIds, onClear }: Props) {
  const qc = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (estado: string) => movimentoService.bulkUpdateEstado(selectedIds, estado),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      qc.invalidateQueries({ queryKey: ["fundo"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`${r.actualizados} movimento(s) actualizado(s)` + (r.erros.length ? ` · ${r.erros.length} erro(s)` : ""));
      if (r.erros.length === 0) onClear();
      setShowMenu(false);
    },
    onError: () => toast.error("Erro ao actualizar"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => movimentoService.bulkUpdateEstado(selectedIds, "cancelado"),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      qc.invalidateQueries({ queryKey: ["fundo"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`${r.actualizados} movimento(s) cancelado(s)` + (r.erros.length ? ` · ${r.erros.length} erro(s)` : ""));
      if (r.erros.length === 0) onClear();
    },
    onError: () => toast.error("Erro ao cancelar"),
  });

  if (selectedIds.length === 0) return null;

  const busy = updateMutation.isPending || cancelMutation.isPending;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4 border border-gray-700">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-medium">{selectedIds.length} seleccionado(s)</span>
      </div>
      <div className="h-6 w-px bg-gray-700" />
      <div className="relative">
        <button
          onClick={() => setShowMenu((s) => !s)}
          disabled={busy}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Marcar como…
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {showMenu && (
          <div className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]">
            {["pago", "pago_total", "pago_parcial", "pendente", "cancelado"].map((e) => (
              <button
                key={e}
                onClick={() => updateMutation.mutate(e)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 capitalize"
              >
                {e.replace("_", " ")}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => { if (confirm(`Cancelar ${selectedIds.length} movimento(s)?`)) cancelMutation.mutate(); }}
        disabled={busy}
        className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 px-3 py-1.5 rounded-lg text-sm font-medium"
      >
        <Ban className="h-3.5 w-3.5" />
        Cancelar
      </button>
      <button onClick={onClear} className="text-gray-400 hover:text-white p-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
