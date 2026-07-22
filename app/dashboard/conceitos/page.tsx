"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conceitoService } from "@/shared/services/financeiro.service";
import { formatDate, estadoBadgeColor } from "@/shared/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import type { Conceito, CreateConceitoDTO } from "@/shared/types";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { usePermissions } from "@/shared/hooks/use-permissions";

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  descricao: z.string().optional(),
  estado: z.enum(["ativo", "inativo"]),
});

type FormData = z.infer<typeof schema>;

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

export default function ConceITosPage() {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const podeEditar = has("conceitos.editar");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Conceito | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conceito | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["conceitos"], queryFn: conceitoService.list });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { estado: "ativo" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateConceitoDTO) => conceitoService.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conceitos"] }); toast.success("Conceito criado"); closeModal(); },
    onError: () => toast.error("Erro ao criar conceito"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateConceitoDTO> }) => conceitoService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conceitos"] }); toast.success("Conceito actualizado"); closeModal(); },
    onError: () => toast.error("Erro ao actualizar conceito"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => conceitoService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conceitos"] }); toast.success("Conceito eliminado"); },
    onError: () => toast.error("Erro ao eliminar conceito"),
  });

  const onSubmit = (d: FormData) => {
    const dto: CreateConceitoDTO = { nome: d.nome, descricao: d.descricao, estado: d.estado };
    editing ? updateMutation.mutate({ id: editing.id, dto }) : createMutation.mutate(dto);
  };

  const openEdit = (c: Conceito) => { setEditing(c); reset({ nome: c.nome, descricao: c.descricao || "", estado: c.estado }); };
  const closeModal = () => { setShowForm(false); setEditing(null); reset({ estado: "ativo" }); };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Conceitos Financeiros</h1>
          <p className="text-ink-mid/70 text-sm">{data.length} conceito(s) registado(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-ink hover:bg-ink/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Novo Conceito
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-ink-mid/50">Nenhum conceito encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-ink-ghost/20">
                  {["Nome", "Descrição", "Estado", "Criado em", "Ações"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-mid/70 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(c => (
                  <tr key={c.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-ink-ghost/20">
                    <td className="px-4 py-3 font-medium text-ink dark:text-white">{c.nome}</td>
                    <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/50">{c.descricao || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadgeColor(c.estado)}`}>{c.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-mid/70">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      {podeEditar && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(c)} className="text-ink hover:text-ink/80 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteTarget(c)} className="text-danger hover:text-danger p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm || !!editing} onClose={closeModal} title={editing ? "Editar Conceito" : "Novo Conceito"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
            <input {...register("nome")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
            {errors.nome && <p className="text-danger text-xs mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea {...register("descricao")} rows={3} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select {...register("estado")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isMutating} className="flex-1 flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
              {isMutating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editing ? "Actualizar" : "Criar"}
            </button>
            <button type="button" onClick={closeModal} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-surface dark:hover:bg-ink-ghost/20">Cancelar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Conceito"
        message={`Tem a certeza que pretende eliminar o conceito "${deleteTarget?.nome}"? Esta acção não pode ser revertida.`}
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
