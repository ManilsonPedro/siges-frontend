"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rhService, rhTempoService } from "@/shared/services/rh.service";
import { useState } from "react";
import { toast } from "sonner";
import { UserX, Plus, X, Loader2 } from "lucide-react";

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

export default function FaltasPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ colaborador_id: "", data: "", tipo: "justificada", motivo: "" });

  const { data: colaboradores = [] } = useQuery({ queryKey: ["colaboradores"], queryFn: () => rhService.listColaboradores() });
  const { data: faltas = [], isLoading } = useQuery({ queryKey: ["faltas"], queryFn: () => rhTempoService.listFaltas() });

  const createMut = useMutation({
    mutationFn: () => rhTempoService.createFalta({ ...form, data: new Date(form.data).toISOString() }),
    onSuccess: () => { toast.success("Falta registada"); qc.invalidateQueries({ queryKey: ["faltas"] }); setShowForm(false); },
  });

  function colaboradorNome(id: string) { return colaboradores.find((c) => c.id === id)?.nome || id; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserX className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Faltas</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Registar falta
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Colaborador</th><th className="px-4 py-3">Data</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Motivo</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && faltas.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhuma falta registada</td></tr>}
            {faltas.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 text-sm">{colaboradorNome(f.colaborador_id)}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(f.data).toLocaleDateString("pt-PT")}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${f.tipo === "justificada" ? "bg-live-dim text-live" : "bg-danger/10 text-danger"}`}>{f.tipo}</span></td>
                <td className="px-4 py-3 text-sm text-ink-mid">{f.motivo || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Registar falta">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Colaborador *</label>
            <select value={form.colaborador_id} onChange={(e) => setForm({ ...form, colaborador_id: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>{colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Data *</label><input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="justificada">Justificada</option><option value="injustificada">Injustificada</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Motivo</label><input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
