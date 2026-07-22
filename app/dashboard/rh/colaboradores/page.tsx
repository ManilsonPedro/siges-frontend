"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rhService } from "@/shared/services/rh.service";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, Trash2, X, Loader2 } from "lucide-react";

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

const ESTADO_COLOR: Record<string, string> = {
  ativo: "bg-live-dim text-live", ferias: "bg-amber-100 text-amber-700",
  licenca: "bg-ink/10 text-ink", desligado: "bg-danger/10 text-danger",
};

export default function ColaboradoresPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", cargo: "", departamento_id: "", data_admissao: "", salario_base: 0 });

  const { data: departamentos = [] } = useQuery({ queryKey: ["departamentos"], queryFn: rhService.listDepartamentos });
  const { data: colaboradores = [], isLoading } = useQuery({ queryKey: ["colaboradores"], queryFn: () => rhService.listColaboradores() });

  const createMut = useMutation({
    mutationFn: () => rhService.createColaborador({ ...form, departamento_id: form.departamento_id || undefined, data_admissao: new Date(form.data_admissao).toISOString() }),
    onSuccess: () => { toast.success("Colaborador criado"); qc.invalidateQueries({ queryKey: ["colaboradores"] }); setShowForm(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => rhService.deleteColaborador(id),
    onSuccess: () => { toast.success("Colaborador eliminado"); qc.invalidateQueries({ queryKey: ["colaboradores"] }); },
  });

  function deptoNome(id?: string | null) { return departamentos.find((d) => d.id === id)?.nome || "—"; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Colaboradores</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo colaborador
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Cargo</th><th className="px-4 py-3">Departamento</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && colaboradores.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhum colaborador</td></tr>}
            {colaboradores.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-sm">{c.nome}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{c.cargo || "—"}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{deptoNome(c.departamento_id)}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[c.estado]}`}>{c.estado}</span></td>
                <td className="px-4 py-3 text-right"><button onClick={() => confirm("Eliminar?") && deleteMut.mutate(c.id)} className="p-2 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo colaborador">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Cargo</label><input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Departamento</label>
            <select value={form.departamento_id} onChange={(e) => setForm({ ...form, departamento_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Nenhum</option>{departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Data de admissão *</label><input type="date" value={form.data_admissao} onChange={(e) => setForm({ ...form, data_admissao: e.target.value })} required className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Salário base (Kz)</label><input type="number" min={0} value={form.salario_base} onChange={(e) => setForm({ ...form, salario_base: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
