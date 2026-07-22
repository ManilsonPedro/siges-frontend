"use client";

import { useState } from "react";
import { BarChart3, Info, TrendingUp, TrendingDown, Minus, Download, Filter } from "lucide-react";

const CENTROS = ["CC001 – Produção NaOCl", "CC002 – Produção KITOKA", "CC003 – Logística", "CC004 – Administração", "CC005 – Comercial"];

const ANALISES = [
  {
    centro: "CC001 – Produção NaOCl",
    linhas: [
      { descricao: "Matérias-primas",           mesActual: 4990000, mesAnterior: 5120000, orcamento: 5000000 },
      { descricao: "Mão-de-obra directa",       mesActual: 2100000, mesAnterior: 2100000, orcamento: 2100000 },
      { descricao: "Energia eléctrica",         mesActual:  920000, mesAnterior: 1050000, orcamento: 1000000 },
      { descricao: "Amortizações",              mesActual:  650000, mesAnterior:  650000, orcamento:  650000 },
      { descricao: "Manutenção e reparações",   mesActual:  450000, mesAnterior:  180000, orcamento:  300000 },
    ],
  },
  {
    centro: "CC002 – Produção KITOKA",
    linhas: [
      { descricao: "Matérias-primas",           mesActual: 3310000, mesAnterior: 3450000, orcamento: 3400000 },
      { descricao: "Mão-de-obra directa",       mesActual: 1680000, mesAnterior: 1680000, orcamento: 1680000 },
      { descricao: "Energia eléctrica",         mesActual:  695000, mesAnterior:  810000, orcamento:  750000 },
      { descricao: "Amortizações",              mesActual:  420000, mesAnterior:  420000, orcamento:  420000 },
      { descricao: "Manutenção e reparações",   mesActual:  310000, mesAnterior:   95000, orcamento:  200000 },
    ],
  },
  {
    centro: "CC003 – Logística",
    linhas: [
      { descricao: "Mão-de-obra directa",       mesActual: 1260000, mesAnterior: 1260000, orcamento: 1260000 },
      { descricao: "Combustíveis",              mesActual:  870000, mesAnterior:  950000, orcamento:  900000 },
      { descricao: "Amortizações viaturas",     mesActual:  380000, mesAnterior:  380000, orcamento:  380000 },
      { descricao: "Seguros",                   mesActual:  145000, mesAnterior:  145000, orcamento:  145000 },
    ],
  },
  {
    centro: "CC004 – Administração",
    linhas: [
      { descricao: "Remunerações administrativas", mesActual: 3850000, mesAnterior: 3850000, orcamento: 3850000 },
      { descricao: "Encargos sociais",          mesActual:  770000, mesAnterior:  770000, orcamento:  770000 },
      { descricao: "Comunicações",              mesActual:  330000, mesAnterior:  310000, orcamento:  320000 },
      { descricao: "Deslocações",               mesActual:  690000, mesAnterior:  420000, orcamento:  500000 },
    ],
  },
  {
    centro: "CC005 – Comercial",
    linhas: [
      { descricao: "Remunerações comerciais",   mesActual: 2100000, mesAnterior: 2100000, orcamento: 2100000 },
      { descricao: "Publicidade",               mesActual:  520000, mesAnterior:  380000, orcamento:  450000 },
      { descricao: "Representação",             mesActual:  350000, mesAnterior:  290000, orcamento:  300000 },
      { descricao: "Comissões de vendas",       mesActual:  650000, mesAnterior:  720000, orcamento:  700000 },
    ],
  },
];

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(v);

const fmtPct = (v: number) => (v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`);

const desvPct = (actual: number, ref: number) =>
  ref === 0 ? 0 : ((actual - ref) / ref) * 100;

function DesvioChip({ valor, pct }: { valor: number; pct: number }) {
  if (Math.abs(pct) < 1) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-mid dark:bg-gray-700 dark:text-ink-mid/50">
        <Minus className="h-3 w-3" /> {fmtPct(pct)}
      </span>
    );
  }
  const over = pct > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        over
          ? "bg-danger/8 text-danger dark:bg-red-900/40 dark:text-red-300"
          : "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      }`}
    >
      {over ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {fmtPct(pct)}
    </span>
  );
}

export default function AnalisesContabilisticasPage() {
  const [centroSel, setCentroSel] = useState("todos");

  const dadosFiltrados =
    centroSel === "todos" ? ANALISES : ANALISES.filter((a) => a.centro === centroSel);

  const totalActual = dadosFiltrados.flatMap((a) => a.linhas).reduce((s, l) => s + l.mesActual, 0);
  const totalAnterior = dadosFiltrados.flatMap((a) => a.linhas).reduce((s, l) => s + l.mesAnterior, 0);
  const totalOrc = dadosFiltrados.flatMap((a) => a.linhas).reduce((s, l) => s + l.orcamento, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Banner Primavera */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <Info className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">
          Dados sincronizados do Primavera ERP — apenas leitura
        </span>
        <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold dark:bg-blue-900">
          Primavera
        </span>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-ink dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Análises Contabilísticas
            </h1>
          </div>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Comparativo: Março 2026 vs Fevereiro 2026 vs Orçamento — Aquasan Angola
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-ink-ghost/60 bg-panel px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-surface dark:border-gray-700 dark:bg-panel dark:text-gray-200 dark:hover:bg-gray-700">
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-ink-mid/50" />
        <span className="text-sm font-medium text-ink-mid dark:text-ink-mid/60">Centro:</span>
        <select
          value={centroSel}
          onChange={(e) => setCentroSel(e.target.value)}
          className="rounded-lg border border-ink-ghost/60 bg-panel px-3 py-1.5 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-panel dark:text-gray-200"
        >
          <option value="todos">Todos os centros</option>
          {CENTROS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* KPIs sumários */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-ghost/40 bg-panel p-5 shadow-sm dark:border-gray-700 dark:bg-panel">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
            Março 2026 (Actual)
          </p>
          <p className="mt-2 text-2xl font-bold text-ink dark:text-white">{fmt(totalActual)}</p>
          <div className="mt-1">
            <DesvioChip valor={totalActual - totalAnterior} pct={desvPct(totalActual, totalAnterior)} />
            <span className="ml-1 text-xs text-ink-mid/70">vs mês anterior</span>
          </div>
        </div>
        <div className="rounded-xl border border-ink-ghost/40 bg-panel p-5 shadow-sm dark:border-gray-700 dark:bg-panel">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
            Fevereiro 2026 (Anterior)
          </p>
          <p className="mt-2 text-2xl font-bold text-ink dark:text-white">{fmt(totalAnterior)}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/40 bg-panel p-5 shadow-sm dark:border-gray-700 dark:bg-panel">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
            Orçamento Março 2026
          </p>
          <p className="mt-2 text-2xl font-bold text-ink dark:text-white">{fmt(totalOrc)}</p>
          <div className="mt-1">
            <DesvioChip valor={totalActual - totalOrc} pct={desvPct(totalActual, totalOrc)} />
            <span className="ml-1 text-xs text-ink-mid/70">vs orçamento</span>
          </div>
        </div>
      </div>

      {/* Tabelas por centro */}
      <div className="space-y-6">
        {dadosFiltrados.map((bloco) => {
          const totActual = bloco.linhas.reduce((s, l) => s + l.mesActual, 0);
          const totAnt = bloco.linhas.reduce((s, l) => s + l.mesAnterior, 0);
          const totOrc = bloco.linhas.reduce((s, l) => s + l.orcamento, 0);

          return (
            <div
              key={bloco.centro}
              className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel shadow-sm dark:border-gray-700 dark:bg-panel"
            >
              <div className="border-b border-ink-ghost/40 bg-surface px-5 py-3 dark:border-gray-700 dark:bg-gray-700/50">
                <h2 className="font-semibold text-ink dark:text-white">{bloco.centro}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50/60 dark:bg-gray-700/30">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                        Rubrica
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                        Mar 2026
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                        Fev 2026
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                        Δ vs Ant.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                        Orçamento
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                        Δ vs Orc.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
                    {bloco.linhas.map((linha) => (
                      <tr key={linha.descricao} className="hover:bg-surface dark:hover:bg-gray-700/30">
                        <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{linha.descricao}</td>
                        <td className="px-4 py-3 text-right font-medium text-ink dark:text-white">
                          {fmt(linha.mesActual)}
                        </td>
                        <td className="px-4 py-3 text-right text-ink-mid dark:text-ink-mid/50">
                          {fmt(linha.mesAnterior)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DesvioChip
                            valor={linha.mesActual - linha.mesAnterior}
                            pct={desvPct(linha.mesActual, linha.mesAnterior)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-ink-mid dark:text-ink-mid/50">
                          {fmt(linha.orcamento)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DesvioChip
                            valor={linha.mesActual - linha.orcamento}
                            pct={desvPct(linha.mesActual, linha.orcamento)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-ink-ghost/60 bg-surface dark:border-gray-600 dark:bg-gray-700/50">
                    <tr>
                      <td className="px-5 py-3 font-bold text-ink dark:text-white">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-ink dark:text-blue-300">
                        {fmt(totActual)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">
                        {fmt(totAnt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <DesvioChip valor={totActual - totAnt} pct={desvPct(totActual, totAnt)} />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">
                        {fmt(totOrc)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <DesvioChip valor={totActual - totOrc} pct={desvPct(totActual, totOrc)} />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-mid/50 dark:text-gray-600">
        Última sincronização com Primavera ERP: 18/06/2026 às 08:30 • Período de análise: Março 2026
      </p>
    </div>
  );
}
