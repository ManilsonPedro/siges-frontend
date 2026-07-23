"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, ShoppingBag, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { clienteService } from "@/shared/services/financeiro.service";

function formatAOA(valor: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  }).format(valor);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function HistoricoComercialPage() {
  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes-historico-comercial"],
    queryFn: () => clienteService.historicoComercialGeral(),
  });

  const totalGastoGeral = clientes.reduce((acc, c) => acc + c.total_gasto, 0);
  const totalComprasGeral = clientes.reduce((acc, c) => acc + c.total_compras, 0);
  const melhorCliente = clientes[0]; // já vem ordenado por total_gasto desc

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Histórico Comercial</h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Resumo de compras por cliente, a partir de vendas concluídas.
          </p>
        </div>
        <span className="text-sm text-ink-mid/50 dark:text-ink-mid/40">
          {clientes.length} cliente{clientes.length === 1 ? "" : "s"} com compras
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-ink-mid/70">
          <Loader2 className="h-4 w-4 animate-spin" /> A carregar histórico…
        </div>
      )}

      {!isLoading && clientes.length === 0 && (
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-8 text-center text-sm text-ink-mid/70 dark:border-ink-ghost/20">
          Ainda não há vendas concluídas associadas a clientes.
        </div>
      )}

      {!isLoading && clientes.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                  <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Faturação Total</p>
                  <p className="text-lg font-bold text-ink dark:text-white">{formatAOA(totalGastoGeral)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <ShoppingBag className="h-5 w-5 text-live dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total de Compras</p>
                  <p className="text-lg font-bold text-ink dark:text-white">{totalComprasGeral} vendas</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber/15 p-2 dark:bg-amber-900/30">
                  <Building2 className="h-5 w-5 text-amber dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Melhor Cliente</p>
                  <p className="text-sm font-bold text-ink dark:text-white leading-tight">
                    {melhorCliente?.cliente_nome}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-ghost/40 bg-surface dark:border-gray-700 dark:bg-gray-700/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Cliente</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">N.º Compras</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Total Gasto</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Última Compra</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Produto Mais Comprado</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Qtd.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
                  {clientes.map((cliente) => (
                    <tr key={cliente.cliente_id} className="transition-colors hover:bg-surface dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink dark:text-white">{cliente.cliente_nome}</div>
                        {cliente.ultima_fatura && (
                          <div className="text-xs text-ink-mid/50">{cliente.ultima_fatura}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-ink dark:text-white">
                        {cliente.total_compras}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white">
                        {formatAOA(cliente.total_gasto)}
                      </td>
                      <td className="px-4 py-3">
                        {cliente.ultima_compra && (
                          <div className="flex items-center gap-1.5 text-ink-mid dark:text-gray-300">
                            <Calendar className="h-3.5 w-3.5 text-ink-mid/50" />
                            {formatDate(cliente.ultima_compra)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {cliente.produto_mais_comprado || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-mid dark:text-gray-300">
                        {cliente.qtd_produto_mais_comprado.toLocaleString("pt-AO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
