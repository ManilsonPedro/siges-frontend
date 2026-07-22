"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, permissoesService, usersStatsService } from "@/shared/services/financeiro.service";
import { formatDateTime } from "@/shared/utils";
import { useAuthStore } from "@/shared/store/auth.store";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatDate } from "@/shared/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, KeyRound, ShieldCheck, ShieldOff, Users, Shield, FileText } from "lucide-react";
import type { User, CreateUserDTO, UpdateUserDTO } from "@/shared/types";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { GruposContent } from "./groups-content";
import { PermissionsContent } from "./permissions-content";

const createSchema = z.object({
  full_name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
});

const updateSchema = z.object({
  full_name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  is_active: z.boolean(),
});

const resetSchema = z.object({
  new_password: z.string().min(8, "Mínimo 8 caracteres"),
  confirm: z.string(),
}).refine(d => d.new_password === d.confirm, { message: "Passwords não coincidem", path: ["confirm"] });

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;
type ResetForm = z.infer<typeof resetSchema>;

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 sticky top-0 bg-panel dark:bg-panel">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputCls ="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function UtilizadoresPage() {
  const qc = useQueryClient();
  const { user: me } = useAuthStore();
  const { has } = usePermissions();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.list,
  });

  const { data: grupos = [] } = useQuery({ queryKey: ["grupos"], queryFn: permissoesService.listarGrupos });
  const grupoMap = Object.fromEntries(grupos.map((g) => [g.id, g.nome]));
  const { data: stats } = useQuery({ queryKey: ["users-stats"], queryFn: usersStatsService.stats, refetchInterval: 60000 });
  const { data: listagem = [] } = useQuery({ queryKey: ["users-listagem"], queryFn: usersStatsService.listagem, refetchInterval: 60000 });
  const listagemMap = Object.fromEntries(listagem.map(l => [l.id, l]));

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const updateForm = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const createMut = useMutation({
    mutationFn: (dto: CreateUserDTO) => userService.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Utilizador criado"); setShowCreate(false); createForm.reset(); },
    onError: (e: unknown) => { const err = e as { response?: { data?: { detail?: string } } }; toast.error(err?.response?.data?.detail || "Erro ao criar"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDTO }) => userService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Utilizador actualizado"); setEditing(null); },
    onError: (e: unknown) => { const err = e as { response?: { data?: { detail?: string } } }; toast.error(err?.response?.data?.detail || "Erro ao actualizar"); },
  });

  const resetMut = useMutation({
    mutationFn: ({ id, pwd }: { id: string; pwd: string }) => userService.resetPassword(id, pwd),
    onSuccess: () => { toast.success("Password redefinida"); setResetting(null); resetForm.reset(); },
    onError: () => toast.error("Erro ao redefinir password"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Utilizador desactivado"); },
    onError: () => toast.error("Erro ao desactivar"),
  });

  const openEdit = (u: User) => {
    setEditing(u);
    updateForm.reset({ full_name: u.full_name, email: u.email, is_active: u.is_active });
  };

  const isAdmin = has("users.gerir");
  const [tab, setTab] = useState<"utilizadores" | "grupos" | "permissoes">("utilizadores");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Gestão de Utilizadores</h1>
        <p className="text-ink-mid/70 text-sm">Utilizadores · Grupos · Permissões</p>
      </div>

      <div className="border-b border-ink-ghost/60 dark:border-ink-ghost/20 flex gap-1">
        {([
          { id: "utilizadores" as const, label: "Utilizadores", icon: Users },
          { id: "grupos" as const, label: "Grupos", icon: Shield },
          { id: "permissoes" as const, label: "Permissões", icon: FileText },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? "border-ink text-ink"
                : "border-transparent text-ink-mid/70 hover:text-ink dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "grupos" ? (
        <GruposContent />
      ) : tab === "permissoes" ? (
        <PermissionsContent />
      ) : (
        <>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Total", value: stats.total, color: "bg-surface text-gray-700" },
            { label: "Activos", value: stats.ativos, color: "bg-live-dim text-live" },
            { label: "Suspensos", value: stats.suspensos, color: "bg-danger/10 text-danger" },
            { label: "Online (5m)", value: stats.online, color: "bg-live-dim text-live ring-2 ring-emerald-400" },
            { label: "Login 24h", value: stats.login_24h, color: "bg-blue-100 text-blue-700" },
            { label: "Login 7d", value: stats.login_7d, color: "bg-indigo-100 text-indigo-700" },
            { label: "Nunca logaram", value: stats.nunca_logaram, color: "bg-amber/15 text-amber" },
          ].map((c) => (
            <div key={c.label} className={`rounded-lg p-3 ${c.color}`}>
              <p className="text-[10px] uppercase font-semibold tracking-wide opacity-80">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-ink-mid/70 text-sm">{users.length} utilizador(es) registado(s)</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-ink hover:bg-ink/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="h-4 w-4" /> Novo Utilizador
          </button>
        )}
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-ink-mid/50">Nenhum utilizador encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-gray-800/50">
                  {["Nome", "Email", "Grupo", "Estado", "Último login", "Ações"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-mid/70 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium text-ink dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="relative w-7 h-7">
                          <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center text-white text-xs font-bold">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          {listagemMap[u.id]?.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-live border-2 border-white dark:border-gray-900 rounded-full" title="Online" />
                          )}
                        </div>
                        <span>{u.full_name}</span>
                        {u.id === me?.id && <span className="text-xs text-blue-500">(eu)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-mid dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={(u as { grupo_id?: string | null }).grupo_id || ""}
                          onChange={(e) => permissoesService.atribuirGrupoUser(u.id, e.target.value || null).then(() => {
                            qc.invalidateQueries({ queryKey: ["users"] });
                            qc.invalidateQueries({ queryKey: ["grupos"] });
                            toast.success("Grupo atribuído");
                          }).catch(() => toast.error("Erro"))}
                          className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-2 py-1 text-xs bg-panel dark:bg-panel text-ink dark:text-white"
                        >
                          <option value="">— Sem grupo —</option>
                          {grupos.map((g) => (
                            <option key={g.id} value={g.id}>{grupoMap[g.id]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-ink-mid dark:text-gray-400">
                          {grupoMap[(u as { grupo_id?: string | null }).grupo_id || ""] || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? "bg-live-dim text-green-800" : "bg-danger/10 text-red-800"}`}>
                        {u.is_active ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                        {u.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-mid/70 text-xs whitespace-nowrap">
                      {listagemMap[u.id]?.last_login_at ? (
                        <span title={`Última atividade: ${listagemMap[u.id]?.last_activity_at ? formatDateTime(listagemMap[u.id].last_activity_at!) : "—"}`}>
                          {formatDateTime(listagemMap[u.id].last_login_at!)}
                        </span>
                      ) : <span className="text-amber">Nunca</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {(isAdmin || u.id === me?.id) && (
                          <button onClick={() => openEdit(u)} className="text-ink hover:text-ink/80 p-1 rounded" title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {(isAdmin || u.id === me?.id) && (
                          <button onClick={() => setResetting(u)} className="text-yellow-600 hover:text-yellow-800 p-1 rounded" title="Redefinir password">
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {isAdmin && u.id !== me?.id && (
                          <button onClick={() => setDeleteTarget(u)} className="text-danger hover:text-red-700 p-1 rounded" title="Desactivar">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* Modal Criar */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); createForm.reset(); }} title="Novo Utilizador">
        <form onSubmit={createForm.handleSubmit(d => createMut.mutate(d))} className="space-y-4">
          <div>
            <label className={labelCls}>Nome completo</label>
            <input {...createForm.register("full_name")} className={inputCls} placeholder="Nome completo" />
            {createForm.formState.errors.full_name && <p className="text-danger text-xs mt-1">{createForm.formState.errors.full_name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input {...createForm.register("email")} type="email" className={inputCls} placeholder="email@exemplo.com" />
            {createForm.formState.errors.email && <p className="text-danger text-xs mt-1">{createForm.formState.errors.email.message}</p>}
          </div>
          <div className="bg-amber/8 dark:bg-amber/10 border border-amber/30 dark:border-amber-800 rounded-lg p-3 text-xs text-amber dark:text-amber-300">
            🔐 A <strong>password inicial</strong> será igual ao email do utilizador. No primeiro login será obrigado a definir uma nova senha.
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={createMut.isPending} className="flex-1 flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
              {createMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Criar
            </button>
            <button type="button" onClick={() => { setShowCreate(false); createForm.reset(); }} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-surface dark:hover:bg-ink-ghost/20">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Editar: ${editing?.full_name}`}>
        <form onSubmit={updateForm.handleSubmit(d => editing && updateMut.mutate({ id: editing.id, dto: d }))} className="space-y-4">
          <div>
            <label className={labelCls}>Nome completo</label>
            <input {...updateForm.register("full_name")} className={inputCls} />
            {updateForm.formState.errors.full_name && <p className="text-danger text-xs mt-1">{updateForm.formState.errors.full_name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input {...updateForm.register("email")} type="email" className={inputCls} />
            {updateForm.formState.errors.email && <p className="text-danger text-xs mt-1">{updateForm.formState.errors.email.message}</p>}
          </div>
          {isAdmin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 text-xs text-blue-700 dark:text-blue-300">
              💡 As permissões são definidas pelo <strong>Grupo</strong> do utilizador (alteráveis na tabela ou na tab "Grupos").
            </div>
          )}
          {isAdmin && editing?.id !== me?.id && (
            <div className="flex items-center gap-3">
              <input {...updateForm.register("is_active")} type="checkbox" id="is_active" className="w-4 h-4 rounded" />
              <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">Conta activa</label>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={updateMut.isPending} className="flex-1 flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
              {updateMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Guardar
            </button>
            <button type="button" onClick={() => setEditing(null)} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-surface dark:hover:bg-ink-ghost/20">Cancelar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Desactivar Utilizador"
        message={`Tem a certeza que pretende desactivar o utilizador "${deleteTarget?.full_name}"? O utilizador não conseguirá aceder ao sistema.`}
        confirmLabel="Desactivar"
        onConfirm={() => { if (deleteTarget) { deleteMut.mutate(deleteTarget.id); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal Reset Password */}
      <Modal open={!!resetting} onClose={() => { setResetting(null); resetForm.reset(); }} title={`Redefinir password: ${resetting?.full_name}`}>
        <form onSubmit={resetForm.handleSubmit(d => resetting && resetMut.mutate({ id: resetting.id, pwd: d.new_password }))} className="space-y-4">
          <div>
            <label className={labelCls}>Nova password</label>
            <input {...resetForm.register("new_password")} type="password" className={inputCls} placeholder="Mínimo 8 caracteres" />
            {resetForm.formState.errors.new_password && <p className="text-danger text-xs mt-1">{resetForm.formState.errors.new_password.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Confirmar password</label>
            <input {...resetForm.register("confirm")} type="password" className={inputCls} placeholder="Repita a password" />
            {resetForm.formState.errors.confirm && <p className="text-danger text-xs mt-1">{resetForm.formState.errors.confirm.message}</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={resetMut.isPending} className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
              {resetMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Redefinir
            </button>
            <button type="button" onClick={() => { setResetting(null); resetForm.reset(); }} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-surface dark:hover:bg-ink-ghost/20">Cancelar</button>
          </div>
        </form>
      </Modal>
        </>
      )}
    </div>
  );
}
