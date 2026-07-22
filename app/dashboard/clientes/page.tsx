"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteService } from "@/shared/services/financeiro.service";
import { formatDate, estadoBadgeColor } from "@/shared/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, ArrowLeftRight } from "lucide-react";
import type { Cliente, CreateClienteDTO } from "@/shared/types";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { usePermissions } from "@/shared/hooks/use-permissions";

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  nif: z.string().min(5, "NIF deve ter no mínimo 5 caracteres"),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().optional(),
  estado: z.enum(["ativo", "inativo", "suspenso"]),
});

type FormData = z.infer<typeof schema>;

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

export default function ClientesPage() {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const podeEditar = has("clientes.editar");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["clientes"], queryFn: clienteService.list });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { estado: "ativo" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateClienteDTO) => clienteService.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clientes"] }); toast.success("Cliente criado"); closeModal(); },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao criar cliente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateClienteDTO> }) => clienteService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clientes"] }); toast.success("Cliente actualizado"); closeModal(); },
    onError: () => toast.error("Erro ao actualizar cliente"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clienteService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clientes"] }); toast.success("Cliente eliminado"); },
    onError: () => toast.error("Erro ao eliminar cliente"),
  });

  const tornarFornecMutation = useMutation({
    mutationFn: (id: string) => clienteService.tornarFornecedor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Cliente vinculado a Fornecedor");
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao vincular");
    },
  });

  const onSubmit = (formData: FormData) => {
    const dto: CreateClienteDTO = {
      nome: formData.nome, nif: formData.nif,
      telefone: formData.telefone || undefined,
      email: formData.email || undefined,
      endereco: formData.endereco || undefined,
      estado: formData.estado,
    };
    if (editing) updateMutation.mutate({ id: editing.id, dto });
    else createMutation.mutate(dto);
  };

  const openEdit = (c: Cliente) => {
    setEditing(c);
    reset({
      nome: c.nome, nif: c.nif,
      telefone: c.telefone || "",
      email: c.email || "",
      endereco: c.endereco || "",
      estado: c.estado,
    });
  };
  const closeModal = () => { setShowForm(false); setEditing(null); reset({ estado: "ativo" }); };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const FormFields = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {[
        { name: "nome" as const, label: "Nome *" },
        { name: "nif" as const, label: "NIF *" },
        { name: "telefone" as const, label: "Telefone" },
        { name: "email" as const, label: "Email" },
        { name: "endereco" as const, label: "Endereço" },
      ].map(({ name, label }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
          <input {...register(name)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
          {errors[name] && <p className="text-danger text-xs mt-1">{errors[name]?.message}</p>}
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
        <select {...register("estado")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white">
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="suspenso">Suspenso</option>
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={isMutating} className="flex-1 flex items-center justify-center gap-2 bg-live hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
          {isMutating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {editing ? "Actualizar" : "Criar"}
        </button>
        <button type="button" onClick={closeModal} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-surface dark:hover:bg-ink-ghost/20">Cancelar</button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Clientes</h1>
          <p className="text-ink-mid/70 text-sm">{data.length} cliente(s) registado(s) · associados a Entradas (receita)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-live hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-ink-mid/50">Nenhum cliente encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-gray-800/50">
                  {["Nome", "NIF", "Telefone", "Email", "Estado", "Criado em", "Ações"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium text-ink dark:text-white">
                      {c.nome}
                      {c.fornecedor_id && <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-ink">↔ Fornecedor</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/60">{c.nif}</td>
                    <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/60">{c.telefone || "—"}</td>
                    <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/60">{c.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadgeColor(c.estado)}`}>{c.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-mid/70">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!c.fornecedor_id && (
                          <button
                            onClick={() => { if (confirm(`Criar Fornecedor vinculado a "${c.nome}"?`)) tornarFornecMutation.mutate(c.id); }}
                            disabled={tornarFornecMutation.isPending}
                            className="text-ink hover:text-ink/80 p-1 rounded disabled:opacity-50"
                            title="Tratar também como Fornecedor"
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {podeEditar && (
                          <>
                            <button onClick={() => openEdit(c)} className="text-live hover:text-emerald-800 p-1 rounded">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget(c)} className="text-danger hover:text-red-700 p-1 rounded">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm || !!editing} onClose={closeModal} title={editing ? "Editar Cliente" : "Novo Cliente"}>
        <FormFields />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Cliente"
        message={`Tem a certeza que pretende eliminar o cliente "${deleteTarget?.nome}"? Esta acção não pode ser revertida.`}
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
