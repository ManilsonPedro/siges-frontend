"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fornecedorService, fornecedorAvaliacaoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Loader2, Plus, FileText, Trash2 } from "lucide-react";

export default function AvaliacaoFornecedoresPage() {
  const qc = useQueryClient();
  const [fornecedorId, setFornecedorId] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [notaPrazo, setNotaPrazo] = useState(3);
  const [notaQualidade, setNotaQualidade] = useState(3);
  const [notaPreco, setNotaPreco] = useState(3);
  const [observacoes, setObservacoes] = useState("");

  const { data: fornecedores = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: fornecedorService.list });
  const { data: avaliacoes = [], isLoading } = useQuery({
    queryKey: ["fornecedor-avaliacoes", fornecedorId],
    queryFn: () => fornecedorAvaliacaoService.listAvaliacoes(fornecedorId),
    enabled: !!fornecedorId,
  });
  const { data: contratos = [] } = useQuery({
    queryKey: ["fornecedor-contratos", fornecedorId],
    queryFn: () => fornecedorAvaliacaoService.listContratos(fornecedorId),
    enabled: !!fornecedorId,
  });

  const avaliarMut = useMutation({
    mutationFn: () => fornecedorAvaliacaoService.createAvaliacao(fornecedorId, {
      periodo, nota_prazo: notaPrazo, nota_qualidade: notaQualidade, nota_preco: notaPreco, observacoes,
    }),
    onSuccess: () => {
      toast.success("Avaliação registada");
      qc.invalidateQueries({ queryKey: ["fornecedor-avaliacoes", fornecedorId] });
      setPeriodo(""); setObservacoes(""); setNotaPrazo(3); setNotaQualidade(3); setNotaPreco(3);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const deleteContratoMut = useMutation({
    mutationFn: (id: string) => fornecedorAvaliacaoService.deleteContrato(id),
    onSuccess: () => { toast.success("Contrato eliminado"); qc.invalidateQueries({ queryKey: ["fornecedor-contratos", fornecedorId] }); },
  });

  function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}>
            <Star className={`h-5 w-5 ${n <= value ? "fill-amber-400 text-amber-400" : "text-ink-ghost"}`} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Avaliação de Fornecedores</h1>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
        <label className="block text-sm font-medium mb-1">Fornecedor</label>
        <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}
          className="w-full max-w-md border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
          <option value="">Seleccionar fornecedor…</option>
          {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </div>

      {fornecedorId && (
        <>
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4 space-y-4">
            <h2 className="font-semibold">Nova avaliação</h2>
            <form onSubmit={(e) => { e.preventDefault(); avaliarMut.mutate(); }} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Período *</label>
                <input value={periodo} onChange={(e) => setPeriodo(e.target.value)} required placeholder="Ex.: 2026-Q3"
                  className="w-full max-w-xs border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
              </div>
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <div>
                  <label className="block text-xs text-ink-mid mb-1">Prazo</label>
                  <StarInput value={notaPrazo} onChange={setNotaPrazo} />
                </div>
                <div>
                  <label className="block text-xs text-ink-mid mb-1">Qualidade</label>
                  <StarInput value={notaQualidade} onChange={setNotaQualidade} />
                </div>
                <div>
                  <label className="block text-xs text-ink-mid mb-1">Preço</label>
                  <StarInput value={notaPreco} onChange={setNotaPreco} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
              </div>
              <button type="submit" disabled={avaliarMut.isPending || !periodo}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
                {avaliarMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Registar avaliação
              </button>
            </form>
          </div>

          <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15 font-semibold">Histórico de avaliações</div>
            <table className="w-full">
              <thead className="bg-surface dark:bg-ink-ghost/20">
                <tr className="text-left text-xs uppercase text-ink-mid/70">
                  <th className="px-4 py-3">Período</th>
                  <th className="px-4 py-3">Prazo</th>
                  <th className="px-4 py-3">Qualidade</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
                {!isLoading && avaliacoes.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink-mid/70">Sem avaliações</td></tr>}
                {avaliacoes.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-sm">{a.periodo}</td>
                    <td className="px-4 py-3 text-sm">{a.nota_prazo} / 5</td>
                    <td className="px-4 py-3 text-sm">{a.nota_qualidade} / 5</td>
                    <td className="px-4 py-3 text-sm">{a.nota_preco} / 5</td>
                    <td className="px-4 py-3 text-sm text-ink-mid">{a.observacoes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15 font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> Contratos
            </div>
            <table className="w-full">
              <thead className="bg-surface dark:bg-ink-ghost/20">
                <tr className="text-left text-xs uppercase text-ink-mid/70">
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Início</th>
                  <th className="px-4 py-3">Fim</th>
                  <th className="px-4 py-3 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                {contratos.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-ink-mid/70">Sem contratos registados</td></tr>}
                {contratos.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-sm">{c.tipo || "—"}</td>
                    <td className="px-4 py-3 text-sm text-ink-mid">{new Date(c.data_inicio).toLocaleDateString("pt-PT")}</td>
                    <td className="px-4 py-3 text-sm text-ink-mid">{c.data_fim ? new Date(c.data_fim).toLocaleDateString("pt-PT") : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => confirm("Eliminar contrato?") && deleteContratoMut.mutate(c.id)} className="p-2 text-ink-mid/70 hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
