"use client";

import { TrendingUp, TrendingDown, Minus, BarChart3, Sparkles } from "lucide-react";
import { useState } from "react";

type Cenario = "Optimista" | "Base" | "Pessimista";

interface ProjecaoMes {
  mes: string;
  abreviatura: string;
  receita: number;
  custo: number;
  variacao: number | null;
}

const PROJECOES: Record<Cenario, ProjecaoMes[]> = {
  Optimista: [
    { mes: "Julho 2026",    abreviatura: "Jul", receita: 98_500_000,  custo: 61_200_000,  variacao: null },
    { mes: "Agosto 2026",   abreviatura: "Ago", receita: 103_200_000, custo: 63_800_000,  variacao: 4.8 },
    { mes: "Setembro 2026", abreviatura: "Set", receita: 109_800_000, custo: 67_100_000,  variacao: 6.4 },
    { mes: "Outubro 2026",  abreviatura: "Out", receita: 115_400_000, custo: 70_300_000,  variacao: 5.1 },
    { mes: "Novembro 2026", abreviatura: "Nov", receita: 121_000_000, custo: 73_500_000,  variacao: 4.9 },
    { mes: "Dezembro 2026", abreviatura: "Dez", receita: 134_600_000, custo: 79_200_000,  variacao: 11.2 },
  ],
  Base: [
    { mes: "Julho 2026",    abreviatura: "Jul", receita: 88_000_000,  custo: 58_500_000,  variacao: null },
    { mes: "Agosto 2026",   abreviatura: "Ago", receita: 91_500_000,  custo: 60_200_000,  variacao: 4.0 },
    { mes: "Setembro 2026", abreviatura: "Set", receita: 94_800_000,  custo: 62_100_000,  variacao: 3.6 },
    { mes: "Outubro 2026",  abreviatura: "Out", receita: 97_200_000,  custo: 63_900_000,  variacao: 2.5 },
    { mes: "Novembro 2026", abreviatura: "Nov", receita: 99_600_000,  custo: 65_400_000,  variacao: 2.5 },
    { mes: "Dezembro 2026", abreviatura: "Dez", receita: 108_300_000, custo: 70_100_000,  variacao: 8.7 },
  ],
  Pessimista: [
    { mes: "Julho 2026",    abreviatura: "Jul", receita: 76_000_000,  custo: 55_800_000,  variacao: null },
    { mes: "Agosto 2026",   abreviatura: "Ago", receita: 77_500_000,  custo: 56_900_000,  variacao: 2.0 },
    { mes: "Setembro 2026", abreviatura: "Set", receita: 79_200_000,  custo: 58_000_000,  variacao: 2.2 },
    { mes: "Outubro 2026",  abreviatura: "Out", receita: 80_100_000,  custo: 59_200_000,  variacao: 1.1 },
    { mes: "Novembro 2026", abreviatura: "Nov", receita: 81_400_000,  custo: 60_100_000,  variacao: 1.6 },
    { mes: "Dezembro 2026", abreviatura: "Dez", receita: 85_700_000,  custo: 63_500_000,  variacao: 5.3 },
  ],
};

const CENARIO_CONFIG: Record<Cenario, { color: string; bg: string; border: string; dot: string; label: string }> = {
  Optimista: {
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-live",
    label: "Crescimento acelerado — mercado favorável, expansão de linha",
  },
  Base: {
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
    label: "Crescimento moderado — condições estáveis de mercado",
  },
  Pessimista: {
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber/8 dark:bg-amber-950/30",
    border: "border-amber/30 dark:border-amber-800",
    dot: "bg-amber",
    label: "Crescimento lento — pressão cambial e restrições de importação",
  },
};

function formatAOA(value: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    notation: "compact",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatAOAFull(value: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function VariacaoCell({ variacao }: { variacao: number | null }) {
  if (variacao === null)
    return <span className="text-xs text-ink-mid/50">—</span>;
  if (variacao > 3)
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-live dark:text-emerald-400">
        <TrendingUp className="w-4 h-4" /> +{variacao.toFixed(1)}%
      </span>
    );
  if (variacao < 0)
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-danger dark:text-red-400">
        <TrendingDown className="w-4 h-4" /> {variacao.toFixed(1)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-mid/70 dark:text-ink-mid/60">
      <Minus className="w-4 h-4" /> +{variacao.toFixed(1)}%
    </span>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="w-full bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded-full h-1.5 overflow-hidden mt-1">
      <div className="h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ProjecoesPage() {
  const [cenario, setCenario] = useState<Cenario>("Base");
  const dados = PROJECOES[cenario];
  const cfg = CENARIO_CONFIG[cenario];

  const totalReceita = dados.reduce((s, d) => s + d.receita, 0);
  const totalCusto = dados.reduce((s, d) => s + d.custo, 0);
  const totalResultado = totalReceita - totalCusto;
  const maxReceita = Math.max(...dados.map((d) => d.receita));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink dark:text-white">
                Projeções Financeiras
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <Sparkles className="w-3 h-3" /> Novo
              </span>
            </div>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Previsão financeira Jul–Dez 2026
            </p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30">
        <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
        <p className="text-sm text-violet-800 dark:text-violet-300 font-medium">
          Módulo em desenvolvimento — projeções são estimativas baseadas em dados históricos simulados.
        </p>
      </div>

      {/* Cenário Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        {(["Optimista", "Base", "Pessimista"] as Cenario[]).map((c) => {
          const cc = CENARIO_CONFIG[c];
          const isActive = c === cenario;
          return (
            <button
              key={c}
              onClick={() => setCenario(c)}
              className={`flex-1 text-left px-4 py-4 rounded-xl border-2 transition-all ${
                isActive
                  ? `${cc.border} ${cc.bg}`
                  : "border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel hover:border-ink-ghost/80 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${cc.dot}`} />
                <span
                  className={`text-sm font-bold ${
                    isActive ? cc.color : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Cenário {c}
                </span>
                {isActive && (
                  <span className="ml-auto text-xs bg-panel dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold text-ink-mid dark:text-gray-300 border border-ink-ghost/60 dark:border-gray-600">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">{cc.label}</p>
            </button>
          );
        })}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5">
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide font-semibold">
            Receita Total Projectada
          </p>
          <p className="mt-1 text-2xl font-bold text-ink dark:text-white">
            {formatAOA(totalReceita)}
          </p>
          <p className="mt-1 text-xs text-ink-mid/50">Jul – Dez 2026 · {cenario}</p>
        </div>
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5">
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide font-semibold">
            Custo Total Projectado
          </p>
          <p className="mt-1 text-2xl font-bold text-ink dark:text-white">
            {formatAOA(totalCusto)}
          </p>
          <p className="mt-1 text-xs text-ink-mid/50">
            Margem média:{" "}
            {Math.round(((totalReceita - totalCusto) / totalReceita) * 100)}%
          </p>
        </div>
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5">
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide font-semibold">
            Resultado Líquido Projectado
          </p>
          <p
            className={`mt-1 text-2xl font-bold ${
              totalResultado >= 0
                ? "text-live dark:text-emerald-400"
                : "text-danger dark:text-red-400"
            }`}
          >
            {formatAOA(totalResultado)}
          </p>
          <p className="mt-1 text-xs text-ink-mid/50">Receita − Custo</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 overflow-hidden">
        <div className={`px-6 py-4 border-b ${cfg.border} ${cfg.bg} flex items-center gap-2`}>
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          <h2 className={`text-sm font-semibold ${cfg.color}`}>
            Cenário {cenario} — Detalhe Mensal (Jul–Dez 2026)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/20">
            <thead className="bg-surface dark:bg-gray-900/40">
              <tr>
                {[
                  "Mês",
                  "Receita Projectada",
                  "Custo Projectado",
                  "Resultado",
                  "Margem %",
                  "Var. vs Mês Anterior",
                  "Tendência",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/20">
              {dados.map((d) => {
                const resultado = d.receita - d.custo;
                const margem = Math.round((resultado / d.receita) * 100);
                return (
                  <tr
                    key={d.mes}
                    className="hover:bg-surface dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-ink dark:text-white">
                          {d.mes}
                        </p>
                        <p className="text-xs text-ink-mid/50">2026</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-ink dark:text-white whitespace-nowrap">
                          {formatAOAFull(d.receita)}
                        </p>
                        <MiniBar value={d.receita} max={maxReceita} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {formatAOAFull(d.custo)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-bold ${
                          resultado >= 0
                            ? "text-live dark:text-emerald-400"
                            : "text-danger dark:text-red-400"
                        }`}
                      >
                        {formatAOAFull(resultado)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink dark:text-white">
                          {margem}%
                        </span>
                        <div className="w-16 bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${margem}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <VariacaoCell variacao={d.variacao} />
                    </td>
                    <td className="px-4 py-4">
                      {d.variacao === null ? (
                        <span className="text-xs text-ink-mid/50">Base</span>
                      ) : d.variacao > 3 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-live-dim text-live dark:bg-emerald-900/30 dark:text-emerald-400">
                          <TrendingUp className="w-3 h-3" /> Crescimento
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface text-ink-mid dark:bg-gray-700 dark:text-gray-400">
                          <Minus className="w-3 h-3" /> Estável
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface dark:bg-gray-900/30 font-semibold">
                <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                  TOTAL H2 2026
                </td>
                <td className="px-4 py-4 text-sm font-bold text-ink dark:text-white whitespace-nowrap">
                  {formatAOAFull(totalReceita)}
                </td>
                <td className="px-4 py-4 text-sm font-bold text-ink dark:text-white whitespace-nowrap">
                  {formatAOAFull(totalCusto)}
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-bold text-live dark:text-emerald-400 whitespace-nowrap">
                    {formatAOAFull(totalResultado)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-bold text-ink dark:text-white">
                  {Math.round(((totalReceita - totalCusto) / totalReceita) * 100)}%
                </td>
                <td className="px-4 py-4 text-xs text-ink-mid/50">—</td>
                <td className="px-4 py-4 text-xs text-ink-mid/50">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-6 py-3 bg-surface dark:bg-gray-900/20 border-t border-ink-ghost/40 dark:border-ink-ghost/20">
          <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40">
            Projeções calculadas com base em dados históricos Jan–Jun 2026
          </p>
        </div>
      </div>
    </div>
  );
}
