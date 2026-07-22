"use client";

import { useState } from "react";
import {
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  FileDown,
  Printer,
  BarChart3,
  Package,
  Building2,
  Calendar,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CompraItem {
  id: string;
  codigo: string;
  data: string;
  fornecedor: string;
  categoria: string;
  produto: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  total: number;
  iva_taxa: number;
  total_iva: number;
  estado: "recebido" | "pendente" | "parcial" | "cancelado";
  operador: string;
}

interface KpiCard {
  label: string;
  value: string;
  sub: string;
  trend: number | null;
  color: string;
}

// ---------------------------------------------------------------------------
// Mock data — realistic Angolan water treatment company (Aquasan / KITOKA)
// ---------------------------------------------------------------------------

const COMPRAS: CompraItem[] = [
  {
    id: "1",
    codigo: "OC-2026-0041",
    data: "2026-06-02",
    fornecedor: "KITOKA Industrial Lda",
    categoria: "Químicos",
    produto: "Hipoclorito de Sódio 12% — Granel",
    quantidade: 8_000,
    unidade: "L",
    preco_unitario: 420,
    total: 3_360_000,
    iva_taxa: 14,
    total_iva: 470_400,
    estado: "recebido",
    operador: "Esperança Neto",
  },
  {
    id: "2",
    codigo: "OC-2026-0042",
    data: "2026-06-04",
    fornecedor: "KITOKA Industrial Lda",
    categoria: "Químicos",
    produto: "Lixívia KITOKA 5 L (caixas 4 un)",
    quantidade: 2_400,
    unidade: "L",
    preco_unitario: 650,
    total: 1_560_000,
    iva_taxa: 14,
    total_iva: 218_400,
    estado: "recebido",
    operador: "Armindo Tchioma",
  },
  {
    id: "3",
    codigo: "OC-2026-0043",
    data: "2026-06-05",
    fornecedor: "Aqua Chemical Angola",
    categoria: "Químicos",
    produto: "Sulfato de Alumínio — Sacos 25 kg",
    quantidade: 5_000,
    unidade: "kg",
    preco_unitario: 380,
    total: 1_900_000,
    iva_taxa: 14,
    total_iva: 266_000,
    estado: "recebido",
    operador: "Benedita Lopes",
  },
  {
    id: "4",
    codigo: "OC-2026-0044",
    data: "2026-06-07",
    fornecedor: "KITOKA Industrial Lda",
    categoria: "Químicos",
    produto: "Hipoclorito de Sódio 12% — Barris 200 L",
    quantidade: 4_000,
    unidade: "L",
    preco_unitario: 445,
    total: 1_780_000,
    iva_taxa: 14,
    total_iva: 249_200,
    estado: "recebido",
    operador: "Esperança Neto",
  },
  {
    id: "5",
    codigo: "OC-2026-0045",
    data: "2026-06-09",
    fornecedor: "Luanda Embalagens SA",
    categoria: "Embalagens",
    produto: "Garrafas PEAD 1 L — Caixas 500 un",
    quantidade: 50_000,
    unidade: "un",
    preco_unitario: 85,
    total: 4_250_000,
    iva_taxa: 14,
    total_iva: 595_000,
    estado: "recebido",
    operador: "Armindo Tchioma",
  },
  {
    id: "6",
    codigo: "OC-2026-0046",
    data: "2026-06-10",
    fornecedor: "Luanda Embalagens SA",
    categoria: "Embalagens",
    produto: "Tampas Rosca 28 mm — Sacos 1 000 un",
    quantidade: 60_000,
    unidade: "un",
    preco_unitario: 28,
    total: 1_680_000,
    iva_taxa: 14,
    total_iva: 235_200,
    estado: "recebido",
    operador: "Benedita Lopes",
  },
  {
    id: "7",
    codigo: "OC-2026-0047",
    data: "2026-06-11",
    fornecedor: "Tecnilab Angola",
    categoria: "Laboratório",
    produto: "Reagentes DPD para cloro residual",
    quantidade: 10,
    unidade: "kit",
    preco_unitario: 420_000,
    total: 4_200_000,
    iva_taxa: 14,
    total_iva: 588_000,
    estado: "pendente",
    operador: "João Sebastião",
  },
  {
    id: "8",
    codigo: "OC-2026-0048",
    data: "2026-06-12",
    fornecedor: "Tecnilab Angola",
    categoria: "Laboratório",
    produto: "Turbidímetro portátil HM-500",
    quantidade: 2,
    unidade: "un",
    preco_unitario: 1_850_000,
    total: 3_700_000,
    iva_taxa: 14,
    total_iva: 518_000,
    estado: "pendente",
    operador: "João Sebastião",
  },
  {
    id: "9",
    codigo: "OC-2026-0049",
    data: "2026-06-14",
    fornecedor: "Angola Diesel & Lubrificantes",
    categoria: "Combustíveis",
    produto: "Gasóleo Industrial — Litros",
    quantidade: 5_000,
    unidade: "L",
    preco_unitario: 390,
    total: 1_950_000,
    iva_taxa: 14,
    total_iva: 273_000,
    estado: "recebido",
    operador: "Armindo Tchioma",
  },
  {
    id: "10",
    codigo: "OC-2026-0050",
    data: "2026-06-16",
    fornecedor: "KITOKA Industrial Lda",
    categoria: "Químicos",
    produto: "Lixívia KITOKA 20 L (bombonas)",
    quantidade: 1_000,
    unidade: "L",
    preco_unitario: 620,
    total: 620_000,
    iva_taxa: 14,
    total_iva: 86_800,
    estado: "parcial",
    operador: "Esperança Neto",
  },
  {
    id: "11",
    codigo: "OC-2026-0051",
    data: "2026-06-17",
    fornecedor: "Aqua Chemical Angola",
    categoria: "Químicos",
    produto: "Policloreto de Alumínio — Tambores 200 kg",
    quantidade: 2_000,
    unidade: "kg",
    preco_unitario: 510,
    total: 1_020_000,
    iva_taxa: 14,
    total_iva: 142_800,
    estado: "recebido",
    operador: "Benedita Lopes",
  },
  {
    id: "12",
    codigo: "OC-2026-0052",
    data: "2026-06-18",
    fornecedor: "Grafiteca Angola",
    categoria: "Escritório",
    produto: "Material de Escritório — Lote Mensal",
    quantidade: 1,
    unidade: "lote",
    preco_unitario: 380_000,
    total: 380_000,
    iva_taxa: 14,
    total_iva: 53_200,
    estado: "recebido",
    operador: "Benedita Lopes",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAOA(value: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAOACompact(value: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    notation: "compact",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

const ESTADO_CONFIG: Record<
  CompraItem["estado"],
  { label: string; bg: string; text: string }
> = {
  recebido: {
    label: "Recebido",
    bg: "bg-live-dim dark:bg-emerald-900/30",
    text: "text-live dark:text-live",
  },
  pendente: {
    label: "Pendente",
    bg: "bg-amber/15 dark:bg-amber-900/30",
    text: "text-amber dark:text-amber",
  },
  parcial: {
    label: "Parcial",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  cancelado: {
    label: "Cancelado",
    bg: "bg-danger/10 dark:bg-red-900/30",
    text: "text-danger dark:text-red-400",
  },
};

const CATEGORIAS = ["Todas", ...Array.from(new Set(COMPRAS.map((c) => c.categoria)))];
const ESTADOS = ["Todos", "recebido", "pendente", "parcial", "cancelado"] as const;
type EstadoFilter = (typeof ESTADOS)[number];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RelatorioComprasPage() {
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todas");
  const [filtroEstado, setFiltroEstado] = useState<EstadoFilter>("Todos");
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("2026-06-01");
  const [dataFim, setDataFim] = useState<string>("2026-06-30");

  const fornecedoresUnicos = Array.from(new Set(COMPRAS.map((c) => c.fornecedor)));

  const comprasFiltradas = COMPRAS.filter((c) => {
    if (filtroCategoria !== "Todas" && c.categoria !== filtroCategoria) return false;
    if (filtroEstado !== "Todos" && c.estado !== filtroEstado) return false;
    if (filtroFornecedor && c.fornecedor !== filtroFornecedor) return false;
    if (dataInicio && c.data < dataInicio) return false;
    if (dataFim && c.data > dataFim) return false;
    return true;
  });

  const totalBruto = comprasFiltradas.reduce((s, c) => s + c.total, 0);
  const totalIva = comprasFiltradas.reduce((s, c) => s + c.total_iva, 0);
  const totalComIva = totalBruto + totalIva;
  const totalPendente = comprasFiltradas
    .filter((c) => c.estado === "pendente" || c.estado === "parcial")
    .reduce((s, c) => s + c.total, 0);

  // Agrupamento por fornecedor
  const porFornecedor = fornecedoresUnicos
    .map((f) => {
      const items = comprasFiltradas.filter((c) => c.fornecedor === f);
      return { fornecedor: f, total: items.reduce((s, c) => s + c.total, 0), count: items.length };
    })
    .filter((f) => f.count > 0)
    .sort((a, b) => b.total - a.total);

  const maxFornecedor = porFornecedor[0]?.total ?? 1;

  // Agrupamento por categoria
  const porCategoria = CATEGORIAS.filter((c) => c !== "Todas").map((cat) => {
    const items = comprasFiltradas.filter((c) => c.categoria === cat);
    return { categoria: cat, total: items.reduce((s, c) => s + c.total, 0), count: items.length };
  }).filter((c) => c.count > 0).sort((a, b) => b.total - a.total);

  const kpis: KpiCard[] = [
    {
      label: "Total de Compras",
      value: formatAOACompact(totalBruto),
      sub: `${comprasFiltradas.length} encomendas`,
      trend: 8.3,
      color: "text-ink dark:text-blue-400",
    },
    {
      label: "IVA (14%)",
      value: formatAOACompact(totalIva),
      sub: "Imposto sobre compras",
      trend: null,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Total c/ IVA",
      value: formatAOACompact(totalComIva),
      sub: "Valor total liquidado",
      trend: null,
      color: "text-live dark:text-live",
    },
    {
      label: "Compras Pendentes",
      value: formatAOACompact(totalPendente),
      sub: `${comprasFiltradas.filter((c) => c.estado === "pendente" || c.estado === "parcial").length} ordens`,
      trend: -4.1,
      color: "text-amber dark:text-amber",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-ink dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Relatório de Compras
            </h1>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Análise de compras por fornecedor, categoria e período — Aquasan Angola
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-live hover:bg-green-700 text-white text-sm font-medium transition-colors">
            <FileDown className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
              Data início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
              Data fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
              Categoria
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoFilter)}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white"
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s === "Todos" ? "Todos" : ESTADO_CONFIG[s as CompraItem["estado"]].label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
              Fornecedor
            </label>
            <select
              value={filtroFornecedor}
              onChange={(e) => setFiltroFornecedor(e.target.value)}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white"
            >
              <option value="">Todos os fornecedores</option>
              {fornecedoresUnicos.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroCategoria("Todas");
                setFiltroEstado("Todos");
                setFiltroFornecedor("");
                setDataInicio("2026-06-01");
                setDataFim("2026-06-30");
              }}
              className="w-full text-xs text-ink-mid/70 border border-ink-ghost/80 dark:border-gray-600 rounded-lg py-2 hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5 shadow-sm"
          >
            <p className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <div className="mt-1 flex items-center gap-1">
              {kpi.trend !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    kpi.trend >= 0
                      ? "text-live dark:text-live"
                      : "text-danger dark:text-red-400"
                  }`}
                >
                  {kpi.trend >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {kpi.trend > 0 ? "+" : ""}
                  {kpi.trend.toFixed(1)}%
                </span>
              )}
              <span className="text-xs text-ink-mid/50 dark:text-ink-mid/40">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico placeholder + por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico BI */}
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Evolução de Compras
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-dashed border-blue-200 dark:border-blue-800 min-h-[160px]">
            <div className="text-center px-4">
              <BarChart3 className="w-8 h-8 text-blue-300 dark:text-blue-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink dark:text-ink">
                Gráfico — integração BI em curso
              </p>
              <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 mt-1">
                Evolução mensal de compras por categoria
              </p>
            </div>
          </div>
        </div>

        {/* Por categoria */}
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Por Categoria
            </h2>
          </div>
          <div className="space-y-3">
            {porCategoria.length === 0 ? (
              <p className="text-sm text-ink-mid/50 text-center py-4">Sem dados</p>
            ) : (
              porCategoria.map((cat) => {
                const pct = Math.round((cat.total / totalBruto) * 100) || 0;
                return (
                  <div key={cat.categoria}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {cat.categoria}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-ink dark:text-white">
                          {formatAOACompact(cat.total)}
                        </span>
                        <span className="text-xs text-ink-mid/50 ml-1">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface dark:bg-ink-ghost/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-purple-500 dark:bg-purple-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Por fornecedor */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Compras por Fornecedor
          </h2>
        </div>
        {porFornecedor.length === 0 ? (
          <p className="text-sm text-ink-mid/50 text-center py-4">Sem dados para o período seleccionado.</p>
        ) : (
          <div className="space-y-3">
            {porFornecedor.map((f) => {
              const pct = Math.round((f.total / maxFornecedor) * 100);
              const sharePct = Math.round((f.total / totalBruto) * 100) || 0;
              return (
                <div key={f.fornecedor} className="flex items-center gap-3">
                  <div className="w-48 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {f.fornecedor}
                    </p>
                    <p className="text-xs text-ink-mid/50">
                      {f.count} encomenda{f.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-surface dark:bg-ink-ghost/20 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-40 text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-ink dark:text-white">
                      {formatAOA(f.total)}
                    </span>
                    <span className="text-xs text-ink-mid/50 ml-1">({sharePct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabela principal */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Detalhe de Compras
            </h2>
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {comprasFiltradas.length} registos
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                {[
                  "Código",
                  "Data",
                  "Fornecedor",
                  "Produto",
                  "Categ.",
                  "Qtd.",
                  "Preço Unit.",
                  "Total s/IVA",
                  "IVA",
                  "Total c/IVA",
                  "Estado",
                  "Operador",
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
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {comprasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-ink-mid/50 py-10 text-sm">
                    Sem compras para os filtros seleccionados.
                  </td>
                </tr>
              ) : (
                comprasFiltradas.map((c) => {
                  const estado = ESTADO_CONFIG[c.estado];
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-surface dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">
                        {c.codigo}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(c.data).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {c.fornecedor}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[220px]">
                        <span className="line-clamp-2">{c.produto}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface text-ink-mid dark:bg-surface dark:bg-ink-ghost/20 dark:text-ink-mid/60">
                          {c.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {c.quantidade.toLocaleString("pt-PT")} {c.unidade}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap font-mono text-xs">
                        {formatAOA(c.preco_unitario)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white whitespace-nowrap">
                        {formatAOA(c.total)}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-600 dark:text-purple-400 whitespace-nowrap font-mono text-xs">
                        {formatAOA(c.total_iva)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-live dark:text-live whitespace-nowrap">
                        {formatAOA(c.total + c.total_iva)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${estado.bg} ${estado.text}`}
                        >
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/60 whitespace-nowrap text-xs">
                        {c.operador}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {comprasFiltradas.length > 0 && (
              <tfoot className="bg-surface dark:bg-gray-800/50 font-semibold">
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    TOTAL ({comprasFiltradas.length} registos)
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-ink dark:text-white whitespace-nowrap">
                    {formatAOA(totalBruto)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                    {formatAOA(totalIva)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-live dark:text-live whitespace-nowrap">
                    {formatAOA(totalComIva)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="px-6 py-3 bg-surface dark:bg-gray-800/30 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
          <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40">
            Dados de compras — Aquasan Angola · Produto KITOKA · Período:{" "}
            {dataInicio ? new Date(dataInicio).toLocaleDateString("pt-PT") : "Início"} →{" "}
            {dataFim ? new Date(dataFim).toLocaleDateString("pt-PT") : "Fim"}
          </p>
        </div>
      </div>
    </div>
  );
}
