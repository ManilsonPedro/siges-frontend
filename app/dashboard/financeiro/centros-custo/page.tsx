"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { centrosCustoService } from "@/shared/services/financeiro2.service";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Plus, Trash2, X, Loader2 } from "lucide-react";

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

export default function CentrosCustoPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ codigo: "", nome: "" });

  const { data: centros = [], isLoading } = useQuery({ queryKey: ["centros-custo"], queryFn: centrosCustoService.list });

  const createMut = useMutation({
    mutationFn: () => centrosCustoService.create(form),
    onSuccess: () => { toast.success("Centro de custo criado"); qc.invalidateQueries({ queryKey: ["centros-custo"] }); setShowForm(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => centrosCustoService.delete(id),
    onSuccess: () => { toast.success("Centro de custo eliminado"); qc.invalidateQueries({ queryKey: ["centros-custo"] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Centros de Custo</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Código</th><th className="px-4 py-3">Nome</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && centros.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-ink-mid/70">Nenhum centro de custo</td></tr>}
            {centros.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono text-sm">{c.codigo}</td>
                <td className="px-4 py-3 text-sm">{c.nome}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => confirm("Eliminar?") && deleteMut.mutate(c.id)} className="p-2 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo centro de custo">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Código *</label><input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
