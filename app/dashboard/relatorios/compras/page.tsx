"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Truck, Package, Building2, Loader2 } from "lucide-react";
import { relatoriosComercialService } from "@/shared/services/relatorios-comercial.service";

type TabKey = "fornecedor" | "produto";

function formatAOA(valor: number) {
  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(valor);
}

export default function RelatorioComprasPage() {
  const [tab, setTab] = useState<TabKey>("fornecedor");

  const { data: porFornecedor = [], isLoading: l1 } = useQuery({
    queryKey: ["relatorio-compras-fornecedor"],
    queryFn: () => relatoriosComercialService.comprasPorFornecedor(),
    enabled: tab === "fornecedor",
  });
  const { data: porProduto = [], isLoading: l2 } = useQuery({
    queryKey: ["relatorio-compras-produto"],
    queryFn: () => relatoriosComercialService.comprasPorProduto(),
    enabled: tab === "produto",
  });

  const totalGeral = tab === "fornecedor"
    ? porFornecedor.reduce((s, f) => s + f.total, 0)
    : porProduto.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Truck className="h-6 w-6 text-ink dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Relatório de Compras</h1>
      </div>
      <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
        Pedidos de compra (não cancelados), agregados por fornecedor ou por produto.
      </p>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950 max-w-xs">
        <p className="text-xs text-blue-600 dark:text-blue-400">Total Comprado</p>
        <p className="mt-1 text-xl font-bold text-blue-900 dark:text-white">{formatAOA(totalGeral)}</p>
      </div>

      <div className="flex gap-2 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
        <button
          onClick={() => setTab("fornecedor")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "fornecedor" ? "border-ink text-ink dark:text-white dark:border-white" : "border-transparent text-ink-mid/70"}`}
        >
          <Building2 className="h-4 w-4" /> Por Fornecedor
        </button>
        <button
          onClick={() => setTab("produto")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "produto" ? "border-ink text-ink dark:text-white dark:border-white" : "border-transparent text-ink-mid/70"}`}
        >
          <Package className="h-4 w-4" /> Por Produto
        </button>
      </div>

      {tab === "fornecedor" && (
        <div className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel">
          {l1 && <div className="flex items-center gap-2 p-6 text-sm text-ink-mid/70"><Loader2 className="h-4 w-4 animate-spin" /> A carregar…</div>}
          {!l1 && porFornecedor.length === 0 && <p className="p-6 text-center text-sm text-ink-mid/70">Sem pedidos de compra.</p>}
          {!l1 && porFornecedor.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/40 bg-surface dark:border-gray-700 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Fornecedor</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Nº Pedidos</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
                {porFornecedor.map((f) => (
                  <tr key={f.fornecedor_id} className="hover:bg-surface dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-ink dark:text-white">{f.fornecedor_nome}</td>
                    <td className="px-4 py-3 text-right text-ink-mid dark:text-gray-300">{f.n_pedidos}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white">{formatAOA(f.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "produto" && (
        <div className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel">
          {l2 && <div className="flex items-center gap-2 p-6 text-sm text-ink-mid/70"><Loader2 className="h-4 w-4 animate-spin" /> A carregar…</div>}
          {!l2 && porProduto.length === 0 && <p className="p-6 text-center text-sm text-ink-mid/70">Sem pedidos de compra.</p>}
          {!l2 && porProduto.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/40 bg-surface dark:border-gray-700 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Produto</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Quantidade</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
                {porProduto.map((p) => (
                  <tr key={p.produto_id} className="hover:bg-surface dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-ink dark:text-white">{p.produto_nome}</td>
                    <td className="px-4 py-3 text-right text-ink-mid dark:text-gray-300">{p.quantidade.toLocaleString("pt-AO")}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white">{formatAOA(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
