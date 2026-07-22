"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pedidoCompraService, recepcaoService, armazemService, produtoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { PackageCheck, Loader2, X } from "lucide-react";
import type { PedidoCompra } from "@/shared/types";

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

export default function RecepcaoPage() {
  const qc = useQueryClient();
  const [receiving, setReceiving] = useState<PedidoCompra | null>(null);
  const [armazemId, setArmazemId] = useState("");
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});

  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list() });
  const { data: armazens = [] } = useQuery({ queryKey: ["armazens"], queryFn: armazemService.list });
  const { data: pendentes = [], isLoading } = useQuery({
    queryKey: ["pedidos-compra", "pendentes-recepcao"],
    queryFn: async () => {
      const [confirmados, parciais] = await Promise.all([
        pedidoCompraService.list({ estado: "confirmado" }),
        pedidoCompraService.list({ estado: "parcialmente_recebido" }),
      ]);
      return [...confirmados, ...parciais];
    },
  });

  const criarConfirmarMut = useMutation({
    mutationFn: async () => {
      const linhasPendentes = receiving!.linhas.filter((l) => l.quantidade_recebida < l.quantidade);
      const linhas = linhasPendentes
        .map((l) => ({ pedido_linha_id: l.id, quantidade_recebida: parseFloat(quantidades[l.id] || "0") }))
        .filter((l) => l.quantidade_recebida > 0);
      if (linhas.length === 0) throw new Error("Indique pelo menos uma quantidade recebida");
      const rec = await recepcaoService.create({ pedido_id: receiving!.id, armazem_id: armazemId, linhas });
      return recepcaoService.confirmar(rec.id);
    },
    onSuccess: () => {
      toast.success("Receção confirmada — stock actualizado");
      qc.invalidateQueries({ queryKey: ["pedidos-compra"] });
      qc.invalidateQueries({ queryKey: ["estoque"] });
      setReceiving(null); setQuantidades({});
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || e?.message || "Erro"),
  });

  function produtoNome(id: string) {
    const p = produtos.find((x) => x.id === id);
    return p ? `${p.nome} (${p.sku})` : id;
  }

  function openReceber(p: PedidoCompra) {
    setReceiving(p);
    setArmazemId(armazens[0]?.id || "");
    setQuantidades({});
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <PackageCheck className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Receção de Mercadoria</h1>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Linhas pendentes</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && pendentes.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhum pedido pendente de receção</td></tr>}
            {pendentes.map((p) => {
              const pendentesLinhas = p.linhas.filter((l) => l.quantidade_recebida < l.quantidade);
              return (
                <tr key={p.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                  <td className="px-4 py-3 font-mono text-sm">{p.numero}</td>
                  <td className="px-4 py-3 text-sm text-ink-mid">
                    {pendentesLinhas.map((l) => `${produtoNome(l.produto_id)} (${l.quantidade - l.quantidade_recebida} pendente)`).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      {p.estado === "confirmado" ? "Aguarda receção" : "Parcialmente recebido"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openReceber(p)} className="text-xs px-3 py-1.5 bg-ink text-white rounded-lg hover:bg-ink/90">
                      Registar receção
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!receiving} onClose={() => setReceiving(null)} title={receiving ? `Receção — ${receiving.numero}` : ""}>
        {receiving && (
          <form onSubmit={(e) => { e.preventDefault(); criarConfirmarMut.mutate(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Armazém de destino *</label>
              <select value={armazemId} onChange={(e) => setArmazemId(e.target.value)} required
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="">Seleccionar…</option>
                {armazens.map((a) => <option key={a.id} value={a.id}>{a.codigo} — {a.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantidades recebidas</label>
              <div className="space-y-2">
                {receiving.linhas.filter((l) => l.quantidade_recebida < l.quantidade).map((l) => (
                  <div key={l.id} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">
                      {produtoNome(l.produto_id)} <span className="text-ink-mid/70">(pendente: {l.quantidade - l.quantidade_recebida})</span>
                    </span>
                    <input type="number" step="0.001" min="0" max={l.quantidade - l.quantidade_recebida}
                      value={quantidades[l.id] || ""}
                      onChange={(e) => setQuantidades({ ...quantidades, [l.id]: e.target.value })}
                      className="w-28 border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setReceiving(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={criarConfirmarMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
                {criarConfirmarMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar receção"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
