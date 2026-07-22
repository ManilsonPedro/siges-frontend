"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecommerceService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Globe, Loader2 } from "lucide-react";
import type { EstadoPedidoOnline } from "@/shared/types";

const ESTADO_LABEL: Record<EstadoPedidoOnline, string> = {
  pendente_pagamento: "Pendente Pagamento",
  pago: "Pago",
  em_preparacao: "Em Preparação",
  pronto: "Pronto",
  em_entrega: "Em Entrega",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
const ESTADO_COLOR: Record<EstadoPedidoOnline, string> = {
  pendente_pagamento: "bg-surface text-ink-mid",
  pago: "bg-ink/10 text-ink",
  em_preparacao: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  pronto: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  em_entrega: "bg-ink/10 text-ink",
  concluido: "bg-live-dim text-live",
  cancelado: "bg-danger/10 text-danger",
};

const ESTADOS_SEGUINTES: Record<string, string[]> = {
  pendente_pagamento: ["pago", "cancelado"],
  pago: ["em_preparacao", "cancelado"],
  em_preparacao: ["pronto", "cancelado"],
  pronto: ["em_entrega", "concluido", "cancelado"],
  em_entrega: ["concluido", "cancelado"],
};

export default function PedidosOnlinePage() {
  const qc = useQueryClient();
  const [filtroEstado, setFiltroEstado] = useState("");

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ["pedidos-online", filtroEstado],
    queryFn: () => ecommerceService.listPedidos(filtroEstado || undefined),
  });

  const atualizarMut = useMutation({
    mutationFn: (vars: { id: string; estado: string }) => ecommerceService.atualizarEstado(vars.id, vars.estado),
    onSuccess: () => { toast.success("Estado actualizado"); qc.invalidateQueries({ queryKey: ["pedidos-online"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Pedidos Online</h1>
      </div>

      <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
        <option value="">Todos os estados</option>
        {Object.entries(ESTADO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && pedidos.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhum pedido online</td></tr>}
            {pedidos.map((p) => (
              <tr key={p.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 font-mono text-sm">{p.numero}</td>
                <td className="px-4 py-3 text-sm">{p.metodo_entrega === "delivery" ? "Delivery" : "Click & Collect"}</td>
                <td className="px-4 py-3 text-sm tabular-nums">{p.total.toLocaleString("pt-AO")} Kz</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[p.estado]}`}>{ESTADO_LABEL[p.estado]}</span>
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  {(ESTADOS_SEGUINTES[p.estado] || []).map((prox) => (
                    <button key={prox} onClick={() => atualizarMut.mutate({ id: p.id, estado: prox })}
                      className="text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      {ESTADO_LABEL[prox as EstadoPedidoOnline]}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
