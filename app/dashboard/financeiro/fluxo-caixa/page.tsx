"use client";

import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle, Database } from "lucide-react";

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

const dadosMensais = [
  { mes: "Janeiro", saldoInicial: 12_450_000, entradas: 38_720_000, saidas: 29_340_000, saldoFinal: 21_830_000 },
  { mes: "Fevereiro", saldoInicial: 21_830_000, entradas: 42_150_000, saidas: 33_870_000, saldoFinal: 30_110_000 },
  { mes: "Março", saldoInicial: 30_110_000, entradas: 55_480_000, saidas: 41_200_000, saldoFinal: 44_390_000 },
  { mes: "Abril", saldoInicial: 44_390_000, entradas: 49_600_000, saidas: 38_950_000, saldoFinal: 55_040_000 },
  { mes: "Maio", saldoInicial: 55_040_000, entradas: 61_230_000, saidas: 45_780_000, saldoFinal: 70_490_000 },
  { mes: "Junho", saldoInicial: 70_490_000, entradas: 58_900_000, saidas: 52_310_000, saldoFinal: 77_080_000 },
];

const maxValor = Math.max(...dadosMensais.flatMap((d) => [d.entradas, d.saidas]));

function formatAOA(valor: number) {
  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(valor);
}

function BarraGrafico({ valor, max, cor }: { valor: number; max: number; cor: string }) {
  const altura = Math.round((valor / max) * 100);
  return (
    <div className="flex flex-col items-center gap-1" style={{ height: 120 }}>
      <div className="flex items-end" style={{ height: 100 }}>
        <div
          className={`w-8 rounded-t-md transition-all ${cor}`}
          style={{ height: `${altura}%` }}
          title={formatAOA(valor)}
        />
      </div>
    </div>
  );
}

export default function FluxoCaixaPage() {
  const ultimoMes = dadosMensais[dadosMensais.length - 1];
  const maiorEntrada = Math.max(...dadosMensais.map((d) => d.entradas));
  const maiorSaida = Math.max(...dadosMensais.map((d) => d.saidas));

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Fluxo de Caixa</h1>
          <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 mt-1">
            Movimentações financeiras — Janeiro a Junho 2026
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Database size={12} />
          Primavera ERP
        </span>
      </div>

      {/* Banner Primavera */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
        <Database size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          Dados sincronizados do Primavera ERP — apenas leitura
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-ink-mid/70 dark:text-ink-mid/60 font-medium">Saldo Actual</span>
            <Wallet size={18} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-ink dark:text-white">{formatAOA(ultimoMes.saldoFinal)}</p>
          <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 mt-1">Fim de Junho 2026</p>
        </div>

        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-ink-mid/70 dark:text-ink-mid/60 font-medium">Maior Entrada do Período</span>
            <ArrowUpCircle size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-live dark:text-emerald-400">{formatAOA(maiorEntrada)}</p>
          <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 mt-1">Maio 2026</p>
        </div>

        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-ink-mid/70 dark:text-ink-mid/60 font-medium">Maior Saída do Período</span>
            <ArrowDownCircle size={18} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-danger dark:text-red-400">{formatAOA(maiorSaida)}</p>
          <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 mt-1">Junho 2026</p>
        </div>
      </div>

      {/* Gráfico de Barras CSS Puro */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Entradas vs Saídas — Jan a Jun 2026
        </h2>
        <div className="flex items-end justify-around gap-2 border-b border-ink-ghost/60 dark:border-ink-ghost/20 pb-2">
          {dadosMensais.map((d, i) => (
            <div key={d.mes} className="flex flex-col items-center gap-1">
              <div className="flex items-end gap-1" style={{ height: 120 }}>
                <div className="flex flex-col items-center gap-1" style={{ height: 120 }}>
                  <div className="flex items-end" style={{ height: 100 }}>
                    <div
                      className="w-7 rounded-t-md bg-emerald-400 dark:bg-emerald-500"
                      style={{ height: `${Math.round((d.entradas / maxValor) * 100)}%` }}
                      title={`Entradas: ${formatAOA(d.entradas)}`}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1" style={{ height: 120 }}>
                  <div className="flex items-end" style={{ height: 100 }}>
                    <div
                      className="w-7 rounded-t-md bg-red-400 dark:bg-red-500"
                      style={{ height: `${Math.round((d.saidas / maxValor) * 100)}%` }}
                      title={`Saídas: ${formatAOA(d.saidas)}`}
                    />
                  </div>
                </div>
              </div>
              <span className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-1">{meses[i]}</span>
            </div>
          ))}
        </div>
        {/* Legenda */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-500" />
            <span className="text-xs text-ink-mid dark:text-gray-400">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-500" />
            <span className="text-xs text-ink-mid dark:text-gray-400">Saídas</span>
          </div>
        </div>
      </div>

      {/* Tabela de Detalhe Mensal */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Detalhe Mensal</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface dark:bg-ink-ghost/20">
                <th className="text-left px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Mês</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Saldo Inicial</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-live dark:text-emerald-400 uppercase tracking-wider">Entradas</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-danger dark:text-red-400 uppercase tracking-wider">Saídas</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Saldo Final</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Variação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {dadosMensais.map((d) => {
                const variacao = d.entradas - d.saidas;
                return (
                  <tr key={d.mes} className="hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink dark:text-white">{d.mes}</td>
                    <td className="px-6 py-4 text-right text-ink-mid dark:text-gray-400">{formatAOA(d.saldoInicial)}</td>
                    <td className="px-6 py-4 text-right text-live dark:text-emerald-400 font-medium">{formatAOA(d.entradas)}</td>
                    <td className="px-6 py-4 text-right text-danger dark:text-red-400 font-medium">{formatAOA(d.saidas)}</td>
                    <td className="px-6 py-4 text-right font-bold text-ink dark:text-white">{formatAOA(d.saldoFinal)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 font-semibold ${variacao >= 0 ? "text-live dark:text-emerald-400" : "text-danger dark:text-red-400"}`}>
                        {variacao >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {formatAOA(Math.abs(variacao))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface dark:bg-ink-ghost/20 font-semibold">
                <td className="px-6 py-4 text-ink dark:text-white">Total Acumulado</td>
                <td className="px-6 py-4 text-right text-ink-mid dark:text-gray-400">—</td>
                <td className="px-6 py-4 text-right text-live dark:text-emerald-400">
                  {formatAOA(dadosMensais.reduce((s, d) => s + d.entradas, 0))}
                </td>
                <td className="px-6 py-4 text-right text-danger dark:text-red-400">
                  {formatAOA(dadosMensais.reduce((s, d) => s + d.saidas, 0))}
                </td>
                <td className="px-6 py-4 text-right text-ink dark:text-white">{formatAOA(ultimoMes.saldoFinal)}</td>
                <td className="px-6 py-4 text-right text-live dark:text-emerald-400">
                  {formatAOA(dadosMensais.reduce((s, d) => s + (d.entradas - d.saidas), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
