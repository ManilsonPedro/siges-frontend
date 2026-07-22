"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmService } from "@/shared/services/crm.service";
import { useState } from "react";
import { toast } from "sonner";
import { CheckSquare, Plus, X, Loader2 } from "lucide-react";

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

const PRIORIDADE_COLOR: Record<string, string> = { alta: "text-danger", media: "text-amber-600", baixa: "text-ink-mid" };

export default function TarefasPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", tipo: "followup", prazo: "", prioridade: "media" });

  const { data: tarefas = [], isLoading } = useQuery({ queryKey: ["tarefas"], queryFn: () => crmService.listTarefas() });

  const createMut = useMutation({
    mutationFn: () => crmService.createTarefa({ ...form, prazo: form.prazo ? new Date(form.prazo).toISOString() : undefined }),
    onSuccess: () => { toast.success("Tarefa criada"); qc.invalidateQueries({ queryKey: ["tarefas"] }); setShowForm(false); },
  });
  const concluirMut = useMutation({
    mutationFn: (id: string) => crmService.updateTarefa(id, "concluida"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tarefas"] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Tarefas</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova tarefa
        </button>
      </div>

      <div className="space-y-2">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && tarefas.length === 0 && <p className="text-center text-ink-mid/70 py-8">Nenhuma tarefa</p>}
        {tarefas.map((t) => (
          <div key={t.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={t.estado === "concluida"} onChange={() => t.estado === "pendente" && concluirMut.mutate(t.id)} />
              <div>
                <p className={t.estado === "concluida" ? "line-through text-ink-mid" : ""}>{t.titulo}</p>
                <p className="text-xs text-ink-mid/70">{t.prazo ? new Date(t.prazo).toLocaleDateString("pt-PT") : "Sem prazo"} · <span className={PRIORIDADE_COLOR[t.prioridade]}>{t.prioridade}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova tarefa">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Título *</label><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="chamada">Chamada</option><option value="email">Email</option><option value="reuniao">Reunião</option><option value="followup">Follow-up</option>
              </select></div>
            <div><label className="block text-xs mb-1">Prioridade</label>
              <select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Prazo</label><input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
