"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesLavagemService } from "@/shared/services/operacoes.service";
import { userService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, X, Loader2 } from "lucide-react";

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

export default function EquipasLavagemPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", membro_user_ids: [] as string[] });

  const { data: equipas = [], isLoading } = useQuery({ queryKey: ["lavagem-equipas"], queryFn: operacoesLavagemService.listEquipas });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: userService.list });

  const createMut = useMutation({
    mutationFn: () => operacoesLavagemService.createEquipa(form),
    onSuccess: () => {
      toast.success("Equipa criada");
      qc.invalidateQueries({ queryKey: ["lavagem-equipas"] });
      setShowForm(false);
      setForm({ nome: "", membro_user_ids: [] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => operacoesLavagemService.deleteEquipa(id),
    onSuccess: () => { toast.success("Equipa eliminada"); qc.invalidateQueries({ queryKey: ["lavagem-equipas"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  function nomeUser(id: string) { return users.find((u) => u.id === id)?.full_name || id; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Equipas de Lavagem</h1>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova equipa
        </button>
      </div>

      <p className="text-sm text-ink-mid/70">
        Equipas fixas atribuídas a boxes por turno (ver Escalas). A atribuição de equipa a uma ordem de lavagem
        é automática, com base na escala do turno corrente — nunca escolhida manualmente por ordem.
      </p>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Membros</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && equipas.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhuma equipa</td></tr>}
            {equipas.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 text-sm font-medium">{e.nome}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{e.membro_user_ids.map(nomeUser).join(", ") || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${e.activo ? "bg-live-dim text-live" : "bg-surface text-ink-mid"}`}>
                    {e.activo ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => confirm(`Eliminar equipa "${e.nome}"?`) && deleteMut.mutate(e.id)}
                    className="p-2 text-ink-mid/70 hover:text-danger"><X className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova equipa">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Membros</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.membro_user_ids.includes(u.id)}
                    onChange={(ev) => setForm({
                      ...form,
                      membro_user_ids: ev.target.checked
                        ? [...form.membro_user_ids, u.id]
                        : form.membro_user_ids.filter((id) => id !== u.id),
                    })} />
                  {u.full_name}
                </label>
              ))}
            </div>
          </div>
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
