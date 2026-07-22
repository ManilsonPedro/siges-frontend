"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalidadeService } from "@/shared/services/financeiro2.service";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Plus, X, Loader2, CheckCircle2 } from "lucide-react";

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

export default function ObrigacoesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", prazo: "", recorrencia: "mensal" });

  const { data: obrigacoes = [], isLoading } = useQuery({ queryKey: ["obrigacoes"], queryFn: fiscalidadeService.listObrigacoes });

  const createMut = useMutation({
    mutationFn: () => fiscalidadeService.createObrigacao({ ...form, prazo: new Date(form.prazo).toISOString() }),
    onSuccess: () => { toast.success("Obrigação criada"); qc.invalidateQueries({ queryKey: ["obrigacoes"] }); setShowForm(false); },
  });
  const cumprirMut = useMutation({
    mutationFn: (id: string) => fiscalidadeService.cumprirObrigacao(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["obrigacoes"] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Obrigações Fiscais</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Prazo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && obrigacoes.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhuma obrigação</td></tr>}
            {obrigacoes.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 text-sm">{o.nome}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(o.prazo).toLocaleDateString("pt-PT")}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${o.estado === "cumprida" ? "bg-live-dim text-live" : "bg-amber-100 text-amber-700"}`}>{o.estado}</span></td>
                <td className="px-4 py-3 text-right">
                  {o.estado === "pendente" && (
                    <button onClick={() => cumprirMut.mutate(o.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Cumprir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova obrigação">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Prazo *</label><input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Recorrência</label>
            <select value={form.recorrencia} onChange={(e) => setForm({ ...form, recorrencia: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="mensal">Mensal</option><option value="trimestral">Trimestral</option><option value="anual">Anual</option><option value="unica">Única</option>
            </select></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
