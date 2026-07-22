"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmService } from "@/shared/services/crm.service";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, X, Loader2, CheckCircle2 } from "lucide-react";

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
  agendada: "bg-ink/10 text-ink", realizada: "bg-live-dim text-live", cancelada: "bg-danger/10 text-danger",
};

export default function VisitasPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ data_hora: "", tipo: "presencial", notas: "" });

  const { data: visitas = [], isLoading } = useQuery({ queryKey: ["visitas"], queryFn: crmService.listVisitas });

  const createMut = useMutation({
    mutationFn: () => crmService.createVisita({ ...form, data_hora: new Date(form.data_hora).toISOString() }),
    onSuccess: () => { toast.success("Visita agendada"); qc.invalidateQueries({ queryKey: ["visitas"] }); setShowForm(false); },
  });
  const updateMut = useMutation({
    mutationFn: (vars: { id: string; estado: string }) => crmService.updateVisita(vars.id, { estado: vars.estado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitas"] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Visitas</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova visita
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Data/Hora</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && visitas.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhuma visita</td></tr>}
            {visitas.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3 text-sm">{new Date(v.data_hora).toLocaleString("pt-PT")}</td>
                <td className="px-4 py-3 text-sm capitalize">{v.tipo}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[v.estado]}`}>{v.estado}</span></td>
                <td className="px-4 py-3 text-right">
                  {v.estado === "agendada" && (
                    <button onClick={() => updateMut.mutate({ id: v.id, estado: "realizada" })} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova visita">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Data/Hora *</label><input type="datetime-local" value={form.data_hora} onChange={(e) => setForm({ ...form, data_hora: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="presencial">Presencial</option><option value="remota">Remota</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Notas</label><textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
