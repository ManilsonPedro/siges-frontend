"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmService } from "@/shared/services/crm.service";
import { useState } from "react";
import { toast } from "sonner";
import { TrendingUp, Plus, X, Loader2 } from "lucide-react";

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

export default function OportunidadesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [motivoPerda, setMotivoPerda] = useState<{ id: string } | null>(null);
  const [motivo, setMotivo] = useState("");
  const [form, setForm] = useState({ titulo: "", valor_estimado: 0, probabilidade_pct: 50, etapa_pipeline_id: "" });

  const { data: etapas = [] } = useQuery({ queryKey: ["pipeline-etapas"], queryFn: crmService.listEtapas });
  const { data: oportunidades = [], isLoading } = useQuery({ queryKey: ["oportunidades"], queryFn: () => crmService.listOportunidades() });

  const createMut = useMutation({
    mutationFn: () => crmService.createOportunidade(form),
    onSuccess: () => { toast.success("Oportunidade criada"); qc.invalidateQueries({ queryKey: ["oportunidades"] }); setShowForm(false); },
  });
  const ganharMut = useMutation({
    mutationFn: (id: string) => crmService.ganharOportunidade(id),
    onSuccess: () => { toast.success("Oportunidade ganha!"); qc.invalidateQueries({ queryKey: ["oportunidades"] }); },
  });
  const perderMut = useMutation({
    mutationFn: () => crmService.perderOportunidade(motivoPerda!.id, motivo),
    onSuccess: () => { toast.success("Oportunidade marcada como perdida"); qc.invalidateQueries({ queryKey: ["oportunidades"] }); setMotivoPerda(null); setMotivo(""); },
  });

  function etapaNome(id: string) { return etapas.find((e) => e.id === id)?.nome || id; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Oportunidades</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova oportunidade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && oportunidades.length === 0 && <p className="col-span-2 text-center text-ink-mid/70 py-8">Nenhuma oportunidade</p>}
        {oportunidades.map((o) => (
          <div key={o.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{o.titulo}</p>
              <span className={`text-xs px-2 py-1 rounded ${o.estado === "ganha" ? "bg-live-dim text-live" : o.estado === "perdida" ? "bg-danger/10 text-danger" : "bg-ink/10 text-ink"}`}>{o.estado}</span>
            </div>
            <p className="text-sm text-ink-mid mt-1">{etapaNome(o.etapa_pipeline_id)} · {o.probabilidade_pct}% prob.</p>
            <p className="font-bold mt-1">{o.valor_estimado.toLocaleString("pt-AO")} Kz</p>
            {o.estado === "aberta" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => ganharMut.mutate(o.id)} className="text-xs px-3 py-1.5 bg-live text-white rounded-lg hover:bg-live/90">Ganhar</button>
                <button onClick={() => setMotivoPerda({ id: o.id })} className="text-xs px-3 py-1.5 border border-danger text-danger rounded-lg hover:bg-danger/10">Perder</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova oportunidade">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Título *</label><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Etapa *</label>
            <select value={form.etapa_pipeline_id} onChange={(e) => setForm({ ...form, etapa_pipeline_id: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>{etapas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Valor estimado (Kz)</label><input type="number" min={0} value={form.valor_estimado} onChange={(e) => setForm({ ...form, valor_estimado: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Probabilidade (%)</label><input type="number" min={0} max={100} value={form.probabilidade_pct} onChange={(e) => setForm({ ...form, probabilidade_pct: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!motivoPerda} onClose={() => setMotivoPerda(null)} title="Motivo da perda">
        <form onSubmit={(e) => { e.preventDefault(); perderMut.mutate(); }} className="space-y-4">
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setMotivoPerda(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={perderMut.isPending} className="px-4 py-2 bg-danger text-white rounded-lg disabled:opacity-50">{perderMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
