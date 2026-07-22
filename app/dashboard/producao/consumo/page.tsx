"use client";

import { useState } from "react";
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  Download,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConsumoRecord {
  id: string;
  ordemProducao: string;
  produto: string;
  materiaPrima: string;
  unidade: "L" | "kg" | "un" | "g";
  qtdPrevista: number;
  qtdReal: number;
  custoUnitario: number; // AOA
  operador: string;
  data: string;
  periodo: string; // "Jun 2026", etc.
}

// ---------------------------------------------------------------------------
// Mock data — empresa de tratamento de água angolana
// ---------------------------------------------------------------------------

const CONSUMOS: ConsumoRecord[] = [
  // OP-2026-0631  –  Lixívia Multiuso 5L  –  Junho 2026
  {
    id: "C-001",
    ordemProducao: "OP-2026-0631",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Hipoclorito de Sódio 12%",
    unidade: "L",
    qtdPrevista: 2750,
    qtdReal: 2800,
    custoUnitario: 185,
    operador: "Beatriz Venâncio",
    data: "15/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-002",
    ordemProducao: "OP-2026-0631",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Surfactante aniónico",
    unidade: "kg",
    qtdPrevista: 32,
    qtdReal: 35,
    custoUnitario: 4200,
    operador: "Beatriz Venâncio",
    data: "15/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-003",
    ordemProducao: "OP-2026-0631",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Corante azul alimentar",
    unidade: "g",
    qtdPrevista: 2100,
    qtdReal: 2100,
    custoUnitario: 18,
    operador: "Beatriz Venâncio",
    data: "15/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-004",
    ordemProducao: "OP-2026-0631",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Embalagem PEAD 5L",
    unidade: "un",
    qtdPrevista: 700,
    qtdReal: 700,
    custoUnitario: 380,
    operador: "Beatriz Venâncio",
    data: "15/06/2026",
    periodo: "Jun 2026",
  },
  // OP-2026-0612  –  Hipoclorito de Sódio 20L  –  Junho 2026
  {
    id: "C-005",
    ordemProducao: "OP-2026-0612",
    produto: "Hipoclorito de Sódio 20L",
    materiaPrima: "Cloro Gasoso 99%",
    unidade: "kg",
    qtdPrevista: 310,
    qtdReal: 320,
    custoUnitario: 6800,
    operador: "António Moisés",
    data: "10/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-006",
    ordemProducao: "OP-2026-0612",
    produto: "Hipoclorito de Sódio 20L",
    materiaPrima: "Soda Cáustica NaOH 50%",
    unidade: "kg",
    qtdPrevista: 600,
    qtdReal: 580,
    custoUnitario: 1950,
    operador: "António Moisés",
    data: "10/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-007",
    ordemProducao: "OP-2026-0612",
    produto: "Hipoclorito de Sódio 20L",
    materiaPrima: "Água desmineralizada",
    unidade: "L",
    qtdPrevista: 7200,
    qtdReal: 7100,
    custoUnitario: 12,
    operador: "António Moisés",
    data: "10/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-008",
    ordemProducao: "OP-2026-0612",
    produto: "Hipoclorito de Sódio 20L",
    materiaPrima: "Embalagem PEAD 20L",
    unidade: "un",
    qtdPrevista: 400,
    qtdReal: 400,
    custoUnitario: 650,
    operador: "António Moisés",
    data: "10/06/2026",
    periodo: "Jun 2026",
  },
  // OP-2026-0598  –  Lixívia Multiuso 1L  –  Junho 2026
  {
    id: "C-009",
    ordemProducao: "OP-2026-0598",
    produto: "Lixívia Multiuso 1L",
    materiaPrima: "Hipoclorito de Sódio 12%",
    unidade: "L",
    qtdPrevista: 1200,
    qtdReal: 1190,
    custoUnitario: 185,
    operador: "Carlota Nzinga",
    data: "05/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-010",
    ordemProducao: "OP-2026-0598",
    produto: "Lixívia Multiuso 1L",
    materiaPrima: "Surfactante aniónico",
    unidade: "kg",
    qtdPrevista: 14,
    qtdReal: 13,
    custoUnitario: 4200,
    operador: "Carlota Nzinga",
    data: "05/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-011",
    ordemProducao: "OP-2026-0598",
    produto: "Lixívia Multiuso 1L",
    materiaPrima: "Embalagem PEAD 1L",
    unidade: "un",
    qtdPrevista: 1200,
    qtdReal: 1210,
    custoUnitario: 120,
    operador: "Carlota Nzinga",
    data: "05/06/2026",
    periodo: "Jun 2026",
  },
  // OP-2026-0585  –  Hipoclorito de Sódio 5L  –  Junho 2026
  {
    id: "C-012",
    ordemProducao: "OP-2026-0585",
    produto: "Hipoclorito de Sódio 5L",
    materiaPrima: "Cloro Gasoso 99%",
    unidade: "kg",
    qtdPrevista: 180,
    qtdReal: 175,
    custoUnitario: 6800,
    operador: "Domingos Ferreira",
    data: "01/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-013",
    ordemProducao: "OP-2026-0585",
    produto: "Hipoclorito de Sódio 5L",
    materiaPrima: "Soda Cáustica NaOH 50%",
    unidade: "kg",
    qtdPrevista: 300,
    qtdReal: 295,
    custoUnitario: 1950,
    operador: "Domingos Ferreira",
    data: "01/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-014",
    ordemProducao: "OP-2026-0585",
    produto: "Hipoclorito de Sódio 5L",
    materiaPrima: "Água desmineralizada",
    unidade: "L",
    qtdPrevista: 1800,
    qtdReal: 1750,
    custoUnitario: 12,
    operador: "Domingos Ferreira",
    data: "01/06/2026",
    periodo: "Jun 2026",
  },
  {
    id: "C-015",
    ordemProducao: "OP-2026-0585",
    produto: "Hipoclorito de Sódio 5L",
    materiaPrima: "Embalagem PEAD 5L",
    unidade: "un",
    qtdPrevista: 700,
    qtdReal: 700,
    custoUnitario: 380,
    operador: "Domingos Ferreira",
    data: "01/06/2026",
    periodo: "Jun 2026",
  },
  // OP-2026-0571  –  Lixívia Multiuso 5L  –  Maio 2026
  {
    id: "C-016",
    ordemProducao: "OP-2026-0571",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Hipoclorito de Sódio 12%",
    unidade: "L",
    qtdPrevista: 2600,
    qtdReal: 2650,
    custoUnitario: 180,
    operador: "Beatriz Venâncio",
    data: "22/05/2026",
    periodo: "Mai 2026",
  },
  {
    id: "C-017",
    ordemProducao: "OP-2026-0571",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Surfactante aniónico",
    unidade: "kg",
    qtdPrevista: 30,
    qtdReal: 30,
    custoUnitario: 4100,
    operador: "Beatriz Venâncio",
    data: "22/05/2026",
    periodo: "Mai 2026",
  },
  {
    id: "C-018",
    ordemProducao: "OP-2026-0571",
    produto: "Lixívia Multiuso 5L",
    materiaPrima: "Embalagem PEAD 5L",
    unidade: "un",
    qtdPrevista: 660,
    qtdReal: 665,
    custoUnitario: 375,
    operador: "Beatriz Venâncio",
    data: "22/05/2026",
    periodo: "Mai 2026",
  },
];

const PERIODOS = ["Todos", "Jun 2026", "Mai 2026"];
const PRODUTOS = [
  "Todos",
  "Lixívia Multiuso 5L",
  "Lixívia Multiuso 1L",
  "Hipoclorito de Sódio 20L",
  "Hipoclorito de Sódio 5L",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function desvio(previsto: number, real: number): number {
  if (previsto === 0) return 0;
  return ((real - previsto) / previsto) * 100;
}

function formatAOA(val: number): string {
  return (
    val.toLocaleString("pt-AO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " AOA"
  );
}

function fmtQty(val: number, unit: string): string {
  return val.toLocaleString("pt-AO") + " " + unit;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DesvioChip({ pct }: { pct: number }) {
  const abs = Math.abs(pct).toFixed(1);
  if (pct > 2) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 dark:bg-red-900/30 px-2 py-0.5 text-xs font-semibold text-danger dark:text-red-300">
        <TrendingUp className="h-3 w-3" />
        +{abs}%
      </span>
    );
  }
  if (pct < -2) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-live-dim dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-semibold text-live dark:text-emerald-300">
        <TrendingDown className="h-3 w-3" />
        {pct.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-ink-mid dark:text-gray-300">
      <Minus className="h-3 w-3" />
      {pct >= 0 ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "blue" | "amber" | "red" | "emerald" | "gray";
}

function KpiCard({ label, value, sub, accent = "gray" }: KpiCardProps) {
  const accentMap: Record<string, string> = {
    blue: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30",
    amber:
      "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30",
    red: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30",
    emerald:
      "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30",
    gray: "border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel",
  };
  const textMap: Record<string, string> = {
    blue: "text-blue-700 dark:text-blue-300",
    amber: "text-amber-700 dark:text-amber-300",
    red: "text-red-700 dark:text-red-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    gray: "text-ink dark:text-gray-100",
  };
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${accentMap[accent]}`}
    >
      <p className="text-xs font-medium text-ink-mid/70 dark:text-ink-mid/60 mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${textMap[accent]}`}>{value}</p>
      {sub && (
        <p className="mt-1 text-xs text-ink-mid/70 dark:text-ink-mid/60">{sub}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProducaoConsumoPage() {
  const [search, setSearch] = useState<string>("");
  const [periodo, setPeriodo] = useState<string>("Jun 2026");
  const [produto, setProduto] = useState<string>("Todos");

  // Derived filtered list
  const filtered = CONSUMOS.filter((c) => {
    const matchPeriodo = periodo === "Todos" || c.periodo === periodo;
    const matchProduto = produto === "Todos" || c.produto === produto;
    const q = search.toLowerCase();
    const matchSearch =
      q === "" ||
      c.ordemProducao.toLowerCase().includes(q) ||
      c.materiaPrima.toLowerCase().includes(q) ||
      c.produto.toLowerCase().includes(q) ||
      c.operador.toLowerCase().includes(q);
    return matchPeriodo && matchProduto && matchSearch;
  });

  // Enriched rows
  const rows = filtered.map((c) => ({
    ...c,
    custoPrevisto: c.qtdPrevista * c.custoUnitario,
    custoReal: c.qtdReal * c.custoUnitario,
    desvioPct: desvio(c.qtdPrevista, c.qtdReal),
  }));

  // KPI aggregates
  const totalPrevisto = rows.reduce((s, r) => s + r.custoPrevisto, 0);
  const totalReal = rows.reduce((s, r) => s + r.custoReal, 0);
  const totalDesvio = desvio(totalPrevisto, totalReal);
  const opsUnicas = new Set(rows.map((r) => r.ordemProducao)).size;
  const itensAcima = rows.filter((r) => r.desvioPct > 2).length;

  // Group by OP for the table
  const opsOrdered = Array.from(
    new Set(rows.map((r) => r.ordemProducao))
  );

  return (
    <div className="space-y-6 p-6 max-w-full">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white shadow">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-gray-100 leading-tight">
              Histórico de Consumo
            </h1>
            <p className="mt-0.5 text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Consumo de matérias-primas por ordem de produção e período —
              Produção
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="inline-flex items-center gap-2 rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-surface dark:bg-ink-ghost/20 px-3 py-2 text-sm font-medium text-ink-mid dark:text-gray-300 hover:bg-surface dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-surface dark:bg-ink-ghost/20 px-3 py-2 text-sm font-medium text-ink-mid dark:text-gray-300 hover:bg-surface dark:hover:bg-gray-700 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-ink hover:bg-ink/90 px-4 py-2 text-sm font-semibold text-white shadow transition-colors">
            <ClipboardList className="h-4 w-4" />
            Novo Registo
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI cards                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Custo Previsto"
          value={formatAOA(totalPrevisto)}
          sub={`${opsUnicas} ordens de produção`}
          accent="blue"
        />
        <KpiCard
          label="Custo Real"
          value={formatAOA(totalReal)}
          sub={`${rows.length} registos de consumo`}
          accent={totalReal > totalPrevisto ? "amber" : "emerald"}
        />
        <KpiCard
          label="Desvio Geral"
          value={`${totalDesvio >= 0 ? "+" : ""}${totalDesvio.toFixed(1)}%`}
          sub={formatAOA(Math.abs(totalReal - totalPrevisto)) + (totalReal > totalPrevisto ? " acima" : " abaixo")}
          accent={totalDesvio > 2 ? "red" : totalDesvio < -2 ? "emerald" : "gray"}
        />
        <KpiCard
          label="Itens Acima do Previsto"
          value={`${itensAcima} / ${rows.length}`}
          sub="consumo real > previsto em +2%"
          accent={itensAcima > 3 ? "red" : "gray"}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
            <input
              type="text"
              placeholder="Pesquisar ordem, matéria-prima, operador…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-surface dark:bg-ink-ghost/20 pl-9 pr-4 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-ink-mid/50 shrink-0" />
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-surface dark:bg-ink-ghost/20 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-ink"
            >
              {PERIODOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              className="rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-surface dark:bg-ink-ghost/20 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-ink"
            >
              {PRODUTOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {(search !== "" || produto !== "Todos") && (
            <button
              onClick={() => {
                setSearch("");
                setProduto("Todos");
              }}
              className="text-xs text-ink dark:text-blue-400 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Table grouped by OP                                                  */}
      {/* ------------------------------------------------------------------ */}
      {opsOrdered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-ghost/80 dark:border-gray-700 p-12 text-center text-ink-mid/50 dark:text-gray-500">
          <FlaskConical className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Nenhum registo encontrado</p>
          <p className="text-xs mt-1">Ajuste os filtros para ver resultados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opsOrdered.map((op) => {
            const linhas = rows.filter((r) => r.ordemProducao === op);
            const primeiraLinha = linhas[0];
            const totalOpPrevisto = linhas.reduce(
              (s, l) => s + l.custoPrevisto,
              0
            );
            const totalOpReal = linhas.reduce((s, l) => s + l.custoReal, 0);
            const desvioOp = desvio(totalOpPrevisto, totalOpReal);

            return (
              <div
                key={op}
                className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden"
              >
                {/* OP header */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-surface dark:bg-gray-800/60 px-5 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
                      {op}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {primeiraLinha.produto}
                    </span>
                    <span className="text-xs text-ink-mid/50 dark:text-gray-500">
                      {primeiraLinha.data}
                    </span>
                    <span className="text-xs text-ink-mid/70 dark:text-ink-mid/60">
                      Operador:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {primeiraLinha.operador}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-ink-mid/50">Custo real</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {formatAOA(totalOpReal)}
                      </p>
                    </div>
                    <DesvioChip pct={desvioOp} />
                  </div>
                </div>

                {/* Rows */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
                    <thead>
                      <tr>
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
                          Matéria-Prima
                        </th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
                          Un.
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
                          Qtd Prevista
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
                          Qtd Real
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
                          Custo Unit.
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
                          Custo Total
                        </th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
                          Desvio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-800/50">
                      {linhas.map((l) => (
                        <tr
                          key={l.id}
                          className="hover:bg-surface dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-5 py-2.5 font-medium text-gray-800 dark:text-gray-200">
                            {l.materiaPrima}
                          </td>
                          <td className="px-4 py-2.5 text-center text-ink-mid/70 dark:text-ink-mid/60 font-mono text-xs">
                            {l.unidade}
                          </td>
                          <td className="px-4 py-2.5 text-right text-ink-mid dark:text-gray-400">
                            {fmtQty(l.qtdPrevista, l.unidade)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-ink-mid dark:text-gray-400">
                            {fmtQty(l.qtdReal, l.unidade)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-ink-mid/70 dark:text-ink-mid/60 text-xs">
                            {l.custoUnitario.toLocaleString("pt-AO")} AOA/{l.unidade}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800 dark:text-gray-200">
                            {formatAOA(l.custoReal)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <DesvioChip pct={l.desvioPct} />
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* OP subtotal */}
                    <tfoot>
                      <tr className="bg-surface dark:bg-gray-800/40 border-t border-ink-ghost/60 dark:border-ink-ghost/20">
                        <td
                          colSpan={5}
                          className="px-5 py-2.5 text-xs font-semibold text-ink-mid dark:text-ink-mid/60 uppercase"
                        >
                          Subtotal — {op}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-ink dark:text-gray-100">
                          {formatAOA(totalOpReal)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <DesvioChip pct={desvioOp} />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Footer totals bar                                                    */}
      {/* ------------------------------------------------------------------ */}
      {rows.length > 0 && (
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Total do período filtrado
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-ink-mid/50">Previsto</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {formatAOA(totalPrevisto)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-mid/50">Real</p>
              <p className="text-sm font-bold text-ink dark:text-gray-100">
                {formatAOA(totalReal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-mid/50">Diferença</p>
              <p
                className={`text-sm font-bold ${
                  totalReal > totalPrevisto
                    ? "text-danger dark:text-red-400"
                    : "text-live dark:text-emerald-400"
                }`}
              >
                {totalReal > totalPrevisto ? "+" : ""}
                {formatAOA(totalReal - totalPrevisto)}
              </p>
            </div>
            <DesvioChip pct={totalDesvio} />
          </div>
        </div>
      )}
    </div>
  );
}
