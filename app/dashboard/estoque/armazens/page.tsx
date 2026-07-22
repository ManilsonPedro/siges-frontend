"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { armazemService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Warehouse } from "lucide-react";
import type { Armazem, CreateArmazemDTO } from "@/shared/types";

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

export default function ArmazensPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Armazem | null>(null);
  const [form, setForm] = useState<CreateArmazemDTO>({ codigo: "", nome: "", morada: "", activo: true });

  const { data: armazens = [], isLoading } = useQuery({
    queryKey: ["armazens"],
    queryFn: armazemService.list,
  });

  const createMut = useMutation({
    mutationFn: (dto: CreateArmazemDTO) => editing ? armazemService.update(editing.id, dto) : armazemService.create(dto),
    onSuccess: () => {
      toast.success(editing ? "Armazém actualizado" : "Armazém criado");
      qc.invalidateQueries({ queryKey: ["armazens"] });
      setShowForm(false); setEditing(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => armazemService.delete(id),
    onSuccess: () => { toast.success("Armazém eliminado"); qc.invalidateQueries({ queryKey: ["armazens"] }); },
  });

  function openCreate() {
    setEditing(null);
    setForm({ codigo: "", nome: "", morada: "", activo: true });
    setShowForm(true);
  }
  function openEdit(a: Armazem) {
    setEditing(a);
    setForm({ codigo: a.codigo, nome: a.nome, morada: a.morada || "", activo: a.activo });
    setShowForm(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Warehouse className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Armazéns</h1>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo armazém
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Morada</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && armazens.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhum armazém</td></tr>}
            {armazens.map((a) => (
              <tr key={a.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 font-mono text-sm">{a.codigo}</td>
                <td className="px-4 py-3">{a.nome}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{a.morada || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${a.activo ? "bg-live-dim text-live" : "bg-surface text-ink-mid"}`}>
                    {a.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(a)} className="p-2 text-ink-mid/70 hover:text-ink"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm(`Eliminar "${a.nome}"?`) && deleteMut.mutate(a.id)} className="p-2 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar armazém" : "Novo armazém"}>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Código *</label>
            <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Morada</label>
            <textarea value={form.morada || ""} onChange={(e) => setForm({ ...form, morada: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.activo ?? true} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            <span className="text-sm">Activo</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
