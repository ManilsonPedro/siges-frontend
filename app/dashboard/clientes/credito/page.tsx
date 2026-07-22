"use client";

import { CreditCard, AlertTriangle, CheckCircle, Database, TrendingDown } from "lucide-react";

const CLIENTES_CREDITO = [
  {
    id: "C001",
    nome: "Hospital Geral de Luanda",
    tipo: "Hospital",
    limiteTotal: 5_000_000,
    utilizado: 3_850_000,
    diasAtraso: 0,
  },
  {
    id: "C002",
    nome: "Hotel Presidente Luanda",
    tipo: "Hotel",
    limiteTotal: 3_000_000,
    utilizado: 2_580_000,
    diasAtraso: 12,
  },
  {
    id: "C003",
    nome: "Distribuidora Maianga Lda",
    tipo: "Distribuidor",
    limiteTotal: 20_000_000,
    utilizado: 8_400_000,
    diasAtraso: 0,
  },
  {
    id: "C004",
    nome: "Clínica Sagrada Esperança",
    tipo: "Hospital",
    limiteTotal: 2_500_000,
    utilizado: 2_250_000,
    diasAtraso: 22,
  },
  {
    id: "C005",
    nome: "Supermercado Nosso Super Viana",
    tipo: "Distribuidor",
    limiteTotal: 10_000_000,
    utilizado: 9_600_000,
    diasAtraso: 7,
  },
  {
    id: "C006",
    nome: "Hotel Intercontinental Luanda",
    tipo: "Hotel",
    limiteTotal: 4_000_000,
    utilizado: 1_200_000,
    diasAtraso: 0,
  },
  {
    id: "C007",
    nome: "Centro de Saúde Kilamba",
    tipo: "Hospital",
    limiteTotal: 1_000_000,
    utilizado: 420_000,
    diasAtraso: 0,
  },
  {
    id: "C008",
    nome: "Armazém Catete Comércio Geral",
    tipo: "Distribuidor",
    limiteTotal: 8_000_000,
    utilizado: 7_800_000,
    diasAtraso: 35,
  },
];

function formatAOA(valor: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  }).format(valor);
}

function getPctUtil(utilizado: number, limite: number) {
  return Math.min(100, Math.round((utilizado / limite) * 100));
}

function getBarColor(pct: number) {
  if (pct >= 80) return "bg-danger";
  if (pct >= 60) return "bg-amber";
  return "bg-live";
}

function getRowAccent(pct: number, diasAtraso: number) {
  if (diasAtraso > 20 || pct >= 95) return "bg-red-50/50 dark:bg-red-950/20";
  if (pct >= 80 || diasAtraso > 5) return "bg-amber-50/50 dark:bg-amber-950/20";
  return "";
}

export default function CreditoPage() {
  const clientesAlerta = CLIENTES_CREDITO.filter(
    (c) => getPctUtil(c.utilizado, c.limiteTotal) >= 80 || c.diasAtraso > 0
  ).length;
  const clientesOK = CLIENTES_CREDITO.length - clientesAlerta;
  const totalExposicao = CLIENTES_CREDITO.reduce((acc, c) => acc + c.utilizado, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Banner Primavera */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/40">
        <Database className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Dados sincronizados do Primavera ERP — apenas leitura
        </span>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Limite de Crédito
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Primavera
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Exposição de crédito e situação de cobranças — Aquasan Angola · Junho 2026
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
              <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total Exposto</p>
              <p className="text-lg font-bold text-ink dark:text-white">
                {formatAOA(totalExposicao)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-danger/10 p-2 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-danger dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Clientes em Alerta</p>
              <p className="text-lg font-bold text-danger dark:text-red-400">
                {clientesAlerta} clientes
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-live dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Clientes Regulares</p>
              <p className="text-lg font-bold text-live dark:text-green-400">
                {clientesOK} clientes
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
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  Limite Concedido
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  Utilizado
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  Disponível
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-ink-mid dark:text-gray-300">
                  Utilização
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-ink-mid dark:text-gray-300">
                  Dias em Atraso
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
              {CLIENTES_CREDITO.map((cliente) => {
                const pct = getPctUtil(cliente.utilizado, cliente.limiteTotal);
                const disponivel = cliente.limiteTotal - cliente.utilizado;
                const rowClass = getRowAccent(pct, cliente.diasAtraso);

                return (
                  <tr
                    key={cliente.id}
                    className={`transition-colors hover:bg-surface dark:hover:bg-gray-700/30 ${rowClass}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink dark:text-white">{cliente.nome}</div>
                      <div className="text-xs text-ink-mid/50">{cliente.tipo}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      {formatAOA(cliente.limiteTotal)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white">
                      {formatAOA(cliente.utilizado)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          disponivel <= 0
                            ? "font-semibold text-danger dark:text-red-400"
                            : "text-gray-700 dark:text-gray-300"
                        }
                      >
                        {formatAOA(disponivel)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-1 min-w-[120px]">
                        <div className="flex w-full items-center justify-between text-xs">
                          <span
                            className={
                              pct >= 80
                                ? "font-bold text-danger dark:text-red-400"
                                : "text-ink-mid/70 dark:text-ink-mid/60"
                            }
                          >
                            {pct}%
                          </span>
                          {pct >= 80 && (
                            <TrendingDown className="h-3.5 w-3.5 text-danger" />
                          )}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-ghost/30 dark:bg-ink-ghost/20">
                          <div
                            className={`h-2 rounded-full transition-all ${getBarColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cliente.diasAtraso === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-live dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" /> Em dia
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            cliente.diasAtraso > 20
                              ? "bg-danger/10 text-danger dark:bg-red-900/30 dark:text-red-400"
                              : "bg-amber/15 text-amber dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {cliente.diasAtraso} dias
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-ink-mid/70 dark:text-ink-mid/60">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-5 rounded-full bg-green-500" />
          <span>Normal (&lt; 60%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-5 rounded-full bg-amber" />
          <span>Atenção (60–79%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-5 rounded-full bg-danger" />
          <span>Crítico (≥ 80%)</span>
        </div>
      </div>
    </div>
  );
}
