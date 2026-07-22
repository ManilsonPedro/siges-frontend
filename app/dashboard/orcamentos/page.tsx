"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Target, AlertTriangle, CheckCircle, TrendingUp, Trash2, Plus, X } from "lucide-react";
import { intelligenceService, conceitoService, type Orcamento } from "@/shared/services/financeiro.service";
import { formatCurrency } from "@/shared/utils";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function OrcamentosPage() {
  const qc = useQueryClient();
  const agora = new Date();
  const [ano, setAno] = useState(agora.getFullYear());
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [showModal, setShowModal] = useState(false);
  const [novoConceitoId, setNovoConceitoId] = useState("");
  const [novoValor, setNovoValor] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["orcamentos", ano, mes],
    queryFn: () => intelligenceService.listOrcamentos(ano, mes),
  });

  const { data: conceitos = [] } = useQuery({
    queryKey: ["conceitos"],
    queryFn: () => conceitoService.list(),
  });

  const saveMutation = useMutation({
    mutationFn: () => intelligenceService.saveOrcamento({
      conceito_id: novoConceitoId,
      ano, mes,
      valor_planeado: parseFloat(novoValor),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento guardado");
      setShowModal(false);
      setNovoConceitoId("");
      setNovoValor("");
    },
    onError: () => toast.error("Erro ao guardar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => intelligenceService.deleteOrcamento(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento eliminado");
    },
  });

  const conceitosLivres = conceitos.filter(
    (c) => !data?.items.some((o) => o.conceito_id === c.id)
  );

  function badgeAlerta(o: Orcamento) {
    if (o.alerta === "ultrapassado")
      return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger"><AlertTriangle className="h-3 w-3" /> Ultrapassado</span>;
    if (o.alerta === "perto_limite")
      return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber/15 text-amber"><TrendingUp className="h-3 w-3" /> Próximo limite</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-live"><CheckCircle className="h-3 w-3" /> OK</span>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-white">Orçamentos por Conceito</h1>
            <p className="text-ink-mid/70 text-sm">Limites mensais com alertas automáticos</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={conceitosLivres.length === 0}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Período:</span>
        <select value={mes} onChange={(e) => setMes(+e.target.value)} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-1.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
          {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select value={ano} onChange={(e) => setAno(+e.target.value)} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-1.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
          {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50 animate-pulse">A carregar...</div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center text-ink-mid/50 text-sm">
            <Target className="h-10 w-10 mx-auto mb-3 text-ink-mid/50" />
            Sem orçamentos para {MESES[mes-1]} {ano}. Carregue em "Adicionar" para definir um.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Conceito</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Planeado</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Gasto</th>
                <th className="text-center px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">% Utilizado</th>
                <th className="text-center px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium text-ink dark:text-white">{o.conceito_nome}</td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(o.valor_planeado)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(o.valor_gasto)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            o.alerta === "ultrapassado" ? "bg-danger" : o.alerta === "perto_limite" ? "bg-amber" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(100, o.percentagem)}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-mid dark:text-ink-mid/50 w-12 text-right">{o.percentagem}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{badgeAlerta(o)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm(`Eliminar orçamento de "${o.conceito_nome}"?`)) deleteMutation.mutate(o.id); }}
                      className="text-danger hover:text-danger p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink dark:text-white">Novo orçamento</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-ink-mid/50" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conceito</label>
                <select value={novoConceitoId} onChange={(e) => setNovoConceitoId(e.target.value)}
                  className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
                  <option value="">Seleccione...</option>
                  {conceitosLivres.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor planeado (AOA)</label>
                <input type="number" step="any" min="0" value={novoValor} onChange={(e) => setNovoValor(e.target.value)}
                  className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
              </div>
              <button onClick={() => saveMutation.mutate()} disabled={!novoConceitoId || !novoValor || saveMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm">
                Guardar orçamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
