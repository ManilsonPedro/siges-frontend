"use client";

import { useState } from "react";
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
  FlaskConical,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface LinhaPlano {
  id: string;
  produto: string;
  categoria: string;
  operador: string;
  linha: string;
  metaDiaria: number; // litros/kg
  unidade: string;
  segunda: number;
  terca: number;
  quarta: number;
  quinta: number;
  sexta: number;
  sabado: number;
  capacidadeMax: number; // litros/kg por dia
}

interface RealizadoDia {
  segunda: number;
  terca: number;
  quarta: number;
  quinta: number;
  sexta: number;
  sabado: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SEMANA = "16–21 Jun 2026";

const PLANO: LinhaPlano[] = [
  {
    id: "PL-001",
    produto: "Hipoclorito de Sódio 20L",
    categoria: "Hipoclorito",
    operador: "António Moisés",
    linha: "Linha A — Hipoclorito",
    metaDiaria: 1600,
    unidade: "L",
    segunda: 1600,
    terca: 1600,
    quarta: 1600,
    quinta: 1600,
    sexta: 1600,
    sabado: 800,
    capacidadeMax: 2000,
  },
  {
    id: "PL-002",
    produto: "Hipoclorito de Sódio 5L",
    categoria: "Hipoclorito",
    operador: "Domingos Ferreira",
    linha: "Linha A — Hipoclorito",
    metaDiaria: 1200,
    unidade: "L",
    segunda: 1200,
    terca: 1200,
    quarta: 1200,
    quinta: 1200,
    sexta: 1200,
    sabado: 600,
    capacidadeMax: 1600,
  },
  {
    id: "PL-003",
    produto: "Lixívia KITOKA 5L",
    categoria: "Lixívia KITOKA",
    operador: "Beatriz Venâncio",
    linha: "Linha B — KITOKA",
    metaDiaria: 1400,
    unidade: "L",
    segunda: 1400,
    terca: 1400,
    quarta: 1400,
    quinta: 1400,
    sexta: 1400,
    sabado: 700,
    capacidadeMax: 1800,
  },
  {
    id: "PL-004",
    produto: "Lixívia KITOKA 1L",
    categoria: "Lixívia KITOKA",
    operador: "Carlota Nzinga",
    linha: "Linha B — KITOKA",
    metaDiaria: 2400,
    unidade: "L",
    segunda: 2400,
    terca: 2400,
    quarta: 2400,
    quinta: 2400,
    sexta: 2400,
    sabado: 1200,
    capacidadeMax: 3000,
  },
  {
    id: "PL-005",
    produto: "Detergente Multiusos 5L",
    categoria: "Detergente",
    operador: "Manuel Lopes",
    linha: "Linha C — Detergentes",
    metaDiaria: 800,
    unidade: "L",
    segunda: 800,
    terca: 800,
    quarta: 800,
    quinta: 800,
    sexta: 800,
    sabado: 0,
    capacidadeMax: 1200,
  },
  {
    id: "PL-006",
    produto: "Água Tratada AQUASAN 20L",
    categoria: "Água Tratada",
    operador: "Joaquim Ndala",
    linha: "Linha D — Água Tratada",
    metaDiaria: 3000,
    unidade: "L",
    segunda: 3000,
    terca: 3000,
    quarta: 3000,
    quinta: 3000,
    sexta: 3000,
    sabado: 1500,
    capacidadeMax: 4000,
  },
];

const REALIZADO: Record<string, RealizadoDia> = {
  "PL-001": { segunda: 1580, terca: 1610, quarta: 1550, quinta: 1640, sexta: 0, sabado: 0 },
  "PL-002": { segunda: 1190, terca: 1210, quarta: 1180, quinta: 1220, sexta: 0, sabado: 0 },
  "PL-003": { segunda: 1360, terca: 1400, quarta: 1420, quinta: 1380, sexta: 0, sabado: 0 },
  "PL-004": { segunda: 2380, terca: 2420, quarta: 2400, quinta: 2390, sexta: 0, sabado: 0 },
  "PL-005": { segunda: 800, terca: 780, quarta: 820, quinta: 800, sexta: 0, sabado: 0 },
  "PL-006": { segunda: 3000, terca: 2980, quarta: 3020, quinta: 3000, sexta: 0, sabado: 0 },
};

const DIAS: { key: keyof RealizadoDia; label: string; concluido: boolean }[] = [
  { key: "segunda", label: "Seg 16", concluido: true },
  { key: "terca",   label: "Ter 17", concluido: true },
  { key: "quarta",  label: "Qua 18", concluido: true },
  { key: "quinta",  label: "Qui 19", concluido: true },
  { key: "sexta",   label: "Sex 20", concluido: false },
  { key: "sabado",  label: "Sáb 21", concluido: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcDesvio(meta: number, real: number): number {
  if (meta === 0) return 0;
  return ((real - meta) / meta) * 100;
}

function fmtNum(n: number, unidade: string): string {
  if (n === 0) return "—";
  return n.toLocaleString("pt-AO") + " " + unidade;
}

function DesvioChip({ meta, real }: { meta: number; real: number }) {
  if (meta === 0 || real === 0) {
    return <span className="text-ink-mid/50 text-xs">—</span>;
  }
  const d = calcDesvio(meta, real);
  const abs = Math.abs(d).toFixed(1);
  if (d > 3) {
    return (
      <span className="inline-flex items-center gap-0.5 text-live dark:text-emerald-400 text-xs font-semibold">
        <TrendingUp className="h-3 w-3" />+{abs}%
      </span>
    );
  }
  if (d < -3) {
    return (
      <span className="inline-flex items-center gap-0.5 text-danger dark:text-red-400 text-xs font-semibold">
        <TrendingDown className="h-3 w-3" />-{abs}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-ink-mid/70 dark:text-ink-mid/60 text-xs">
      <Minus className="h-3 w-3" />
      {d >= 0 ? "+" : ""}{d.toFixed(1)}%
    </span>
  );
}

function CapacidadeBar({ usado, max }: { usado: number; max: number }) {
  const pct = Math.min(100, Math.round((usado / max) * 100));
  const color =
    pct >= 90 ? "bg-danger" :
    pct >= 70 ? "bg-amber-400" :
    "bg-live";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="h-1.5 flex-1 rounded-full bg-ink-ghost/30 dark:bg-ink-ghost/20 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-ink-mid/70 dark:text-ink-mid/60 shrink-0">{pct}%</span>
    </div>
  );
}

const CATEGORIA_CORES: Record<string, string> = {
  "Hipoclorito":    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  "Lixívia KITOKA": "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  "Detergente":     "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  "Água Tratada":   "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ProducaoSemanalPage() {
  const [filtroLinha, setFiltroLinha] = useState<string>("Todas");
  const [expandido, setExpandido] = useState<string | null>(null);

  const linhas = Array.from(new Set(PLANO.map((p) => p.linha)));

  const planoFiltrado = filtroLinha === "Todas"
    ? PLANO
    : PLANO.filter((p) => p.linha === filtroLinha);

  // KPIs globais — apenas dias concluídos
  const diasConcluidos = DIAS.filter((d) => d.concluido);

  let totalMetaSemana = 0;
  let totalRealSemana = 0;
  let totalCapMax = 0;
  let totalUsado = 0;

  for (const pl of PLANO) {
    const real = REALIZADO[pl.id];
    for (const dia of diasConcluidos) {
      totalMetaSemana += (pl as unknown as Record<string, number>)[dia.key] as number;
      totalRealSemana += real[dia.key];
    }
    totalCapMax += pl.capacidadeMax * diasConcluidos.length;
    totalUsado  += diasConcluidos.reduce((s, d) => s + real[d.key], 0);
  }

  const desvioGlobal = calcDesvio(totalMetaSemana, totalRealSemana);
  const utilizacaoGlobal = totalCapMax > 0 ? Math.round((totalUsado / totalCapMax) * 100) : 0;

  // Alertas
  const alertas: { id: string; msg: string }[] = [];
  for (const pl of PLANO) {
    const real = REALIZADO[pl.id];
    for (const dia of diasConcluidos) {
      const meta = (pl as unknown as Record<string, number>)[dia.key] as number;
      const r = real[dia.key];
      const dev = calcDesvio(meta, r);
      if (dev < -5 && meta > 0) {
        alertas.push({ id: pl.id + dia.key, msg: `${pl.produto} — desvio ${dev.toFixed(1)}% em ${dia.label}` });
      }
    }
  }

  return (
    <div className="space-y-6 p-6">

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-ink" />
            Produção Semanal
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Planeamento e acompanhamento de produção — semana de {SEMANA}.
            Capacidade, metas diárias e desvios por linha.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-panel px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-surface dark:hover:bg-gray-700 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink/90 px-4 py-2 text-sm font-semibold text-white transition-colors">
            <Plus className="h-4 w-4" />
            Nova Ordem
          </button>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="rounded-lg border border-amber/30 dark:border-amber-700 bg-amber/8 dark:bg-amber/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber dark:text-amber-300 mb-1">
            <AlertTriangle className="h-4 w-4" />
            {alertas.length} desvio{alertas.length > 1 ? "s" : ""} detectado{alertas.length > 1 ? "s" : ""}
          </div>
          <ul className="space-y-0.5">
            {alertas.map((a) => (
              <li key={a.id} className="text-xs text-amber dark:text-amber pl-6">
                {a.msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meta acumulada */}
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">Meta Acumulada (Seg–Qui)</p>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">
            {totalMetaSemana.toLocaleString("pt-AO")} L
          </p>
          <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 mt-1">4 dias concluídos</p>
        </div>

        {/* Produção Real */}
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">Produção Real (Seg–Qui)</p>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">
            {totalRealSemana.toLocaleString("pt-AO")} L
          </p>
          <div className="mt-1">
            <DesvioChip meta={totalMetaSemana} real={totalRealSemana} />
          </div>
        </div>

        {/* Utilização de Capacidade */}
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">Utilização de Capacidade</p>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">{utilizacaoGlobal}%</p>
          <div className="mt-2">
            <CapacidadeBar usado={totalUsado} max={totalCapMax} />
          </div>
        </div>

        {/* Desvio Global */}
        <div className={`rounded-xl border p-5 shadow-sm ${
          desvioGlobal < -3
            ? "border-danger/30 dark:border-red-800 bg-danger/8 dark:bg-red-900/20"
            : desvioGlobal > 3
            ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
            : "border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel"
        }`}>
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">Desvio Global</p>
          <p className={`text-2xl font-bold ${
            desvioGlobal < -3
              ? "text-danger dark:text-red-300"
              : desvioGlobal > 3
              ? "text-live dark:text-emerald-300"
              : "text-ink dark:text-gray-100"
          }`}>
            {desvioGlobal >= 0 ? "+" : ""}{desvioGlobal.toFixed(1)}%
          </p>
          <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-1">
            {Math.abs(totalRealSemana - totalMetaSemana).toLocaleString("pt-AO")} L{" "}
            {totalRealSemana >= totalMetaSemana ? "acima" : "abaixo"} da meta
          </p>
        </div>
      </div>

      {/* Filtro de linha */}
      <div className="flex flex-wrap gap-2">
        {["Todas", ...linhas].map((l) => (
          <button
            key={l}
            onClick={() => setFiltroLinha(l)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filtroLinha === l
                ? "bg-ink text-white"
                : "bg-surface dark:bg-ink-ghost/20 text-ink-mid dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Tabela principal */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            <thead className="bg-surface dark:bg-gray-800/60">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">Operador</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">Meta/Dia</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">Cap. Máx</th>
                {DIAS.map((d) => (
                  <th key={d.key} className="px-3 py-3 text-right text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">
                    {d.label}
                    {d.concluido ? (
                      <CheckCircle2 className="inline h-3 w-3 text-live ml-1" />
                    ) : (
                      <Clock className="inline h-3 w-3 text-ink-mid/50 ml-1" />
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">Total Real</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">Desvio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">Capacidade</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {planoFiltrado.map((pl) => {
                const real = REALIZADO[pl.id];
                const totalRealPl = diasConcluidos.reduce((s, d) => s + real[d.key], 0);
                const totalMetaPl = diasConcluidos.reduce((s, d) => s + (pl as unknown as Record<string, number>)[d.key] as number, 0);
                const metaDiaSemana = pl.metaDiaria * 6 - pl.sabado; // total semanal planeado
                const aberto = expandido === pl.id;

                return (
                  <>
                    <tr
                      key={pl.id}
                      className="hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors cursor-pointer"
                      onClick={() => setExpandido(aberto ? null : pl.id)}
                    >
                      {/* Produto */}
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{pl.produto}</span>
                          <span className={`inline-flex self-start rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIA_CORES[pl.categoria] ?? "bg-surface dark:bg-ink-ghost/20 text-ink-mid dark:text-gray-400"}`}>
                            {pl.categoria}
                          </span>
                        </div>
                      </td>

                      {/* Operador */}
                      <td className="px-4 py-3 text-ink-mid dark:text-gray-400 whitespace-nowrap text-xs">{pl.operador}</td>

                      {/* Meta / Dia */}
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap text-xs">
                        {pl.metaDiaria.toLocaleString("pt-AO")} {pl.unidade}
                      </td>

                      {/* Cap. Máx */}
                      <td className="px-4 py-3 text-right text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap text-xs">
                        {pl.capacidadeMax.toLocaleString("pt-AO")} {pl.unidade}
                      </td>

                      {/* Dias */}
                      {DIAS.map((dia) => {
                        const metaDia = (pl as unknown as Record<string, number>)[dia.key] as number;
                        const realDia = real[dia.key];
                        const concluido = dia.concluido;
                        return (
                          <td key={dia.key} className="px-3 py-3 text-right whitespace-nowrap text-xs">
                            {concluido ? (
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {realDia > 0 ? realDia.toLocaleString("pt-AO") : "—"}
                                </span>
                                {realDia > 0 && (
                                  <DesvioChip meta={metaDia} real={realDia} />
                                )}
                              </div>
                            ) : (
                              <span className="text-ink-mid/50 dark:text-gray-600 italic">
                                {metaDia > 0 ? metaDia.toLocaleString("pt-AO") : "—"}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Real */}
                      <td className="px-4 py-3 text-right font-bold text-ink dark:text-white whitespace-nowrap text-xs">
                        {totalRealPl.toLocaleString("pt-AO")} {pl.unidade}
                      </td>

                      {/* Desvio */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <DesvioChip meta={totalMetaPl} real={totalRealPl} />
                      </td>

                      {/* Capacidade bar */}
                      <td className="px-4 py-3 min-w-[120px]">
                        <CapacidadeBar
                          usado={diasConcluidos.reduce((s, d) => s + real[d.key], 0) / diasConcluidos.length}
                          max={pl.capacidadeMax}
                        />
                      </td>

                      {/* Toggle */}
                      <td className="px-4 py-3 text-center">
                        {aberto
                          ? <ChevronUp className="h-4 w-4 text-ink-mid/50 mx-auto" />
                          : <ChevronDown className="h-4 w-4 text-ink-mid/50 mx-auto" />
                        }
                      </td>
                    </tr>

                    {/* Linha expandida — detalhes */}
                    {aberto && (
                      <tr key={pl.id + "-det"} className="bg-blue-50/40 dark:bg-blue-900/10">
                        <td colSpan={13} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Info da linha */}
                            <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-panel dark:bg-panel p-4">
                              <p className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 mb-2 uppercase tracking-wide flex items-center gap-1">
                                <FlaskConical className="h-3.5 w-3.5" />
                                Linha de Produção
                              </p>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pl.linha}</p>
                              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-1">Operador: {pl.operador}</p>
                              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">
                                Cap. total semana:{" "}
                                <span className="font-semibold">
                                  {(pl.capacidadeMax * 5 + (pl.sabado > 0 ? pl.capacidadeMax : 0)).toLocaleString("pt-AO")} {pl.unidade}
                                </span>
                              </p>
                            </div>

                            {/* Meta vs Real por dia */}
                            <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-panel dark:bg-panel p-4">
                              <p className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 mb-2 uppercase tracking-wide">
                                Comparativo Diário
                              </p>
                              <div className="space-y-1.5">
                                {DIAS.filter((d) => d.concluido).map((dia) => {
                                  const metaDia = (pl as unknown as Record<string, number>)[dia.key] as number;
                                  const realDia = real[dia.key];
                                  const pct = metaDia > 0 ? Math.round((realDia / metaDia) * 100) : 0;
                                  const barColor = pct >= 100 ? "bg-live" : pct >= 90 ? "bg-amber-400" : "bg-danger";
                                  return (
                                    <div key={dia.key} className="flex items-center gap-2 text-xs">
                                      <span className="w-12 text-ink-mid/70 dark:text-ink-mid/60 shrink-0">{dia.label}</span>
                                      <div className="h-1.5 flex-1 rounded-full bg-surface dark:bg-gray-700 overflow-hidden">
                                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                      </div>
                                      <span className="w-16 text-right font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                                        {realDia.toLocaleString("pt-AO")} {pl.unidade}
                                      </span>
                                      <span className="w-10 text-right text-ink-mid/50 shrink-0">{pct}%</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Resumo acumulado */}
                            <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-panel dark:bg-panel p-4">
                              <p className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 mb-2 uppercase tracking-wide">
                                Resumo Acumulado
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-ink-mid/70 dark:text-ink-mid/60">Meta acumulada</span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {totalMetaPl.toLocaleString("pt-AO")} {pl.unidade}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-ink-mid/70 dark:text-ink-mid/60">Real acumulado</span>
                                  <span className="font-bold text-ink dark:text-white">
                                    {totalRealPl.toLocaleString("pt-AO")} {pl.unidade}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-ink-mid/70 dark:text-ink-mid/60">Diferença</span>
                                  <span className={`font-semibold ${totalRealPl >= totalMetaPl ? "text-live dark:text-emerald-400" : "text-danger dark:text-red-400"}`}>
                                    {totalRealPl >= totalMetaPl ? "+" : ""}
                                    {(totalRealPl - totalMetaPl).toLocaleString("pt-AO")} {pl.unidade}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-ink-mid/70 dark:text-ink-mid/60">Meta semana total</span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {(pl.segunda + pl.terca + pl.quarta + pl.quinta + pl.sexta + pl.sabado).toLocaleString("pt-AO")} {pl.unidade}
                                  </span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé informativo */}
      <div className="rounded-lg border border-ink-ghost/40 dark:border-ink-ghost/15 bg-surface dark:bg-gray-800/30 px-4 py-3 text-xs text-ink-mid/70 dark:text-ink-mid/60 flex flex-wrap gap-4">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-live" />
          Dia concluído — valor real registado
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-ink-mid/50" />
          Dia pendente — meta planeada
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-live" />
          Desvio positivo (&gt;+3%)
        </span>
        <span className="flex items-center gap-1">
          <TrendingDown className="h-3.5 w-3.5 text-danger" />
          Desvio negativo (&lt;-3%)
        </span>
        <span className="ml-auto">
          Dados de demonstração — integração ERP em curso
        </span>
      </div>

    </div>
  );
}
