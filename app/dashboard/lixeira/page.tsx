"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, RotateCcw, AlertTriangle, Users, Tag, ArrowLeftRight } from "lucide-react";
import { trashService, type TrashItem } from "@/shared/services/financeiro.service";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatCurrency, formatDateTime } from "@/shared/utils";

type Tipo = "fornecedores" | "conceitos" | "movimentos";

const TABS: { tipo: Tipo; label: string; icon: typeof Users }[] = [
  { tipo: "fornecedores", label: "Fornecedores", icon: Users },
  { tipo: "conceitos", label: "Conceitos", icon: Tag },
  { tipo: "movimentos", label: "Movimentos", icon: ArrowLeftRight },
];

export default function LixeiraPage() {
  const router = useRouter();
  const { has, isLoading: permsLoading } = usePermissions();
  const podeVer = has("lixeira.ver");
  const qc = useQueryClient();
  const [tipo, setTipo] = useState<Tipo>("fornecedores");

  useEffect(() => {
    if (!permsLoading && !podeVer) router.replace("/dashboard");
  }, [permsLoading, podeVer, router]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["trash", tipo],
    queryFn: () => trashService.list(tipo),
    enabled: podeVer,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => trashService.restore(tipo, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash", tipo] });
      qc.invalidateQueries({ queryKey: [tipo] });
      toast.success("Restaurado");
    },
    onError: () => toast.error("Erro ao restaurar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trashService.deletePermanently(tipo, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash", tipo] });
      toast.success("Apagado permanentemente");
    },
    onError: () => toast.error("Erro ao apagar"),
  });

  function handleDelete(id: string, label: string) {
    if (!confirm(`Apagar permanentemente "${label}"?\n\nEsta acção NÃO pode ser revertida.`)) return;
    if (!confirm(`Tem a certeza absoluta? Esta é a última confirmação.`)) return;
    deleteMutation.mutate(id);
  }

  if (!permsLoading && !podeVer) return null;

  function renderRow(item: TrashItem) {
    let primary = "";
    let secondary = "";
    if (tipo === "fornecedores") {
      primary = (item.nome as string) || "—";
      secondary = `NIF ${item.nif || "—"}${item.telefone ? ` · ${item.telefone}` : ""}`;
    } else if (tipo === "conceitos") {
      primary = (item.nome as string) || "—";
      secondary = (item.descricao as string) || "—";
    } else {
      primary = (item.codigo as string) || `Mov ${item.id.slice(0, 8)}`;
      secondary = `${item.tipo_movimento} · ${formatCurrency(item.valor as number)} · ${(item.data as string)?.slice(0, 10)}`;
    }
    return (
      <tr key={item.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-ink-ghost/20">
        <td className="px-4 py-3">
          <p className="font-medium text-ink dark:text-white">{primary}</p>
          <p className="text-xs text-ink-mid/70">{secondary}</p>
        </td>
        <td className="px-4 py-3 text-ink-mid/70 text-sm whitespace-nowrap">{formatDateTime(item.deleted_at)}</td>
        <td className="px-4 py-3 text-right">
          <div className="inline-flex gap-2">
            <button
              onClick={() => restoreMutation.mutate(item.id)}
              disabled={restoreMutation.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Restaurar
            </button>
            <button
              onClick={() => handleDelete(item.id, primary)}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-danger/8 hover:bg-danger/10 text-danger dark:bg-red-900/30 dark:text-red-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Apagar
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-danger/10 dark:bg-red-900/30">
          <Trash2 className="h-5 w-5 text-danger" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Lixeira</h1>
          <p className="text-ink-mid/70 text-sm">Restaurar ou apagar permanentemente registos eliminados</p>
        </div>
      </div>

      <div className="bg-amber/8 dark:bg-amber/10 border border-amber/30 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-amber flex-shrink-0 mt-0.5" />
        <p className="text-amber dark:text-amber-300">
          <strong>Apagar permanentemente é irreversível.</strong> Os dados ficarão perdidos. Use "Restaurar" sempre que possível.
        </p>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        <div className="flex border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          {TABS.map((t) => (
            <button
              key={t.tipo}
              onClick={() => setTipo(t.tipo)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                tipo === t.tipo
                  ? "border-b-2 border-ink text-ink"
                  : "text-ink-mid/70 hover:text-ink dark:hover:text-white"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50 animate-pulse">A carregar...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-ink-mid/50 text-sm">
            <Trash2 className="h-10 w-10 mx-auto mb-3 text-ink-mid/50" />
            Lixeira vazia para {TABS.find((t) => t.tipo === tipo)?.label.toLowerCase()}.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Registo</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase whitespace-nowrap">Apagado em</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Acções</th>
              </tr>
            </thead>
            <tbody>{items.map(renderRow)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
