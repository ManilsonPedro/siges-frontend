"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restauracaoRestauranteService, restauracaoBaseService } from "@/shared/services/restauracao.service";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Plus, X, Loader2 } from "lucide-react";

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
  confirmada: "bg-ink/10 text-ink", cancelada: "bg-danger/10 text-danger", concluida: "bg-live-dim text-live", no_show: "bg-amber-100 text-amber-700",
};

export default function ReservasPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mesa_id: "", nome_cliente: "", data_hora: "", numero_pessoas: 2 });

  const { data: mesas = [] } = useQuery({ queryKey: ["mesas"], queryFn: restauracaoBaseService.listMesas });
  const { data: reservas = [], isLoading } = useQuery({ queryKey: ["reservas"], queryFn: restauracaoRestauranteService.listReservas });

  const createMut = useMutation({
    mutationFn: () => restauracaoRestauranteService.createReserva({ ...form, mesa_id: form.mesa_id || undefined, data_hora: new Date(form.data_hora).toISOString() }),
    onSuccess: () => { toast.success("Reserva criada"); qc.invalidateQueries({ queryKey: ["reservas"] }); setShowForm(false); },
  });
  const updateMut = useMutation({
    mutationFn: (vars: { id: string; estado: string }) => restauracaoRestauranteService.updateReserva(vars.id, vars.estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reservas"] }); },
  });

  function mesaNumero(id?: string | null) { return mesas.find((m) => m.id === id)?.numero; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Reservas</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova reserva
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Mesa</th><th className="px-4 py-3">Data/Hora</th><th className="px-4 py-3">Pessoas</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && reservas.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-mid/70">Nenhuma reserva</td></tr>}
            {reservas.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-sm">{r.nome_cliente || "—"}</td>
                <td className="px-4 py-3 text-sm">{mesaNumero(r.mesa_id) || "—"}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(r.data_hora).toLocaleString("pt-PT")}</td>
                <td className="px-4 py-3 text-sm">{r.numero_pessoas}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[r.estado]}`}>{r.estado}</span></td>
                <td className="px-4 py-3 text-right">
                  {r.estado === "confirmada" && (
                    <button onClick={() => updateMut.mutate({ id: r.id, estado: "concluida" })} className="text-xs px-2 py-1 border rounded-lg hover:bg-surface">Concluir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova reserva">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nome do cliente</label>
            <input value={form.nome_cliente} onChange={(e) => setForm({ ...form, nome_cliente: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Mesa</label>
            <select value={form.mesa_id} onChange={(e) => setForm({ ...form, mesa_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">A definir</option>{mesas.map((m) => <option key={m.id} value={m.id}>Mesa {m.numero}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Data/Hora *</label>
            <input type="datetime-local" value={form.data_hora} onChange={(e) => setForm({ ...form, data_hora: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Nº pessoas</label>
            <input type="number" min={1} value={form.numero_pessoas} onChange={(e) => setForm({ ...form, numero_pessoas: parseInt(e.target.value) || 1 })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
