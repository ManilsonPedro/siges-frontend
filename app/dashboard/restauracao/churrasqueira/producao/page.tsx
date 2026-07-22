"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restauracaoChurrasqueiraService } from "@/shared/services/restauracao.service";
import { toast } from "sonner";
import { ChefHat, Loader2, ArrowRight } from "lucide-react";

const ESTADO_LABEL: Record<string, string> = { fila: "Na Fila", em_preparacao: "Em Preparação", pronto: "Pronto" };
const ESTADO_COLOR: Record<string, string> = {
  fila: "bg-surface text-ink-mid", em_preparacao: "bg-amber-100 text-amber-700", pronto: "bg-live-dim text-live",
};

export default function ProducaoPage() {
  const qc = useQueryClient();
  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ["kds"], queryFn: restauracaoChurrasqueiraService.listKds,
    refetchInterval: 5000,
  });

  const avancarMut = useMutation({
    mutationFn: (id: string) => restauracaoChurrasqueiraService.avancarEstado(id),
    onSuccess: () => { toast.success("Estado actualizado"); qc.invalidateQueries({ queryKey: ["kds"] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ChefHat className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Fila de Produção (KDS)</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && pedidos.length === 0 && <p className="col-span-3 text-center text-ink-mid/70 py-8">Nenhum pedido em produção</p>}
        {pedidos.map((p) => (
          <div key={p.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{p.estacao_producao || "Estação geral"}</span>
              <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[p.estado]}`}>{ESTADO_LABEL[p.estado]}</span>
            </div>
            <p className="text-xs text-ink-mid/70">{new Date(p.criado_em).toLocaleTimeString("pt-PT")}</p>
            {p.estado !== "pronto" && (
              <button onClick={() => avancarMut.mutate(p.id)} className="mt-3 inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-ink text-white rounded-lg hover:bg-ink/90">
                Avançar <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
