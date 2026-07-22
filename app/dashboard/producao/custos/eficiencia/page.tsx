"use client";

import {
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Zap,
  BarChart3,
} from "lucide-react";

interface SemanaEficiencia {
  semana: string;
  periodo: string;
  litrosPlaneados: number;
  litrosProduzidos: number;
  tempoDisponivel: number; // horas
  tempoParagem: number; // horas
  unidadesRejeitadas: number;
  unidadesTotais: number;
}

const SEMANAS: SemanaEficiencia[] = [
  {
    semana: "S22",
    periodo: "26 Mai – 01 Jun 2026",
    litrosPlaneados: 18000,
    litrosProduzidos: 17100,
    tempoDisponivel: 40,
    tempoParagem: 3.5,
    unidadesRejeitadas: 42,
    unidadesTotais: 1710,
  },
  {
    semana: "S23",
    periodo: "02 Jun – 08 Jun 2026",
    litrosPlaneados: 20000,
    litrosProduzidos: 19600,
    tempoDisponivel: 40,
    tempoParagem: 2.0,
    unidadesRejeitadas: 28,
    unidadesTotais: 1960,
  },
  {
    semana: "S24",
    periodo: "09 Jun – 15 Jun 2026",
    litrosPlaneados: 22000,
    litrosProduzidos: 21500,
    tempoDisponivel: 40,
    tempoParagem: 1.5,
    unidadesRejeitadas: 18,
    unidadesTotais: 2150,
  },
  {
    semana: "S25 (parcial)",
    periodo: "16 Jun – 18 Jun 2026",
    litrosPlaneados: 10000,
    litrosProduzidos: 9800,
    tempoDisponivel: 24,
    tempoParagem: 0.5,
    unidadesRejeitadas: 9,
    unidadesTotais: 980,
  },
];

function calcRendimento(prod: number, plan: number) {
  return (prod / plan) * 100;
}

function calcTaxaRejeicao(rej: number, tot: number) {
  return (rej / tot) * 100;
}

function calcOEE(disponivel: number, paragem: number, rendimento: number, rejeicao: number) {
  const disponibilidade = ((disponivel - paragem) / disponivel) * 100;
  const qualidade = 100 - rejeicao;
  return (disponibilidade * rendimento * qualidade) / 10000;
}

function TendenciaIcon({ valor, anterior }: { valor: number; anterior: number }) {
  if (valor > anterior + 0.5)
    return <TrendingUp className="h-3.5 w-3.5 text-live" />;
  if (valor < anterior - 0.5)
    return <TrendingDown className="h-3.5 w-3.5 text-danger" />;
  return <Minus className="h-3.5 w-3.5 text-ink-mid/50" />;
}

function OEEBar({ value }: { value: number }) {
  const pct = Math.min(value, 100);
  const color = pct >= 85 ? "bg-live" : pct >= 70 ? "bg-amber" : "bg-danger";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-ink-ghost/30 dark:bg-ink-ghost/20 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-12 text-right">{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function EficienciaProducaoPage() {
  const dados = SEMANAS.map((s) => {
    const rendimento = calcRendimento(s.litrosProduzidos, s.litrosPlaneados);
    const taxaRejeicao = calcTaxaRejeicao(s.unidadesRejeitadas, s.unidadesTotais);
    const oee = calcOEE(s.tempoDisponivel, s.tempoParagem, rendimento, taxaRejeicao);
    return { ...s, rendimento, taxaRejeicao, oee };
  });

  // KPIs actuais (última semana completa = S24)
  const kpiActual = dados[2];
  const kpiAnterior = dados[1];
  const totalPerdas = SEMANAS.reduce((s, w) => s + w.tempoParagem, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <Gauge className="h-7 w-7 text-ink" />
            Eficiência de Produção
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Indicadores de eficiência (OEE, rendimento, rejeição e paragens) — Junho 2026.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Novo
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — dados de demonstração. Valores calculados com base nas ordens de fabrico.
      </div>

      {/* KPIs principais (S24) */}
      <div>
        <p className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-3">
          Semana 24 — 09 a 15 Jun 2026 (última semana completa)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* OEE */}
          <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">OEE</p>
              <Zap className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{kpiActual.oee.toFixed(1)}%</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-ink-mid/70 dark:text-ink-mid/60">
              <TendenciaIcon valor={kpiActual.oee} anterior={kpiAnterior.oee} />
              vs S23: {kpiAnterior.oee.toFixed(1)}%
            </div>
            <div className="mt-2">
              <OEEBar value={kpiActual.oee} />
            </div>
          </div>

          {/* Rendimento */}
          <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Rendimento</p>
              <BarChart3 className="h-4 w-4 text-live" />
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{kpiActual.rendimento.toFixed(1)}%</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-ink-mid/70 dark:text-ink-mid/60">
              <TendenciaIcon valor={kpiActual.rendimento} anterior={kpiAnterior.rendimento} />
              {kpiActual.litrosProduzidos.toLocaleString("pt-AO")} / {kpiActual.litrosPlaneados.toLocaleString("pt-AO")} L
            </div>
          </div>

          {/* Taxa de Rejeição */}
          <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Taxa de Rejeição</p>
              <TrendingDown className="h-4 w-4 text-amber" />
            </div>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{kpiActual.taxaRejeicao.toFixed(2)}%</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-ink-mid/70 dark:text-ink-mid/60">
              <TendenciaIcon valor={kpiAnterior.taxaRejeicao} anterior={kpiActual.taxaRejeicao} />
              {kpiActual.unidadesRejeitadas} un. rejeitadas
            </div>
          </div>

          {/* Tempo de Paragem */}
          <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Paragem (S24)</p>
              <Clock className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{kpiActual.tempoParagem}h</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-ink-mid/70 dark:text-ink-mid/60">
              <TendenciaIcon valor={kpiAnterior.tempoParagem} anterior={kpiActual.tempoParagem} />
              Acumulado Jun: {totalPerdas.toFixed(1)}h
            </div>
          </div>
        </div>
      </div>

      {/* Tabela por semana */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Evolução Semanal — Junho 2026</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                {["Semana", "Período", "L Planeados", "L Produzidos", "Rendimento", "OEE", "Rejeição %", "Paragem (h)"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {dados.map((d, i) => {
                const ant = i > 0 ? dados[i - 1] : null;
                return (
                  <tr key={d.semana} className={`hover:bg-surface dark:hover:bg-gray-800/30 transition-colors ${d.semana.includes("parcial") ? "opacity-80" : ""}`}>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {d.semana}
                    </td>
                    <td className="px-4 py-3 text-ink-mid/70 dark:text-ink-mid/60 text-xs whitespace-nowrap">{d.periodo}</td>
                    <td className="px-4 py-3 text-right text-ink-mid dark:text-gray-400">{d.litrosPlaneados.toLocaleString("pt-AO")}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">{d.litrosProduzidos.toLocaleString("pt-AO")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {ant && <TendenciaIcon valor={d.rendimento} anterior={ant.rendimento} />}
                        <span className={`font-semibold ${d.rendimento >= 97 ? "text-live dark:text-emerald-400" : d.rendimento >= 90 ? "text-amber dark:text-amber-400" : "text-danger dark:text-red-400"}`}>
                          {d.rendimento.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {ant && <TendenciaIcon valor={d.oee} anterior={ant.oee} />}
                        <span className={`font-semibold ${d.oee >= 85 ? "text-live dark:text-emerald-400" : d.oee >= 70 ? "text-amber dark:text-amber-400" : "text-danger dark:text-red-400"}`}>
                          {d.oee.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${d.taxaRejeicao <= 1 ? "text-live dark:text-emerald-400" : d.taxaRejeicao <= 2 ? "text-amber dark:text-amber-400" : "text-danger dark:text-red-400"}`}>
                        {d.taxaRejeicao.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${d.tempoParagem <= 2 ? "text-live dark:text-emerald-400" : d.tempoParagem <= 4 ? "text-amber dark:text-amber-400" : "text-danger dark:text-red-400"}`}>
                        {d.tempoParagem}h
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-surface dark:bg-gray-800/50 border-t border-ink-ghost/60 dark:border-ink-ghost/20">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase">Total / Média Junho</td>
                <td className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">
                  {SEMANAS.reduce((s, w) => s + w.litrosPlaneados, 0).toLocaleString("pt-AO")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">
                  {SEMANAS.reduce((s, w) => s + w.litrosProduzidos, 0).toLocaleString("pt-AO")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-live dark:text-emerald-400">
                  {(dados.reduce((s, d) => s + d.rendimento, 0) / dados.length).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right font-bold text-ink dark:text-blue-400">
                  {(dados.reduce((s, d) => s + d.oee, 0) / dados.length).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right font-bold text-amber dark:text-amber-400">
                  {(dados.reduce((s, d) => s + d.taxaRejeicao, 0) / dados.length).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-bold text-danger dark:text-red-400">
                  {totalPerdas.toFixed(1)}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Legenda OEE */}
      <div className="flex flex-wrap gap-4 text-xs text-ink-mid/70 dark:text-ink-mid/60">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-live inline-block" /> OEE ≥ 85% — Classe mundial</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber inline-block" /> OEE 70–84% — Aceitável</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger inline-block" /> OEE &lt; 70% — Requer melhoria</span>
      </div>
    </div>
  );
}
