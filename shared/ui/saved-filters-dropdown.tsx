"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Plus, Trash2, X, ChevronDown } from "lucide-react";
import { savedFilterService } from "@/shared/services/financeiro.service";

interface Props {
  route: string;
  currentParams: Record<string, unknown>;
  onApply: (params: Record<string, unknown>) => void;
}

export function SavedFiltersDropdown({ route, currentParams, onApply }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [nome, setNome] = useState("");

  const { data: filtros = [] } = useQuery({
    queryKey: ["saved-filters", route],
    queryFn: () => savedFilterService.list(route),
  });

  const saveMutation = useMutation({
    mutationFn: () => savedFilterService.create(nome, route, currentParams),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-filters", route] });
      toast.success("Filtro guardado");
      setShowSave(false);
      setNome("");
    },
    onError: () => toast.error("Erro ao guardar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savedFilterService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-filters", route] });
      toast.success("Filtro removido");
    },
  });

  const hasActiveFilters = Object.values(currentParams).some((v) => v !== undefined && v !== "" && v !== null);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
      >
        <Star className="h-3.5 w-3.5" />
        Filtros guardados
        {filtros.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{filtros.length}</span>}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 z-40 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1">
            {filtros.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">Sem filtros guardados</div>
            ) : (
              filtros.map((f) => (
                <div key={f.id} className="flex items-center px-1 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <button
                    onClick={() => { onApply(f.params); setOpen(false); }}
                    className="flex-1 text-left px-2 py-2 text-sm text-gray-700 dark:text-gray-300 truncate"
                  >
                    {f.name}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(f.id)}
                    className="p-1.5 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}

            {hasActiveFilters && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                {showSave ? (
                  <div className="space-y-2">
                    <input
                      autoFocus
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome do filtro..."
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm bg-white dark:bg-gray-800"
                      onKeyDown={(e) => { if (e.key === "Enter" && nome) saveMutation.mutate(); }}
                    />
                    <div className="flex gap-1">
                      <button onClick={() => saveMutation.mutate()} disabled={!nome || saveMutation.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs py-1.5 rounded">Guardar</button>
                      <button onClick={() => setShowSave(false)} className="px-2 text-xs text-gray-500"><X className="h-3 w-3" /></button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowSave(true)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 px-1 py-1">
                    <Plus className="h-3 w-3" /> Guardar filtros actuais
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
