"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { origensFundoService, type OrigemFundo } from "@/shared/services/financeiro.service";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, X, Lock, Wallet } from "lucide-react";
import { usePermissions } from "@/shared/hooks/use-permissions";

export default function OrigensFundoPage() {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const isAdmin = has("grupos.gerir");
  const { data: origens = [], isLoading } = useQuery({ queryKey: ["origens-fundo"], queryFn: origensFundoService.listar });
  const [editing, setEditing] = useState<OrigemFundo | null>(null);
  const [creating, setCreating] = useState(false);

  const delMut = useMutation({
    mutationFn: (id: string) => origensFundoService.eliminar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["origens-fundo"] }); toast.success("Origem eliminada"); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber/15 dark:bg-amber-900/30">
          <Wallet className="h-5 w-5 text-amber" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Origens do Fundo</h1>
          <p className="text-ink-mid/70 text-sm">Catálogo de tipos de origem disponíveis ao carregar fundos</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-mid/70">{origens.length} origem(ns)</p>
        {isAdmin && (
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
            <Plus className="h-4 w-4" /> Nova Origem
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
      ) : (
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface dark:bg-gray-800/50 border-b">
              <tr>
                {["Ordem", "Nome", "Descrição", "Estado", "Sistema?", "Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {origens.map((o) => (
                <tr key={o.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                  <td className="px-4 py-2 text-xs text-ink-mid/70">{o.ordem}</td>
                  <td className="px-4 py-2 font-medium text-ink dark:text-white">{o.nome}</td>
                  <td className="px-4 py-2 text-xs text-ink-mid/70">{o.descricao || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${o.estado === "ativo" ? "bg-green-100 text-live" : "bg-ink-ghost/30 dark:bg-ink-ghost/20 text-ink-mid"}`}>
                      {o.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">{o.is_system ? <Lock className="h-3 w-3 text-amber" /> : "—"}</td>
                  <td className="px-4 py-2">
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditing(o)} className="text-ink hover:text-ink/80 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                        {!o.is_system && (
                          <button onClick={() => { if (confirm(`Eliminar origem "${o.nome}"?`)) delMut.mutate(o.id); }} className="text-danger hover:text-danger p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(editing || creating) && (
        <OrigemForm
          initial={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["origens-fundo"] }); setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function OrigemForm({ initial, onClose, onSaved }: { initial: OrigemFundo | null; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [ordem, setOrdem] = useState(initial?.ordem ?? 0);
  const [estado, setEstado] = useState<"ativo" | "inativo">(initial?.estado || "ativo");

  const mut = useMutation({
    mutationFn: () => initial
      ? origensFundoService.atualizar(initial.id, { nome, descricao, ordem, estado })
      : origensFundoService.criar({ nome, descricao, ordem, estado }),
    onSuccess: () => { toast.success(initial ? "Origem actualizada" : "Origem criada"); onSaved(); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink dark:text-white">{initial ? `Editar: ${initial.nome}` : "Nova Origem do Fundo"}</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-ink-mid/50" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Nome *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} disabled={initial?.is_system} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
            {initial?.is_system && <p className="text-[10px] text-amber mt-1">Origens de sistema não podem ser renomeadas.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Ordem</label>
              <input type="number" value={ordem} onChange={(e) => setOrdem(parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value as "ativo" | "inativo")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => mut.mutate()} disabled={!nome.trim() || mut.isPending} className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
            {mut.isPending && <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1" />}
            {initial ? "Guardar" : "Criar"}
          </button>
          <button onClick={onClose} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
