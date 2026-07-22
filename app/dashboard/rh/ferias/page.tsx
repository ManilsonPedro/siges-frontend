"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rhService } from "@/shared/services/rh.service";
import { rhTempoService } from "@/shared/services/rh.service";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Plus, X, Loader2, CheckCircle2, XCircle } from "lucide-react";

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

const ESTADO_COLOR: Record<string, string> = {
  solicitada: "bg-amber-100 text-amber-700", aprovada: "bg-live-dim text-live",
  rejeitada: "bg-danger/10 text-danger", em_curso: "bg-ink/10 text-ink", concluida: "bg-surface text-ink-mid",
};

export default function FeriasPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ colaborador_id: "", data_inicio: "", data_fim: "", dias: 22 });

  const { data: colaboradores = [] } = useQuery({ queryKey: ["colaboradores"], queryFn: () => rhService.listColaboradores() });
  const { data: ferias = [], isLoading } = useQuery({ queryKey: ["ferias"], queryFn: () => rhTempoService.listFerias() });

  const createMut = useMutation({
    mutationFn: () => rhTempoService.createFerias({ ...form, data_inicio: new Date(form.data_inicio).toISOString(), data_fim: new Date(form.data_fim).toISOString() }),
    onSuccess: () => { toast.success("Pedido de férias criado"); qc.invalidateQueries({ queryKey: ["ferias"] }); setShowForm(false); },
  });
  const aprovarMut = useMutation({
    mutationFn: (id: string) => rhTempoService.aprovarFerias(id),
    onSuccess: () => { toast.success("Aprovado"); qc.invalidateQueries({ queryKey: ["ferias"] }); },
  });
  const rejeitarMut = useMutation({
    mutationFn: (id: string) => rhTempoService.rejeitarFerias(id, "Rejeitado pelo gestor"),
    onSuccess: () => { toast.success("Rejeitado"); qc.invalidateQueries({ queryKey: ["ferias"] }); },
  });

  function colaboradorNome(id: string) { return colaboradores.find((c) => c.id === id)?.nome || id; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Férias</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Solicitar férias
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Colaborador</th><th className="px-4 py-3">Período</th><th className="px-4 py-3">Dias</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && ferias.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhum pedido de férias</td></tr>}
            {ferias.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 text-sm">{colaboradorNome(f.colaborador_id)}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(f.data_inicio).toLocaleDateString("pt-PT")} — {new Date(f.data_fim).toLocaleDateString("pt-PT")}</td>
                <td className="px-4 py-3 text-sm">{f.dias}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[f.estado]}`}>{f.estado}</span></td>
                <td className="px-4 py-3 text-right space-x-1">
                  {f.estado === "solicitada" && (
                    <>
                      <button onClick={() => aprovarMut.mutate(f.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-live text-white rounded-lg"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => rejeitarMut.mutate(f.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-danger text-danger rounded-lg"><XCircle className="h-3.5 w-3.5" /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Solicitar férias">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Colaborador *</label>
            <select value={form.colaborador_id} onChange={(e) => setForm({ ...form, colaborador_id: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>{colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Início</label><input type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} required className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Fim</label><input type="date" value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} required className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Dias</label><input type="number" min={1} value={form.dias} onChange={(e) => setForm({ ...form, dias: parseInt(e.target.value) || 1 })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
