"use client";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from "lucide-react";

interface LinhaConsumo {
  ordemProducao: string;
  produto: string;
  materiaPrima: string;
  unidade: string;
  qtdPrevista: number;
  qtdReal: number;
  custoUnitario: number;
  data: string;
}

const CONSUMOS: LinhaConsumo[] = [
  {
    ordemProducao: "OP-2026-0631",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Hipoclorito de Sódio 12%",
    unidade: "L",
    qtdPrevista: 2750,
    qtdReal: 2800,
    custoUnitario: 185,
    data: "15/06/2026",
  },
  {
    ordemProducao: "OP-2026-0631",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Surfactante aniónico",
    unidade: "kg",
    qtdPrevista: 32,
    qtdReal: 35,
    custoUnitario: 4200,
    data: "15/06/2026",
  },
  {
    ordemProducao: "OP-2026-0631",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Embalagem PEAD 5L",
    unidade: "un",
    qtdPrevista: 700,
    qtdReal: 700,
    custoUnitario: 380,
    data: "15/06/2026",
  },
  {
    ordemProducao: "OP-2026-0612",
    produto: "Hipoclorito de Sódio 20L",
    materiaPrima: "Cloro Gasoso 99%",
    unidade: "kg",
    qtdPrevista: 310,
    qtdReal: 320,
    custoUnitario: 6800,
    data: "10/06/2026",
  },
  {
    ordemProducao: "OP-2026-0612",
    produto: "Hipoclorito de Sódio 20L",
    materiaPrima: "Soda Cáustica NaOH 50%",
    unidade: "kg",
    qtdPrevista: 600,
    qtdReal: 580,
    custoUnitario: 1950,
    data: "10/06/2026",
  },
  {
    ordemProducao: "OP-2026-0612",
    produto: "Hipoclorito de Sódio 20L",
    materiaPrima: "Embalagem PEAD 20L",
    unidade: "un",
    qtdPrevista: 400,
    qtdReal: 400,
    custoUnitario: 650,
    data: "10/06/2026",
  },
  {
    ordemProducao: "OP-2026-0598",
    produto: "Lixívia Multiuso 1L",
    materiaPrima: "Hipoclorito de Sódio 12%",
    unidade: "L",
    qtdPrevista: 1200,
    qtdReal: 1190,
    custoUnitario: 185,
    data: "05/06/2026",
  },
  {
    ordemProducao: "OP-2026-0598",
    produto: "Lixívia Multiuso 1L",
    materiaPrima: "Embalagem PEAD 1L",
    unidade: "un",
    qtdPrevista: 1200,
    qtdReal: 1210,
    custoUnitario: 120,
    data: "05/06/2026",
  },
  {
    ordemProducao: "OP-2026-0585",
    produto: "Hipoclorito de Sódio 5L",
    materiaPrima: "Cloro Gasoso 99%",
    unidade: "kg",
    qtdPrevista: 180,
    qtdReal: 175,
    custoUnitario: 6800,
    data: "01/06/2026",
  },
  {
    ordemProducao: "OP-2026-0585",
    produto: "Hipoclorito de Sódio 5L",
    materiaPrima: "Soda Cáustica NaOH 50%",
    unidade: "kg",
    qtdPrevista: 300,
    qtdReal: 295,
    custoUnitario: 1950,
    data: "01/06/2026",
  },
];

function calcDesvio(previsto: number, real: number): number {
  return ((real - previsto) / previsto) * 100;
}

function formatAOA(val: number): string {
  return val.toLocaleString("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " AOA";
}

function DesvioCell({ desvio }: { desvio: number }) {
  const abs = Math.abs(desvio).toFixed(1);
  if (desvio > 2) {
    return (
      <span className="inline-flex items-center gap-1 text-danger dark:text-red-400 font-semibold text-xs">
        <TrendingUp className="h-3.5 w-3.5" />
        +{abs}%
      </span>
    );
  }
  if (desvio < -2) {
    return (
      <span className="inline-flex items-center gap-1 text-live dark:text-emerald-400 font-semibold text-xs">
        <TrendingDown className="h-3.5 w-3.5" />
        -{abs}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-ink-mid/70 dark:text-ink-mid/60 text-xs">
      <Minus className="h-3.5 w-3.5" />
      {desvio >= 0 ? "+" : ""}{desvio.toFixed(1)}%
    </span>
  );
}

export default function CustoConsumoPage() {
  const linhas = CONSUMOS.map((c) => ({
    ...c,
    custoReal: c.qtdReal * c.custoUnitario,
    custoPrevisto: c.qtdPrevista * c.custoUnitario,
    desvio: calcDesvio(c.qtdPrevista, c.qtdReal),
  }));

  const totalPrevisto = linhas.reduce((s, l) => s + l.custoPrevisto, 0);
  const totalReal = linhas.reduce((s, l) => s + l.custoReal, 0);
  const desvioTotal = calcDesvio(totalPrevisto, totalReal);

  // Agrupamento por OP
  const ops = Array.from(new Set(linhas.map((l) => l.ordemProducao)));

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-ink" />
            Custos de Consumo
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Consumo de matérias-primas por ordem de produção — comparativo previsto vs. real (Junho 2026).
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Novo
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — dados de demonstração. Integração com ordens de fabrico do Primavera prevista.
      </div>

      {/* KPIs do mês */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">Custo Previsto — Junho</p>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">{formatAOA(totalPrevisto)}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">Custo Real — Junho</p>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">{formatAOA(totalReal)}</p>
        </div>
        <div className={`rounded-xl border p-5 shadow-sm ${desvioTotal > 2 ? "border-danger/30 dark:border-red-800 bg-danger/8 dark:bg-red-900/20" : "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"}`}>
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">Desvio Total</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${desvioTotal > 2 ? "text-danger dark:text-red-300" : "text-live dark:text-emerald-300"}`}>
              {desvioTotal > 0 ? "+" : ""}{desvioTotal.toFixed(1)}%
            </p>
            <DollarSign className={`h-5 w-5 ${desvioTotal > 2 ? "text-danger" : "text-live"}`} />
          </div>
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-1">
            {desvioTotal > 0 ? "Acima" : "Abaixo"} do previsto em {formatAOA(Math.abs(totalReal - totalPrevisto))}
          </p>
        </div>
      </div>

      {/* Tabela agrupada por OP */}
      <div className="space-y-4">
        {ops.map((op) => {
          const linhasOp = linhas.filter((l) => l.ordemProducao === op);
          const totalOp = linhasOp.reduce((s, l) => s + l.custoReal, 0);
          const produto = linhasOp[0].produto;
          const data = linhasOp[0].data;

          return (
            <div key={op} className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
              {/* Header da OP */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-surface dark:bg-gray-800/50 px-5 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-ink dark:text-blue-300">{op}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{produto}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-ink-mid/70 dark:text-ink-mid/60">
                  <span>{data}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formatAOA(totalOp)}</span>
                </div>
              </div>

              {/* Linhas */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
                  <thead>
                    <tr className="text-xs text-ink-mid/70 dark:text-ink-mid/60">
                      <th className="px-5 py-2 text-left font-medium">Matéria-Prima</th>
                      <th className="px-4 py-2 text-center font-medium">Un.</th>
                      <th className="px-4 py-2 text-right font-medium">Qtd Prevista</th>
                      <th className="px-4 py-2 text-right font-medium">Qtd Real</th>
                      <th className="px-4 py-2 text-right font-medium">Custo Unitário</th>
                      <th className="px-4 py-2 text-right font-medium">Custo Total</th>
                      <th className="px-4 py-2 text-center font-medium">Desvio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-800/50">
                    {linhasOp.map((l, i) => (
                      <tr key={i} className="hover:bg-surface dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-5 py-2.5 text-gray-800 dark:text-gray-200 font-medium">{l.materiaPrima}</td>
                        <td className="px-4 py-2.5 text-center text-ink-mid/70 dark:text-ink-mid/60">{l.unidade}</td>
                        <td className="px-4 py-2.5 text-right text-ink-mid dark:text-gray-400">{l.qtdPrevista.toLocaleString("pt-AO")}</td>
                        <td className="px-4 py-2.5 text-right text-ink-mid dark:text-gray-400">{l.qtdReal.toLocaleString("pt-AO")}</td>
                        <td className="px-4 py-2.5 text-right text-ink-mid dark:text-gray-400">{l.custoUnitario.toLocaleString("pt-AO")} AOA</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-800 dark:text-gray-200">{formatAOA(l.custoReal)}</td>
                        <td className="px-4 py-2.5 text-center"><DesvioCell desvio={l.desvio} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
