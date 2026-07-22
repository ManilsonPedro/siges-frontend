"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rhService, rhAvaliacaoService } from "@/shared/services/rh.service";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Plus, X, Loader2 } from "lucide-react";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AvaliacoesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ colaborador_id: "", periodo: "", nota_geral: 4, pontos_fortes: "", pontos_melhorar: "" });

  const { data: colaboradores = [] } = useQuery({ queryKey: ["colaboradores"], queryFn: () => rhService.listColaboradores() });
  const { data: avaliacoes = [], isLoading } = useQuery({ queryKey: ["avaliacoes-rh"], queryFn: () => rhAvaliacaoService.listAvaliacoes() });

  const createMut = useMutation({
    mutationFn: () => rhAvaliacaoService.createAvaliacao(form),
    onSuccess: () => { toast.success("Avaliação registada"); qc.invalidateQueries({ queryKey: ["avaliacoes-rh"] }); setShowForm(false); },
  });

  function colaboradorNome(id: string) { return colaboradores.find((c) => c.id === id)?.nome || id; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Avaliações de Desempenho</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova avaliação
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Colaborador</th><th className="px-4 py-3">Período</th><th className="px-4 py-3">Nota</th><th className="px-4 py-3">Pontos Fortes</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && avaliacoes.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhuma avaliação</td></tr>}
            {avaliacoes.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-sm">{colaboradorNome(a.colaborador_id)}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{a.periodo}</td>
                <td className="px-4 py-3 text-sm font-semibold">{a.nota_geral} / 5</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{a.pontos_fortes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova avaliação">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Colaborador *</label>
            <select value={form.colaborador_id} onChange={(e) => setForm({ ...form, colaborador_id: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>{colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Período *</label><input value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} required placeholder="2026-Q3" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div>
            <label className="block text-sm font-medium mb-2">Nota (1-5)</label>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setForm({ ...form, nota_geral: n })}>
                <Star className={`h-6 w-6 ${n <= form.nota_geral ? "fill-amber-400 text-amber-400" : "text-ink-ghost"}`} />
              </button>
            ))}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Pontos fortes</label><textarea value={form.pontos_fortes} onChange={(e) => setForm({ ...form, pontos_fortes: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">A melhorar</label><textarea value={form.pontos_melhorar} onChange={(e) => setForm({ ...form, pontos_melhorar: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
