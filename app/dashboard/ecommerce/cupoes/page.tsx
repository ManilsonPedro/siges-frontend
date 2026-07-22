"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecommerceService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Ticket, Plus, Trash2, X, Loader2 } from "lucide-react";
import type { CreateCupaoDTO } from "@/shared/types";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_FORM: CreateCupaoDTO = {
  codigo: "", tipo: "percentual", valor: 10,
  validade: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  uso_maximo: 1, activo: true,
};

export default function CupoesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCupaoDTO>(EMPTY_FORM);

  const { data: cupoes = [], isLoading } = useQuery({ queryKey: ["cupoes"], queryFn: ecommerceService.listCupoes });

  const createMut = useMutation({
    mutationFn: (dto: CreateCupaoDTO) => ecommerceService.createCupao({ ...dto, validade: new Date(dto.validade).toISOString() }),
    onSuccess: () => {
      toast.success("Cupão criado");
      qc.invalidateQueries({ queryKey: ["cupoes"] });
      setShowForm(false); setForm(EMPTY_FORM);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => ecommerceService.deleteCupao(id),
    onSuccess: () => { toast.success("Cupão eliminado"); qc.invalidateQueries({ queryKey: ["cupoes"] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ticket className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Cupões de Desconto</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo cupão
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Uso</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && cupoes.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-mid/70">Nenhum cupão</td></tr>}
            {cupoes.map((c) => (
              <tr key={c.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 font-mono text-sm">{c.codigo}</td>
                <td className="px-4 py-3 text-sm">{c.tipo === "percentual" ? `${c.valor}%` : `${c.valor.toLocaleString("pt-AO")} Kz`}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(c.validade).toLocaleDateString("pt-PT")}</td>
                <td className="px-4 py-3 text-sm tabular-nums">{c.uso_atual} / {c.uso_maximo}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${c.activo ? "bg-live-dim text-live" : "bg-surface text-ink-mid"}`}>
                    {c.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => confirm(`Eliminar cupão "${c.codigo}"?`) && deleteMut.mutate(c.id)} className="p-2 text-ink-mid/70 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo cupão">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Código *</label>
            <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} required
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="percentual">Percentual (%)</option>
                <option value="valor_fixo">Valor fixo (Kz)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <input type="number" step="0.01" min={0} value={form.valor} onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Validade</label>
              <input type="date" value={form.validade.slice(0, 10)} onChange={(e) => setForm({ ...form, validade: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Uso máximo</label>
              <input type="number" min={1} value={form.uso_maximo} onChange={(e) => setForm({ ...form, uso_maximo: parseInt(e.target.value) || 1 })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
