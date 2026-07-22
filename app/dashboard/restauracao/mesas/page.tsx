"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restauracaoBaseService } from "@/shared/services/restauracao.service";
import { useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, Plus, Trash2, X, Loader2 } from "lucide-react";

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
  livre: "bg-live-dim text-live", ocupada: "bg-danger/10 text-danger",
  reservada: "bg-amber-100 text-amber-700", limpeza: "bg-surface text-ink-mid",
};

export default function MesasPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ numero: "", capacidade: 4 });

  const { data: mesas = [], isLoading } = useQuery({ queryKey: ["mesas"], queryFn: restauracaoBaseService.listMesas });

  const createMut = useMutation({
    mutationFn: () => restauracaoBaseService.createMesa(form),
    onSuccess: () => { toast.success("Mesa criada"); qc.invalidateQueries({ queryKey: ["mesas"] }); setShowForm(false); setForm({ numero: "", capacidade: 4 }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => restauracaoBaseService.deleteMesa(id),
    onSuccess: () => { toast.success("Mesa eliminada"); qc.invalidateQueries({ queryKey: ["mesas"] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Mesas</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova mesa
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && mesas.length === 0 && <p className="col-span-6 text-center text-ink-mid/70 py-8">Nenhuma mesa</p>}
        {mesas.map((m) => (
          <div key={m.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4 text-center relative group">
            <p className="text-2xl font-bold">{m.numero}</p>
            <p className="text-xs text-ink-mid">{m.capacidade} lugares</p>
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${ESTADO_COLOR[m.estado]}`}>{m.estado}</span>
            <button onClick={() => confirm("Eliminar mesa?") && deleteMut.mutate(m.id)}
              className="absolute top-1 right-1 p-1 text-ink-mid/50 hover:text-danger opacity-0 group-hover:opacity-100">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova mesa">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Número *</label>
            <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Capacidade</label>
            <input type="number" min={1} value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: parseInt(e.target.value) || 4 })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
