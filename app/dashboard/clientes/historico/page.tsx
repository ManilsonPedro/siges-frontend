"use client";

import { Building2, ShoppingBag, TrendingUp, Calendar, Database } from "lucide-react";

const CLIENTES_HISTORICO = [
  {
    id: "C001",
    nome: "Hospital Geral de Luanda",
    tipo: "Hospital",
    totalCompras: 12,
    totalGasto: 4_850_000,
    ultimaCompra: "2026-06-10",
    produtoMaisComprado: "Hipoclorito de Sódio 5L",
    qtdProduto: 480,
    ultimaFatura: "FT 2026/1142",
  },
  {
    id: "C002",
    nome: "Hotel Presidente Luanda",
    tipo: "Hotel",
    totalCompras: 9,
    totalGasto: 2_340_000,
    ultimaCompra: "2026-06-05",
    produtoMaisComprado: "Lixívia Multiuso 1L",
    qtdProduto: 1200,
    ultimaFatura: "FT 2026/1098",
  },
  {
    id: "C003",
    nome: "Distribuidora Maianga Lda",
    tipo: "Distribuidor",
    totalCompras: 24,
    totalGasto: 18_720_000,
    ultimaCompra: "2026-06-14",
    produtoMaisComprado: "Lixívia Multiuso 5L",
    qtdProduto: 3600,
    ultimaFatura: "FT 2026/1155",
  },
  {
    id: "C004",
    nome: "Clínica Sagrada Esperança",
    tipo: "Hospital",
    totalCompras: 7,
    totalGasto: 1_960_000,
    ultimaCompra: "2026-05-28",
    produtoMaisComprado: "Hipoclorito de Sódio 20L",
    qtdProduto: 96,
    ultimaFatura: "FT 2026/1021",
  },
  {
    id: "C005",
    nome: "Supermercado Nosso Super Viana",
    tipo: "Distribuidor",
    totalCompras: 18,
    totalGasto: 9_450_000,
    ultimaCompra: "2026-06-12",
    produtoMaisComprado: "Lixívia Multiuso 1L",
    qtdProduto: 5400,
    ultimaFatura: "FT 2026/1148",
  },
  {
    id: "C006",
    nome: "Hotel Intercontinental Luanda",
    tipo: "Hotel",
    totalCompras: 11,
    totalGasto: 3_120_000,
    ultimaCompra: "2026-06-08",
    produtoMaisComprado: "Hipoclorito de Sódio 5L",
    qtdProduto: 288,
    ultimaFatura: "FT 2026/1130",
  },
  {
    id: "C007",
    nome: "Centro de Saúde Kilamba",
    tipo: "Hospital",
    totalCompras: 5,
    totalGasto: 875_000,
    ultimaCompra: "2026-05-20",
    produtoMaisComprado: "Hipoclorito de Sódio 1L",
    qtdProduto: 350,
    ultimaFatura: "FT 2026/0987",
  },
  {
    id: "C008",
    nome: "Armazém Catete Comércio Geral",
    tipo: "Distribuidor",
    totalCompras: 15,
    totalGasto: 6_300_000,
    ultimaCompra: "2026-06-16",
    produtoMaisComprado: "Lixívia Multiuso 5L",
    qtdProduto: 1800,
    ultimaFatura: "FT 2026/1160",
  },
];

const TIPO_CORES: Record<string, string> = {
  Hospital: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Hotel: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Distribuidor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

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
  const totalGastoGeral = CLIENTES_HISTORICO.reduce((acc, c) => acc + c.totalGasto, 0);
  const totalComprasGeral = CLIENTES_HISTORICO.reduce((acc, c) => acc + c.totalCompras, 0);
  const melhorCliente = [...CLIENTES_HISTORICO].sort((a, b) => b.totalGasto - a.totalGasto)[0];

  return (
    <div className="space-y-6 p-6">
      {/* Aviso: dados de demonstração até o endpoint real ser ligado (ver PROMPT_SISTEMA_SIGES_SPRINTS.md, Sprint 1.1) */}
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
        <Database className="h-5 w-5 shrink-0 text-ink dark:text-amber-400" />
        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
          Dados de demonstração — ainda não ligado à base de dados real
        </span>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Histórico Comercial
            </h1>
          </div>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Resumo de compras por cliente · Exercício 2026
          </p>
        </div>
        <span className="text-sm text-ink-mid/50 dark:text-ink-mid/40">
          {CLIENTES_HISTORICO.length} clientes
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Faturação Total</p>
              <p className="text-lg font-bold text-ink dark:text-white">
                {formatAOA(totalGastoGeral)}
              </p>
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
              <p className="text-lg font-bold text-ink dark:text-white">
                {totalComprasGeral} encomendas
              </p>
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
                {melhorCliente.nome.split(" ").slice(0, 3).join(" ")}
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
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">
                  Cliente
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">
                  Tipo
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  N.º Compras
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  Total Gasto
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">
                  Última Compra
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">
                  Produto Mais Comprado
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  Qtd. Produto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
              {CLIENTES_HISTORICO.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="transition-colors hover:bg-surface dark:hover:bg-gray-700/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink dark:text-white">{cliente.nome}</div>
                    <div className="text-xs text-ink-mid/50">{cliente.ultimaFatura}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TIPO_CORES[cliente.tipo]}`}
                    >
                      {cliente.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-ink dark:text-white">
                    {cliente.totalCompras}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white">
                    {formatAOA(cliente.totalGasto)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-ink-mid dark:text-gray-300">
                      <Calendar className="h-3.5 w-3.5 text-ink-mid/50" />
                      {formatDate(cliente.ultimaCompra)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {cliente.produtoMaisComprado}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-mid dark:text-gray-300">
                    {cliente.qtdProduto.toLocaleString("pt-AO")} un.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
