"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissoesService, userService, type Permissao } from "@/shared/services/financeiro.service";
import { toast } from "sonner";
import {
  Plus, Trash2, Shield, Loader2, Lock, Users as UsersIcon, Check,
  ChevronDown, ChevronRight, UserPlus, X, Search,
} from "lucide-react";
import { usePermissions } from "@/shared/hooks/use-permissions";

export function GruposContent() {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const isAdmin = has("grupos.gerir");

  const { data: grupos = [], isLoading } = useQuery({ queryKey: ["grupos"], queryFn: permissoesService.listarGrupos });
  const { data: permissoes = [] } = useQuery({ queryKey: ["permissoes"], queryFn: permissoesService.listarPermissoes });
  const { data: users = [] } = useQuery({ queryKey: ["users-all"], queryFn: userService.list });

  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null);
  const [creatingGrupo, setCreatingGrupo] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaDesc, setNovaDesc] = useState("");
  const [addUsersModal, setAddUsersModal] = useState(false);

  const { data: permsDoGrupo = [] } = useQuery({
    queryKey: ["grupo-permissoes", selectedGrupoId],
    queryFn: () => permissoesService.getPermissoesDoGrupo(selectedGrupoId!),
    enabled: !!selectedGrupoId,
  });

  const { data: usersDoGrupo = [] } = useQuery({
    queryKey: ["grupo-utilizadores", selectedGrupoId],
    queryFn: () => permissoesService.listarUtilizadoresDoGrupo(selectedGrupoId!),
    enabled: !!selectedGrupoId,
  });

  const [editPerms, setEditPerms] = useState<Set<string>>(new Set());
  const [permsDirty, setPermsDirty] = useState(false);
  const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set());
  const [expandedPaginas, setExpandedPaginas] = useState<Set<string>>(new Set());

  useEffect(() => {
    setEditPerms(new Set(permsDoGrupo));
    setPermsDirty(false);
  }, [permsDoGrupo]);

  const criarMut = useMutation({
    mutationFn: () => permissoesService.criarGrupo(novoNome, novaDesc || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grupos"] });
      toast.success("Grupo criado");
      setCreatingGrupo(false); setNovoNome(""); setNovaDesc("");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) =>
      toast.error(e?.response?.data?.detail || "Erro ao criar grupo"),
  });

  const eliminarMut = useMutation({
    mutationFn: (id: string) => permissoesService.eliminarGrupo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grupos"] });
      if (selectedGrupoId) setSelectedGrupoId(null);
      toast.success("Grupo eliminado");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) =>
      toast.error(e?.response?.data?.detail || "Erro ao eliminar"),
  });

  const guardarPermsMut = useMutation({
    mutationFn: () => permissoesService.setPermissoesDoGrupo(selectedGrupoId!, Array.from(editPerms)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grupos"] });
      qc.invalidateQueries({ queryKey: ["grupo-permissoes", selectedGrupoId] });
      toast.success("Permissões guardadas");
      setPermsDirty(false);
    },
    onError: () => toast.error("Erro ao guardar permissões"),
  });

  const adicionarUsersMut = useMutation({
    mutationFn: (ids: string[]) => permissoesService.adicionarUtilizadoresAoGrupo(selectedGrupoId!, ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grupos"] });
      qc.invalidateQueries({ queryKey: ["grupo-utilizadores", selectedGrupoId] });
      qc.invalidateQueries({ queryKey: ["users-all"] });
      toast.success("Utilizadores adicionados");
      setAddUsersModal(false);
    },
    onError: () => toast.error("Erro ao adicionar"),
  });

  const removerUserMut = useMutation({
    mutationFn: (userId: string) => permissoesService.atribuirGrupoUser(userId, null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grupos"] });
      qc.invalidateQueries({ queryKey: ["grupo-utilizadores", selectedGrupoId] });
      qc.invalidateQueries({ queryKey: ["users-all"] });
      toast.success("Utilizador removido do grupo");
    },
    onError: () => toast.error("Erro ao remover"),
  });

  // Hierarquia Módulo > Página > Permissões
  const hierarchy = useMemo(() => {
    const tree: Record<string, Record<string, Permissao[]>> = {};
    for (const p of permissoes) {
      const mod = p.modulo || "Geral";
      const pag = p.menu;
      if (!tree[mod]) tree[mod] = {};
      if (!tree[mod][pag]) tree[mod][pag] = [];
      tree[mod][pag].push(p);
    }
    return tree;
  }, [permissoes]);

  // Expandir tudo na primeira carga
  useEffect(() => {
    setExpandedModulos(new Set(Object.keys(hierarchy)));
    setExpandedPaginas(new Set(Object.values(hierarchy).flatMap(p => Object.keys(p))));
  }, [hierarchy]);

  const togglePerm = (pid: string) => {
    const next = new Set(editPerms);
    if (next.has(pid)) next.delete(pid); else next.add(pid);
    setEditPerms(next);
    setPermsDirty(true);
  };

  const togglePaginaPerms = (perms: Permissao[]) => {
    const allSel = perms.every((p) => editPerms.has(p.id));
    const next = new Set(editPerms);
    if (allSel) perms.forEach((p) => next.delete(p.id));
    else perms.forEach((p) => next.add(p.id));
    setEditPerms(next);
    setPermsDirty(true);
  };

  const toggleModuloPerms = (modulo: string) => {
    const allPerms: Permissao[] = Object.values(hierarchy[modulo] || {}).flat();
    const allSel = allPerms.every((p) => editPerms.has(p.id));
    const next = new Set(editPerms);
    if (allSel) allPerms.forEach((p) => next.delete(p.id));
    else allPerms.forEach((p) => next.add(p.id));
    setEditPerms(next);
    setPermsDirty(true);
  };

  const toggleExpandModulo = (m: string) => {
    const next = new Set(expandedModulos);
    if (next.has(m)) next.delete(m); else next.add(m);
    setExpandedModulos(next);
  };
  const toggleExpandPagina = (key: string) => {
    const next = new Set(expandedPaginas);
    if (next.has(key)) next.delete(key); else next.add(key);
    setExpandedPaginas(next);
  };

  const grupoSelecionado = grupos.find((g) => g.id === selectedGrupoId);
  const grupoMap = Object.fromEntries(grupos.map((g) => [g.id, g.nome]));

  // Utilizadores fora do grupo (para multi-select)
  const usersIdsInGrupo = new Set(usersDoGrupo.map((u) => u.id));
  const usersDisponiveis = users.filter((u) => !usersIdsInGrupo.has(u.id));

  if (isLoading) return <div className="p-8 text-center text-ink-mid/50">A carregar...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Lista de grupos */}
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
            <h3 className="font-semibold text-ink dark:text-white text-sm">Grupos</h3>
            {isAdmin && (
              <button onClick={() => setCreatingGrupo(true)} className="flex items-center gap-1 text-xs bg-ink hover:bg-ink/90 text-white px-2 py-1 rounded">
                <Plus className="h-3 w-3" /> Novo
              </button>
            )}
          </div>
          <div className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {grupos.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGrupoId(g.id)}
                className={`w-full text-left px-4 py-3 hover:bg-surface dark:hover:bg-ink-ghost/20 ${selectedGrupoId === g.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${g.is_system ? "text-amber" : "text-ink-mid/50"}`} />
                  <span className="font-medium text-sm text-ink dark:text-white">{g.nome}</span>
                  {g.is_system && <Lock className="h-3 w-3 text-amber" />}
                </div>
                {g.descricao && <p className="text-[11px] text-ink-mid/70 mt-0.5 ml-6 truncate">{g.descricao}</p>}
                <div className="flex items-center gap-3 mt-1 ml-6 text-[10px] text-ink-mid/70">
                  <span>{g.n_permissoes} perm.</span>
                  <span>·</span>
                  <span>{g.n_utilizadores} user(s)</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detalhe + matriz */}
        {selectedGrupoId && grupoSelecionado ? (
          <div className="space-y-4">
            <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
                <div>
                  <h3 className="font-semibold text-ink dark:text-white">{grupoSelecionado.nome}</h3>
                  <p className="text-xs text-ink-mid/70">{grupoSelecionado.descricao || "Sem descrição"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => setAddUsersModal(true)}
                      className="flex items-center gap-1 bg-ink hover:bg-ink/90 text-white text-xs px-3 py-1.5 rounded"
                    >
                      <UserPlus className="h-3 w-3" /> Adicionar Utilizadores
                    </button>
                  )}
                  {permsDirty && (
                    <button
                      onClick={() => guardarPermsMut.mutate()}
                      disabled={guardarPermsMut.isPending || !isAdmin}
                      className="flex items-center gap-1 bg-live hover:bg-green-700 disabled:opacity-60 text-white text-xs px-3 py-1.5 rounded"
                    >
                      {guardarPermsMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Guardar permissões
                    </button>
                  )}
                  {isAdmin && !grupoSelecionado.is_system && (
                    <button
                      onClick={() => { if (confirm(`Eliminar grupo "${grupoSelecionado.nome}"?`)) eliminarMut.mutate(grupoSelecionado.id); }}
                      className="text-danger hover:text-red-700 p-1.5 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Utilizadores do grupo */}
              {usersDoGrupo.length > 0 && (
                <div className="px-5 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15 bg-blue-50/40 dark:bg-blue-900/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-2">
                    Utilizadores neste grupo ({usersDoGrupo.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {usersDoGrupo.map((u) => (
                      <span key={u.id} className="inline-flex items-center gap-1.5 bg-panel dark:bg-panel border border-blue-200 dark:border-blue-700 px-2 py-1 rounded-full text-xs">
                        <span className="w-5 h-5 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-bold">
                          {u.full_name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium">{u.full_name}</span>
                        {isAdmin && (
                          <button onClick={() => { if (confirm(`Remover ${u.full_name} do grupo?`)) removerUserMut.mutate(u.id); }} className="text-ink-mid/50 hover:text-danger">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matriz hierárquica Módulo > Página > Permissão */}
              <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto">
                {Object.keys(hierarchy).sort().map((modulo) => {
                  const paginas = hierarchy[modulo];
                  const allPermsMod = Object.values(paginas).flat();
                  const allModSel = allPermsMod.every((p) => editPerms.has(p.id));
                  const someModSel = allPermsMod.some((p) => editPerms.has(p.id));
                  const modExpanded = expandedModulos.has(modulo);
                  return (
                    <div key={modulo} className="border-2 border-ink-ghost/60 dark:border-ink-ghost/20 rounded-lg overflow-hidden">
                      {/* Nível 1: Módulo */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                        <button onClick={() => toggleExpandModulo(modulo)} className="text-ink-mid dark:text-gray-300">
                          {modExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        <input
                          type="checkbox"
                          checked={allModSel}
                          ref={(el) => { if (el) el.indeterminate = someModSel && !allModSel; }}
                          onChange={() => isAdmin && toggleModuloPerms(modulo)}
                          disabled={!isAdmin}
                          className="rounded border-ink-ghost/80"
                        />
                        <span className="font-bold text-sm text-ink dark:text-white flex-1">{modulo}</span>
                        <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-panel dark:bg-surface dark:bg-ink-ghost/20 px-1.5 py-0.5 rounded">
                          {allPermsMod.filter(p => editPerms.has(p.id)).length}/{allPermsMod.length}
                        </span>
                      </div>

                      {modExpanded && (
                        <div className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                          {Object.keys(paginas).sort().map((pagina) => {
                            const perms = paginas[pagina];
                            const allPagSel = perms.every((p) => editPerms.has(p.id));
                            const somePagSel = perms.some((p) => editPerms.has(p.id));
                            const pagKey = `${modulo}::${pagina}`;
                            const pagExpanded = expandedPaginas.has(pagKey);
                            return (
                              <div key={pagina}>
                                {/* Nível 2: Página */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface dark:bg-gray-800/50 pl-7">
                                  <button onClick={() => toggleExpandPagina(pagKey)} className="text-ink-mid/70">
                                    {pagExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                  </button>
                                  <input
                                    type="checkbox"
                                    checked={allPagSel}
                                    ref={(el) => { if (el) el.indeterminate = somePagSel && !allPagSel; }}
                                    onChange={() => isAdmin && togglePaginaPerms(perms)}
                                    disabled={!isAdmin}
                                    className="rounded border-ink-ghost/80"
                                  />
                                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 flex-1">
                                    {pagina}
                                  </span>
                                  <span className="text-[10px] text-ink-mid/70">{perms.filter(p => editPerms.has(p.id)).length}/{perms.length}</span>
                                </div>

                                {/* Nível 3: Permissões */}
                                {pagExpanded && (
                                  <div className="pl-12 pr-3 py-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {perms.map((p) => (
                                      <label key={p.id} className="flex items-start gap-2 text-xs cursor-pointer hover:bg-surface dark:hover:bg-ink-ghost/20 p-1.5 rounded">
                                        <input
                                          type="checkbox"
                                          checked={editPerms.has(p.id)}
                                          onChange={() => isAdmin && togglePerm(p.id)}
                                          disabled={!isAdmin}
                                          className="mt-0.5 rounded border-ink-ghost/80"
                                        />
                                        <div className="min-w-0">
                                          <p className="font-medium text-ink dark:text-white">{p.acao}</p>
                                          <p className="text-[10px] text-ink-mid/70">{p.descricao || p.codigo}</p>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-panel dark:bg-panel rounded-xl border border-dashed border-ink-ghost/80 dark:border-gray-700 p-12 text-center text-ink-mid/50">
            <Shield className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Selecione um grupo à esquerda para gerir as permissões e utilizadores.</p>
          </div>
        )}
      </div>

      {/* Modal criar grupo */}
      {creatingGrupo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setCreatingGrupo(false)}>
          <div className="w-full max-w-md bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink dark:text-white mb-3">Novo Grupo</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-white" placeholder="Ex: Tesouraria" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input value={novaDesc} onChange={(e) => setNovaDesc(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-white" placeholder="Opcional" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => criarMut.mutate()} disabled={!novoNome.trim() || criarMut.isPending} className="flex-1 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">Criar</button>
              <button onClick={() => { setCreatingGrupo(false); setNovoNome(""); setNovaDesc(""); }} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal multi-select utilizadores */}
      {addUsersModal && selectedGrupoId && (
        <AddUsersModal
          disponíveis={usersDisponiveis}
          grupoNome={grupoSelecionado?.nome || ""}
          grupoMap={grupoMap}
          onClose={() => setAddUsersModal(false)}
          onConfirm={(ids) => adicionarUsersMut.mutate(ids)}
          isPending={adicionarUsersMut.isPending}
        />
      )}
    </div>
  );
}


function AddUsersModal({
  disponíveis, grupoNome, grupoMap, onClose, onConfirm, isPending,
}: {
  disponíveis: Array<{ id: string; full_name: string; email: string; grupo_id?: string | null }>;
  grupoNome: string;
  grupoMap: Record<string, string>;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
  isPending: boolean;
}) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState("");

  // Um utilizador só pode pertencer a um grupo: se já tiver grupo, será movido.
  const handleConfirm = () => {
    const ids = Array.from(selecionados);
    const movidos = disponíveis.filter((u) => ids.includes(u.id) && u.grupo_id);
    if (movidos.length > 0) {
      const lista = movidos
        .map((u) => `• ${u.full_name} (de "${grupoMap[u.grupo_id as string] ?? "outro grupo"}")`)
        .join("\n");
      const ok = window.confirm(
        `${movidos.length} utilizador(es) já pertence(m) a outro grupo e serão MOVIDOS para "${grupoNome}":\n\n${lista}\n\n` +
        `Um utilizador só pode pertencer a um grupo de cada vez. Continuar?`,
      );
      if (!ok) return;
    }
    onConfirm(ids);
  };
  const filtrados = disponíveis.filter((u) =>
    !filtro || u.full_name.toLowerCase().includes(filtro.toLowerCase()) || u.email.toLowerCase().includes(filtro.toLowerCase())
  );
  const toggle = (id: string) => {
    const next = new Set(selecionados);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelecionados(next);
  };
  const todosSel = filtrados.length > 0 && filtrados.every((u) => selecionados.has(u.id));
  const toggleTodos = () => {
    if (todosSel) {
      const next = new Set(selecionados);
      filtrados.forEach((u) => next.delete(u.id));
      setSelecionados(next);
    } else {
      const next = new Set(selecionados);
      filtrados.forEach((u) => next.add(u.id));
      setSelecionados(next);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <UserPlus className="h-5 w-5 text-ink" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink dark:text-white">Adicionar utilizadores a "{grupoNome}"</h3>
            <p className="text-xs text-ink-mid/70">Selecione os utilizadores a atribuir a este grupo</p>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-mid/50" />
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Pesquisar nome ou email..."
            className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 pl-9 pr-3 py-2 text-sm bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-white"
          />
        </div>
        {disponíveis.length === 0 ? (
          <div className="text-center py-8 text-sm text-ink-mid/70">Todos os utilizadores já estão neste ou noutro grupo.</div>
        ) : (
          <>
            <div className="border border-ink-ghost/60 dark:border-ink-ghost/20 rounded-lg max-h-72 overflow-y-auto">
              <label className="flex items-center gap-2 px-3 py-2 border-b border-ink-ghost/40 dark:border-ink-ghost/15 bg-surface dark:bg-gray-800/50 cursor-pointer">
                <input type="checkbox" checked={todosSel} onChange={toggleTodos} className="rounded border-ink-ghost/80" />
                <span className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">Selecionar todos ({filtrados.length})</span>
              </label>
              {filtrados.map((u) => (
                <label key={u.id} className="flex items-center gap-3 px-3 py-2 border-b border-ink-ghost/40 dark:border-ink-ghost/15 cursor-pointer hover:bg-surface dark:hover:bg-ink-ghost/20">
                  <input type="checkbox" checked={selecionados.has(u.id)} onChange={() => toggle(u.id)} className="rounded border-ink-ghost/80" />
                  <div className="w-7 h-7 rounded-full bg-ink text-white text-xs flex items-center justify-center font-bold">
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink dark:text-white">{u.full_name}</p>
                    <p className="text-xs text-ink-mid/70">{u.email}</p>
                  </div>
                  {u.grupo_id && (
                    <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] font-medium bg-amber/15 text-amber dark:bg-amber-900/30 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      em: {grupoMap[u.grupo_id] ?? "outro grupo"}
                    </span>
                  )}
                </label>
              ))}
              {filtrados.length === 0 && <p className="text-center text-xs text-ink-mid/50 py-4">Sem resultados.</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleConfirm}
                disabled={selecionados.size === 0 || isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Adicionar {selecionados.size > 0 && `(${selecionados.size})`}
              </button>
              <button onClick={onClose} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm">Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
