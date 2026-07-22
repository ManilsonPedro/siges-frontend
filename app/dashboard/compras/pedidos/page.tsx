"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requisicaoService, pedidoCompraService, fornecedorService, produtoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Loader2, X, PackageCheck } from "lucide-react";
import type { EstadoPedidoCompra, Requisicao } from "@/shared/types";

const ESTADO_LABEL: Record<EstadoPedidoCompra, string> = {
  enviado: "Enviado",
  confirmado: "Confirmado",
  parcialmente_recebido: "Parcialmente Recebido",
  recebido: "Recebido",
  cancelado: "Cancelado",
};
const ESTADO_COLOR: Record<EstadoPedidoCompra, string> = {
  enviado: "bg-surface text-ink-mid",
  confirmado: "bg-ink/10 text-ink",
  parcialmente_recebido: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  recebido: "bg-live-dim text-live",
  cancelado: "bg-danger/10 text-danger",
};

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 sticky top-0 bg-panel">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function PedidosPage() {
  const qc = useQueryClient();
  const [converting, setConverting] = useState<Requisicao | null>(null);
  const [fornecedorId, setFornecedorId] = useState("");
  const [numero, setNumero] = useState("");
  const [precos, setPrecos] = useState<Record<string, string>>({});

  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list() });
  const { data: fornecedores = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: fornecedorService.list });
  const { data: aprovadas = [] } = useQuery({ queryKey: ["requisicoes", "aprovada"], queryFn: () => requisicaoService.list("aprovada") });
  const { data: pedidos = [], isLoading } = useQuery({ queryKey: ["pedidos-compra"], queryFn: () => pedidoCompraService.list() });

  const converterMut = useMutation({
    mutationFn: () => {
      const precos_unitarios: Record<string, number> = {};
      for (const [k, v] of Object.entries(precos)) precos_unitarios[k] = parseFloat(v) || 0;
      return requisicaoService.converterPedido(converting!.id, { fornecedor_id: fornecedorId, numero, precos_unitarios });
    },
    onSuccess: () => {
      toast.success("Pedido de compra criado");
      qc.invalidateQueries({ queryKey: ["requisicoes"] });
      qc.invalidateQueries({ queryKey: ["pedidos-compra"] });
      setConverting(null); setFornecedorId(""); setNumero(""); setPrecos({});
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const confirmarMut = useMutation({
    mutationFn: (id: string) => pedidoCompraService.confirmar(id),
    onSuccess: () => { toast.success("Pedido confirmado"); qc.invalidateQueries({ queryKey: ["pedidos-compra"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  function produtoNome(id: string) {
    const p = produtos.find((x) => x.id === id);
    return p ? `${p.nome} (${p.sku})` : id;
  }
  function fornecedorNome(id: string) {
    const f = fornecedores.find((x) => x.id === id);
    return f ? f.nome : id;
  }

  function openConverter(r: Requisicao) {
    setConverting(r);
    setNumero(`PC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`);
    setPrecos({});
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Pedidos de Compra</h1>
      </div>

      {aprovadas.length > 0 && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Requisições aprovadas por converter</h2>
          <div className="space-y-2">
            {aprovadas.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-ink-ghost/40 dark:border-ink-ghost/15 pb-2 last:border-0">
                <div className="text-sm">
                  <span className="font-medium">{r.departamento || "Sem departamento"}</span>
                  <span className="text-ink-mid"> — {r.linhas.length} linha(s)</span>
                </div>
                <button onClick={() => openConverter(r)} className="text-xs px-3 py-1.5 bg-ink text-white rounded-lg hover:bg-ink/90">
                  Converter em pedido
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && pedidos.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhum pedido de compra</td></tr>}
            {pedidos.map((p) => (
              <tr key={p.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 font-mono text-sm">{p.numero}</td>
                <td className="px-4 py-3 text-sm">{fornecedorNome(p.fornecedor_id)}</td>
                <td className="px-4 py-3 text-sm tabular-nums">{p.total.toLocaleString("pt-AO")} Kz</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[p.estado]}`}>{ESTADO_LABEL[p.estado]}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.estado === "enviado" && (
                    <button onClick={() => confirmarMut.mutate(p.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      <PackageCheck className="h-3.5 w-3.5" /> Confirmar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!converting} onClose={() => setConverting(null)} title="Converter requisição em pedido">
        {converting && (
          <form onSubmit={(e) => { e.preventDefault(); converterMut.mutate(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fornecedor *</label>
              <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} required
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="">Seleccionar…</option>
                {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número do pedido *</label>
              <input value={numero} onChange={(e) => setNumero(e.target.value)} required
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preços unitários</label>
              <div className="space-y-2">
                {converting.linhas.filter((l) => l.produto_id).map((l) => (
                  <div key={l.id} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{produtoNome(l.produto_id!)} × {l.quantidade}</span>
                    <input type="number" step="0.01" min="0" placeholder="Preço unit."
                      value={precos[l.produto_id!] || ""}
                      onChange={(e) => setPrecos({ ...precos, [l.produto_id!]: e.target.value })}
                      required className="w-28 border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setConverting(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={converterMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
                {converterMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar pedido"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
