"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restauracaoBarService } from "@/shared/services/restauracao.service";
import { useState } from "react";
import { toast } from "sonner";
import { Beer, Plus, Trash2, X, Loader2 } from "lucide-react";

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

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function HappyHourPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dia_semana: 5, hora_inicio: "17:00", hora_fim: "19:00", desconto_pct: 20 });

  const { data: happyHours = [], isLoading } = useQuery({ queryKey: ["happy-hour"], queryFn: restauracaoBarService.listHappyHour });

  const createMut = useMutation({
    mutationFn: () => restauracaoBarService.createHappyHour(form),
    onSuccess: () => { toast.success("Happy Hour criado"); qc.invalidateQueries({ queryKey: ["happy-hour"] }); setShowForm(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => restauracaoBarService.deleteHappyHour(id),
    onSuccess: () => { toast.success("Happy Hour eliminado"); qc.invalidateQueries({ queryKey: ["happy-hour"] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Beer className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Happy Hour</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Dia</th><th className="px-4 py-3">Período</th><th className="px-4 py-3">Desconto</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && happyHours.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhum Happy Hour</td></tr>}
            {happyHours.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-3 text-sm">{DIAS[h.dia_semana]}</td>
                <td className="px-4 py-3 text-sm">{h.hora_inicio} — {h.hora_fim}</td>
                <td className="px-4 py-3 text-sm">{h.desconto_pct}%</td>
                <td className="px-4 py-3 text-right"><button onClick={() => confirm("Eliminar?") && deleteMut.mutate(h.id)} className="p-2 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo Happy Hour">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Dia da semana</label>
            <select value={form.dia_semana} onChange={(e) => setForm({ ...form, dia_semana: parseInt(e.target.value) })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Início</label><input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Fim</label><input type="time" value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Desconto (%)</label>
            <input type="number" min={1} max={100} value={form.desconto_pct} onChange={(e) => setForm({ ...form, desconto_pct: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
