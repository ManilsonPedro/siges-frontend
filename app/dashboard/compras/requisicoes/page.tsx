"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requisicaoService, produtoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Loader2, Plus, X, Trash2, Send } from "lucide-react";
import type { RequisicaoLinhaInDTO, EstadoRequisicao } from "@/shared/types";

const ESTADO_LABEL: Record<EstadoRequisicao, string> = {
  rascunho: "Rascunho",
  submetida: "Submetida",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
  convertida_pedido: "Convertida em Pedido",
};
const ESTADO_COLOR: Record<EstadoRequisicao, string> = {
  rascunho: "bg-surface text-ink-mid",
  submetida: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  aprovada: "bg-live-dim text-live",
  rejeitada: "bg-danger/10 text-danger",
  convertida_pedido: "bg-ink/10 text-ink",
};

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

export default function RequisicoesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [departamento, setDepartamento] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [linhas, setLinhas] = useState<RequisicaoLinhaInDTO[]>([{ produto_id: "", quantidade: 1 }]);

  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list() });
  const { data: requisicoes = [], isLoading } = useQuery({ queryKey: ["requisicoes"], queryFn: () => requisicaoService.list() });

  const createMut = useMutation({
    mutationFn: () => requisicaoService.create({ departamento, justificativa, linhas: linhas.filter((l) => l.produto_id) }),
    onSuccess: () => {
      toast.success("Requisição criada (rascunho)");
      qc.invalidateQueries({ queryKey: ["requisicoes"] });
      setShowForm(false); setDepartamento(""); setJustificativa(""); setLinhas([{ produto_id: "", quantidade: 1 }]);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const submeterMut = useMutation({
    mutationFn: (id: string) => requisicaoService.submeter(id),
    onSuccess: () => { toast.success("Requisição submetida para aprovação"); qc.invalidateQueries({ queryKey: ["requisicoes"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  function produtoNome(id?: string | null) {
    if (!id) return "—";
    const p = produtos.find((x) => x.id === id);
    return p ? `${p.nome} (${p.sku})` : id;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Requisições de Compra</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova requisição
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Linhas</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && requisicoes.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhuma requisição</td></tr>}
            {requisicoes.map((r) => (
              <tr key={r.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 text-sm">{r.departamento || "—"}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">
                  {r.linhas.map((l) => `${produtoNome(l.produto_id)} × ${l.quantidade}`).join(", ")}
                </td>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(r.data).toLocaleDateString("pt-PT")}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[r.estado]}`}>{ESTADO_LABEL[r.estado]}</span>
                  {r.estado === "rejeitada" && r.motivo_rejeicao && (
                    <p className="text-xs text-danger mt-1">{r.motivo_rejeicao}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.estado === "rascunho" && (
                    <button onClick={() => submeterMut.mutate(r.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      <Send className="h-3.5 w-3.5" /> Submeter
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova requisição">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <input value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Justificativa</label>
            <textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Linhas</label>
            <div className="space-y-2">
              {linhas.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <select value={l.produto_id || ""} onChange={(e) => {
                    const novas = [...linhas]; novas[i] = { ...novas[i], produto_id: e.target.value }; setLinhas(novas);
                  }} className="flex-1 border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                    <option value="">Produto…</option>
                    {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.sku})</option>)}
                  </select>
                  <input type="number" min={1} step="0.001" value={l.quantidade} onChange={(e) => {
                    const novas = [...linhas]; novas[i] = { ...novas[i], quantidade: parseFloat(e.target.value) || 1 }; setLinhas(novas);
                  }} className="w-24 border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                  <button type="button" onClick={() => setLinhas(linhas.filter((_, j) => j !== i))} className="p-2 text-ink-mid/70 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setLinhas([...linhas, { produto_id: "", quantidade: 1 }])}
              className="mt-2 text-xs text-ink hover:underline">+ Adicionar linha</button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
