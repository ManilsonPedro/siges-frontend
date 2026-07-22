"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localizacaoService, armazemService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, MapPin } from "lucide-react";
import type { Localizacao, CreateLocalizacaoDTO } from "@/shared/types";

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

const EMPTY_FORM: CreateLocalizacaoDTO = { armazem_id: "", codigo: "", corredor: "", prateleira: "", activo: true };

export default function LocalizacoesPage() {
  const qc = useQueryClient();
  const [armazemFiltro, setArmazemFiltro] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Localizacao | null>(null);
  const [form, setForm] = useState<CreateLocalizacaoDTO>(EMPTY_FORM);

  const { data: armazens = [] } = useQuery({ queryKey: ["armazens"], queryFn: armazemService.list });
  const { data: localizacoes = [], isLoading } = useQuery({
    queryKey: ["localizacoes", armazemFiltro],
    queryFn: () => localizacaoService.list(armazemFiltro || undefined),
  });

  const saveMut = useMutation({
    mutationFn: (dto: CreateLocalizacaoDTO) => editing ? localizacaoService.update(editing.id, dto) : localizacaoService.create(dto),
    onSuccess: () => {
      toast.success(editing ? "Localização actualizada" : "Localização criada");
      qc.invalidateQueries({ queryKey: ["localizacoes"] });
      setShowForm(false); setEditing(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => localizacaoService.delete(id),
    onSuccess: () => { toast.success("Localização eliminada"); qc.invalidateQueries({ queryKey: ["localizacoes"] }); },
  });

  function armazemNome(id: string) {
    const a = armazens.find((x) => x.id === id);
    return a ? `${a.codigo} — ${a.nome}` : id;
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, armazem_id: armazemFiltro || armazens[0]?.id || "" });
    setShowForm(true);
  }
  function openEdit(l: Localizacao) {
    setEditing(l);
    setForm({ armazem_id: l.armazem_id, codigo: l.codigo, corredor: l.corredor || "", prateleira: l.prateleira || "", activo: l.activo });
    setShowForm(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Localizações</h1>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova localização
        </button>
      </div>

      <div className="flex gap-3">
        <select value={armazemFiltro} onChange={(e) => setArmazemFiltro(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
          <option value="">Todos os armazéns</option>
          {armazens.map((a) => <option key={a.id} value={a.id}>{a.codigo} — {a.nome}</option>)}
        </select>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Armazém</th>
              <th className="px-4 py-3">Corredor</th>
              <th className="px-4 py-3">Prateleira</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && localizacoes.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-mid/70">Nenhuma localização</td></tr>}
            {localizacoes.map((l) => (
              <tr key={l.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 font-mono text-sm">{l.codigo}</td>
                <td className="px-4 py-3 text-sm">{armazemNome(l.armazem_id)}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{l.corredor || "—"}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{l.prateleira || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${l.activo ? "bg-live-dim text-live" : "bg-surface text-ink-mid"}`}>
                    {l.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(l)} className="p-2 text-ink-mid/70 hover:text-ink"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm(`Eliminar localização "${l.codigo}"?`) && deleteMut.mutate(l.id)} className="p-2 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar localização" : "Nova localização"}>
        <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Armazém *</label>
            <select value={form.armazem_id} onChange={(e) => setForm({ ...form, armazem_id: e.target.value })} required
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>
              {armazens.map((a) => <option key={a.id} value={a.id}>{a.codigo} — {a.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Código *</label>
            <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required
              placeholder="Ex.: A-01-03" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Corredor</label>
              <input value={form.corredor || ""} onChange={(e) => setForm({ ...form, corredor: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prateleira</label>
              <input value={form.prateleira || ""} onChange={(e) => setForm({ ...form, prateleira: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.activo ?? true} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            <span className="text-sm">Activo</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={saveMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
