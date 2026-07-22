"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  catalogoService, permissoesService,
  type Modulo, type Pagina, type Permissao,
} from "@/shared/services/financeiro.service";
import { toast } from "sonner";
import {
  Layers, FileText, Key, Shield, Plus, Pencil, Trash2, Loader2, X, Lock,
} from "lucide-react";
import Link from "next/link";

type Tab = "modulos" | "paginas" | "permissoes" | "grupos";

export default function CatalogoPage() {
  const [tab, setTab] = useState<Tab>("modulos");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-ink-mid/70 mb-1">
          <Link href="/dashboard/configuracoes" className="hover:underline">Configurações</Link>
          <span>›</span>
          <span>Catálogo do Sistema</span>
        </div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Catálogo · Módulos, Páginas, Permissões e Grupos</h1>
        <p className="text-ink-mid/70 text-sm">Gestão central da estrutura de menus e permissões da plataforma</p>
      </div>

      <div className="border-b border-ink-ghost/60 dark:border-ink-ghost/20 flex gap-1 flex-wrap">
        {([
          { id: "modulos" as const, label: "Módulos", icon: Layers },
          { id: "paginas" as const, label: "Páginas", icon: FileText },
          { id: "permissoes" as const, label: "Permissões", icon: Key },
          { id: "grupos" as const, label: "Grupos de Permissões", icon: Shield },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === id ? "border-ink text-ink" : "border-transparent text-ink-mid/70 hover:text-ink dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "modulos" && <ModulosTab />}
      {tab === "paginas" && <PaginasTab />}
      {tab === "permissoes" && <PermissoesCrudTab />}
      {tab === "grupos" && <GruposLink />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Módulos
// ════════════════════════════════════════════════════════════════════

function ModulosTab() {
  const qc = useQueryClient();
  const { data: modulos = [], isLoading } = useQuery({ queryKey: ["modulos"], queryFn: catalogoService.listarModulos });
  const [editing, setEditing] = useState<Modulo | null>(null);
  const [creating, setCreating] = useState(false);

  const delMut = useMutation({
    mutationFn: (id: string) => catalogoService.eliminarModulo(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["modulos"] }); toast.success("Módulo eliminado"); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-mid/70">{modulos.length} módulo(s)</p>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-ink hover:bg-ink/90 text-white px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Novo Módulo
        </button>
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
      ) : (
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface dark:bg-gray-800/50 border-b">
              <tr>
                {["Ordem", "Nome", "Descrição", "Ícone", "Páginas", "Sistema?", "Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulos.map((m) => (
                <tr key={m.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                  <td className="px-4 py-2 text-xs text-ink-mid/70">{m.ordem}</td>
                  <td className="px-4 py-2 font-medium text-ink dark:text-white">{m.nome}</td>
                  <td className="px-4 py-2 text-ink-mid/70 text-xs">{m.descricao || "—"}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-ink-mid/70">{m.icone || "—"}</td>
                  <td className="px-4 py-2"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{m.n_paginas}</span></td>
                  <td className="px-4 py-2">{m.is_system ? <Lock className="h-3 w-3 text-amber" /> : "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditing(m)} className="text-ink hover:text-ink/80 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                      {!m.is_system && (
                        <button onClick={() => { if (confirm(`Eliminar módulo "${m.nome}"?`)) delMut.mutate(m.id); }} className="text-danger hover:text-danger p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(editing || creating) && (
        <ModuloForm
          initial={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["modulos"] }); setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function ModuloForm({ initial, onClose, onSaved }: { initial: Modulo | null; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [icone, setIcone] = useState(initial?.icone || "");
  const [ordem, setOrdem] = useState(initial?.ordem ?? 0);

  const mut = useMutation({
    mutationFn: () => initial
      ? catalogoService.atualizarModulo(initial.id, { nome, descricao, icone, ordem })
      : catalogoService.criarModulo({ nome, descricao, icone, ordem }),
    onSuccess: () => { toast.success(initial ? "Módulo actualizado" : "Módulo criado"); onSaved(); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink dark:text-white">{initial ? `Editar: ${initial.nome}` : "Novo Módulo"}</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-ink-mid/50" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Nome *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" disabled={initial?.is_system} />
            {initial?.is_system && <p className="text-[10px] text-amber mt-1">Módulos de sistema não podem ser renomeados.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Ícone (Lucide)</label>
              <input value={icone} onChange={(e) => setIcone(e.target.value)} placeholder="Ex: Wallet" className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm font-mono bg-panel dark:bg-panel text-ink dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Ordem</label>
              <input type="number" value={ordem} onChange={(e) => setOrdem(parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => mut.mutate()} disabled={!nome.trim() || mut.isPending} className="flex-1 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
            {mut.isPending && <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1" />}
            {initial ? "Guardar" : "Criar"}
          </button>
          <button onClick={onClose} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Páginas
// ════════════════════════════════════════════════════════════════════

function PaginasTab() {
  const qc = useQueryClient();
  const { data: paginas = [], isLoading } = useQuery({ queryKey: ["paginas"], queryFn: catalogoService.listarPaginas });
  const { data: modulos = [] } = useQuery({ queryKey: ["modulos"], queryFn: catalogoService.listarModulos });
  const [editing, setEditing] = useState<Pagina | null>(null);
  const [creating, setCreating] = useState(false);

  const delMut = useMutation({
    mutationFn: (id: string) => catalogoService.eliminarPagina(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paginas"] }); toast.success("Página eliminada"); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-mid/70">{paginas.length} página(s)</p>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-ink hover:bg-ink/90 text-white px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Nova Página
        </button>
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
      ) : (
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface dark:bg-gray-800/50 border-b">
              <tr>
                {["Módulo", "Nome", "Rota", "Ícone", "Permissões", "Ordem", "Sistema?", "Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginas.map((p) => (
                <tr key={p.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                  <td className="px-4 py-2 text-xs"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">{p.modulo_nome || "—"}</span></td>
                  <td className="px-4 py-2 font-medium text-ink dark:text-white">{p.nome}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-ink-mid">{p.href || "—"}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-ink-mid/70">{p.icone || "—"}</td>
                  <td className="px-4 py-2"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">{p.n_permissoes}</span></td>
                  <td className="px-4 py-2 text-xs text-ink-mid/70">{p.ordem}</td>
                  <td className="px-4 py-2">{p.is_system ? <Lock className="h-3 w-3 text-amber" /> : "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditing(p)} className="text-ink hover:text-ink/80 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                      {!p.is_system && (
                        <button onClick={() => { if (confirm(`Eliminar "${p.nome}"?`)) delMut.mutate(p.id); }} className="text-danger hover:text-danger p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(editing || creating) && (
        <PaginaForm
          initial={editing}
          modulos={modulos}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["paginas"] }); setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function PaginaForm({ initial, modulos, onClose, onSaved }: { initial: Pagina | null; modulos: Modulo[]; onClose: () => void; onSaved: () => void }) {
  const [moduloId, setModuloId] = useState(initial?.modulo_id || modulos[0]?.id || "");
  const [nome, setNome] = useState(initial?.nome || "");
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [href, setHref] = useState(initial?.href || "");
  const [icone, setIcone] = useState(initial?.icone || "");
  const [ordem, setOrdem] = useState(initial?.ordem ?? 0);

  const mut = useMutation({
    mutationFn: () => initial
      ? catalogoService.atualizarPagina(initial.id, { modulo_id: moduloId, nome, descricao, href, icone, ordem })
      : catalogoService.criarPagina({ modulo_id: moduloId, nome, descricao, href, icone, ordem }),
    onSuccess: () => { toast.success(initial ? "Página actualizada" : "Página criada"); onSaved(); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink dark:text-white">{initial ? `Editar: ${initial.nome}` : "Nova Página"}</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-ink-mid/50" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Módulo *</label>
            <select value={moduloId} onChange={(e) => setModuloId(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
              {modulos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Nome *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" disabled={initial?.is_system} />
            {initial?.is_system && <p className="text-[10px] text-amber mt-1">Páginas de sistema não podem ser renomeadas.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Rota</label>
            <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/dashboard/..." className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm font-mono bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Ícone</label>
              <input value={icone} onChange={(e) => setIcone(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm font-mono bg-panel dark:bg-panel text-ink dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Ordem</label>
              <input type="number" value={ordem} onChange={(e) => setOrdem(parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => mut.mutate()} disabled={!nome.trim() || !moduloId || mut.isPending} className="flex-1 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
            {mut.isPending && <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1" />}
            {initial ? "Guardar" : "Criar"}
          </button>
          <button onClick={onClose} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Permissões CRUD
// ════════════════════════════════════════════════════════════════════

function PermissoesCrudTab() {
  const qc = useQueryClient();
  const { data: permissoes = [], isLoading } = useQuery({ queryKey: ["permissoes"], queryFn: permissoesService.listarPermissoes });
  const { data: paginas = [] } = useQuery({ queryKey: ["paginas"], queryFn: catalogoService.listarPaginas });
  const [editing, setEditing] = useState<Permissao | null>(null);
  const [creating, setCreating] = useState(false);

  const delMut = useMutation({
    mutationFn: (id: string) => catalogoService.eliminarPermissao(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["permissoes"] }); toast.success("Permissão eliminada"); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-mid/70">{permissoes.length} permissão(ões) no catálogo</p>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-ink hover:bg-ink/90 text-white px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Nova Permissão
        </button>
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
      ) : (
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface dark:bg-gray-800/50 border-b">
              <tr>
                {["Código", "Módulo", "Página", "Ação", "Descrição", "Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissoes.map((p) => (
                <tr key={p.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-700 dark:text-gray-300">{p.codigo}</td>
                  <td className="px-4 py-2 text-xs"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">{p.modulo || "—"}</span></td>
                  <td className="px-4 py-2 text-xs"><span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{p.menu}</span></td>
                  <td className="px-4 py-2"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">{p.acao}</span></td>
                  <td className="px-4 py-2 text-xs text-ink-mid/70">{p.descricao || "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditing(p)} className="text-ink hover:text-ink/80 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { if (confirm(`Eliminar permissão "${p.codigo}"? Será removida de todos os grupos.`)) delMut.mutate(p.id); }} className="text-danger hover:text-danger p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(editing || creating) && (
        <PermissaoForm
          initial={editing}
          paginas={paginas}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["permissoes"] }); setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function PermissaoForm({ initial, paginas, onClose, onSaved }: { initial: Permissao | null; paginas: Pagina[]; onClose: () => void; onSaved: () => void }) {
  // Para edit, deduzir pagina_id a partir do menu (correspondência por nome)
  const initialPag = initial ? paginas.find(p => p.nome === initial.menu)?.id : (paginas[0]?.id || "");
  const [paginaId, setPaginaId] = useState(initialPag || "");
  const [codigo, setCodigo] = useState(initial?.codigo || "");
  const [acao, setAcao] = useState(initial?.acao || "");
  const [descricao, setDescricao] = useState(initial?.descricao || "");

  // Quando muda página + acao, sugerir codigo (se a criar)
  const pagSel = paginas.find(p => p.id === paginaId);
  const sugCodigo = pagSel && acao ? `${pagSel.nome}.${acao}` : "";

  const mut = useMutation({
    mutationFn: () => initial
      ? catalogoService.atualizarPermissao(initial.id, { pagina_id: paginaId, acao, descricao })
      : catalogoService.criarPermissao({ codigo: codigo || sugCodigo, pagina_id: paginaId, acao, descricao }),
    onSuccess: () => { toast.success(initial ? "Permissão actualizada" : "Permissão criada"); onSaved(); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink dark:text-white">{initial ? `Editar: ${initial.codigo}` : "Nova Permissão"}</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-ink-mid/50" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Página *</label>
            <select value={paginaId} onChange={(e) => setPaginaId(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
              {paginas.map(p => <option key={p.id} value={p.id}>{p.modulo_nome ? `${p.modulo_nome} › ` : ""}{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ação *</label>
            <input value={acao} onChange={(e) => setAcao(e.target.value.toLowerCase().replace(/\s+/g, "_"))} placeholder="Ex: criar, editar, listar" className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm font-mono bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
          {!initial && (
            <div>
              <label className="block text-xs font-medium mb-1">Código (auto) *</label>
              <input value={codigo || sugCodigo} onChange={(e) => setCodigo(e.target.value.toLowerCase().replace(/\s+/g, "_"))} placeholder="modulo.acao" className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm font-mono bg-panel dark:bg-panel text-ink dark:text-white" />
              <p className="text-[10px] text-ink-mid/70 mt-1">Formato: pagina.acao (ex: movimentos.criar)</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1">Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => mut.mutate()} disabled={!acao.trim() || !paginaId || mut.isPending} className="flex-1 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
            {mut.isPending && <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1" />}
            {initial ? "Guardar" : "Criar"}
          </button>
          <button onClick={onClose} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Link para Grupos de Permissões
// ════════════════════════════════════════════════════════════════════

function GruposLink() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center">
      <Shield className="h-12 w-12 mx-auto mb-3 text-ink" />
      <h3 className="font-semibold text-ink dark:text-white mb-2">Grupos de Permissões</h3>
      <p className="text-sm text-ink-mid dark:text-gray-400 mb-4">
        Os grupos (Admin, Gestor, Assistente, Auditoria, customizados…) e a atribuição de utilizadores são geridos na página de Utilizadores.
      </p>
      <Link
        href="/dashboard/utilizadores?tab=grupos"
        className="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        <Shield className="h-4 w-4" /> Ir para Grupos
      </Link>
    </div>
  );
}
