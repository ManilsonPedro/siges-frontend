"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Package, Users, Loader2 } from "lucide-react";
import { relatoriosComercialService } from "@/shared/services/relatorios-comercial.service";

type TabKey = "produto" | "cliente";

function formatAOA(valor: number) {
  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(valor);
}

export default function RelatorioVendasPage() {
  const [tab, setTab] = useState<TabKey>("produto");

  const { data: porProduto = [], isLoading: l1 } = useQuery({
    queryKey: ["relatorio-vendas-produto"],
    queryFn: () => relatoriosComercialService.vendasPorProduto(),
    enabled: tab === "produto",
  });
  const { data: porCliente = [], isLoading: l2 } = useQuery({
    queryKey: ["relatorio-vendas-cliente"],
    queryFn: () => relatoriosComercialService.vendasPorCliente(),
    enabled: tab === "cliente",
  });

  const totalGeral = tab === "produto"
    ? porProduto.reduce((s, p) => s + p.total, 0)
    : porCliente.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-ink dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Relatório de Vendas</h1>
      </div>
      <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
        Vendas concluídas, agregadas por produto ou por cliente.
      </p>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950 max-w-xs">
        <p className="text-xs text-blue-600 dark:text-blue-400">Total Vendido</p>
        <p className="mt-1 text-xl font-bold text-blue-900 dark:text-white">{formatAOA(totalGeral)}</p>
      </div>

      <div className="flex gap-2 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
        <button
          onClick={() => setTab("produto")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "produto" ? "border-ink text-ink dark:text-white dark:border-white" : "border-transparent text-ink-mid/70"}`}
        >
          <Package className="h-4 w-4" /> Por Produto
        </button>
        <button
          onClick={() => setTab("cliente")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "cliente" ? "border-ink text-ink dark:text-white dark:border-white" : "border-transparent text-ink-mid/70"}`}
        >
          <Users className="h-4 w-4" /> Por Cliente
        </button>
      </div>

      {tab === "produto" && (
        <div className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel">
          {l1 && <div className="flex items-center gap-2 p-6 text-sm text-ink-mid/70"><Loader2 className="h-4 w-4 animate-spin" /> A carregar…</div>}
          {!l1 && porProduto.length === 0 && <p className="p-6 text-center text-sm text-ink-mid/70">Sem vendas concluídas.</p>}
          {!l1 && porProduto.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/40 bg-surface dark:border-gray-700 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Produto</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Quantidade</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
                {porProduto.map((p) => (
                  <tr key={p.sku} className="hover:bg-surface dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-mono text-xs text-ink-mid dark:text-gray-300">{p.sku}</td>
                    <td className="px-4 py-3 text-ink dark:text-white">{p.nome}</td>
                    <td className="px-4 py-3 text-right text-ink-mid dark:text-gray-300">{p.quantidade.toLocaleString("pt-AO")}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white">{formatAOA(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "cliente" && (
        <div className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel">
          {l2 && <div className="flex items-center gap-2 p-6 text-sm text-ink-mid/70"><Loader2 className="h-4 w-4 animate-spin" /> A carregar…</div>}
          {!l2 && porCliente.length === 0 && <p className="p-6 text-center text-sm text-ink-mid/70">Sem vendas concluídas com cliente associado.</p>}
          {!l2 && porCliente.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/40 bg-surface dark:border-gray-700 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Cliente</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Nº Vendas</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
                {porCliente.map((c) => (
                  <tr key={c.cliente_id} className="hover:bg-surface dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-ink dark:text-white">{c.cliente_nome}</td>
                    <td className="px-4 py-3 text-right text-ink-mid dark:text-gray-300">{c.n_vendas}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white">{formatAOA(c.total)}</td>
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
