"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promocaoService, produtoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Tag, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import type { Promocao, CreatePromocaoDTO } from "@/shared/types";

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

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY_FORM: CreatePromocaoDTO = {
  produto_id: "", tipo: "percentual", valor: 10,
  data_inicio: new Date().toISOString(), data_fim: new Date(Date.now() + 7 * 86400000).toISOString(), activo: true,
};

export default function PromocoesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promocao | null>(null);
  const [form, setForm] = useState<CreatePromocaoDTO>(EMPTY_FORM);

  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list() });
  const { data: promocoes = [], isLoading } = useQuery({ queryKey: ["promocoes"], queryFn: () => promocaoService.list() });

  const saveMut = useMutation({
    mutationFn: (dto: CreatePromocaoDTO) => editing ? promocaoService.update(editing.id, dto) : promocaoService.create(dto),
    onSuccess: () => {
      toast.success(editing ? "Promoção actualizada" : "Promoção criada");
      qc.invalidateQueries({ queryKey: ["promocoes"] });
      setShowForm(false); setEditing(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => promocaoService.delete(id),
    onSuccess: () => { toast.success("Promoção eliminada"); qc.invalidateQueries({ queryKey: ["promocoes"] }); },
  });

  function produtoNome(id?: string | null) {
    if (!id) return "Categoria";
    const p = produtos.find((x) => x.id === id);
    return p ? `${p.nome} (${p.sku})` : id;
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }
  function openEdit(p: Promocao) {
    setEditing(p);
    setForm({
      produto_id: p.produto_id || "", categoria_id: p.categoria_id || undefined,
      tipo: p.tipo, valor: p.valor, data_inicio: p.data_inicio, data_fim: p.data_fim, activo: p.activo,
    });
    setShowForm(true);
  }

  function isVigente(p: Promocao) {
    const agora = new Date();
    return p.activo && new Date(p.data_inicio) <= agora && new Date(p.data_fim) >= agora;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Promoções</h1>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova promoção
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Produto/Categoria</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && promocoes.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-mid/70">Nenhuma promoção</td></tr>}
            {promocoes.map((p) => (
              <tr key={p.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 text-sm">{produtoNome(p.produto_id)}</td>
                <td className="px-4 py-3 text-sm">{p.tipo === "percentual" ? "Percentual" : "Valor fixo"}</td>
                <td className="px-4 py-3 text-sm tabular-nums">{p.tipo === "percentual" ? `${p.valor}%` : `${p.valor.toLocaleString("pt-AO")} Kz`}</td>
                <td className="px-4 py-3 text-xs text-ink-mid">
                  {new Date(p.data_inicio).toLocaleDateString("pt-PT")} — {new Date(p.data_fim).toLocaleDateString("pt-PT")}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${isVigente(p) ? "bg-live-dim text-live" : "bg-surface text-ink-mid"}`}>
                    {isVigente(p) ? "Vigente" : p.activo ? "Fora do período" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-2 text-ink-mid/70 hover:text-ink"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Eliminar promoção?") && deleteMut.mutate(p.id)} className="p-2 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar promoção" : "Nova promoção"}>
        <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Produto *</label>
            <select value={form.produto_id || ""} onChange={(e) => setForm({ ...form, produto_id: e.target.value })} required
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.sku})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="percentual">Percentual (%)</option>
                <option value="valor_fixo">Valor fixo (Kz)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <input type="number" step="0.01" min={0} value={form.valor} onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Início</label>
              <input type="datetime-local" value={toLocalInput(form.data_inicio)}
                onChange={(e) => setForm({ ...form, data_inicio: new Date(e.target.value).toISOString() })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim</label>
              <input type="datetime-local" value={toLocalInput(form.data_fim)}
                onChange={(e) => setForm({ ...form, data_fim: new Date(e.target.value).toISOString() })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.activo ?? true} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            <span className="text-sm">Activa</span>
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
