"use client";

import { useState } from "react";
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  FileDown,
  FileText,
  BarChart2,
  Users,
  Package,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "produto" | "cliente" | "regiao" | "periodo";

interface VendaProduto {
  produto: string;
  sku: string;
  categoria: string;
  unidade: string;
  qtd: number;
  valorUnitario: number;
  total: number;
  variacao: number;
}

interface VendaCliente {
  cliente: string;
  nif: string;
  municipio: string;
  faturas: number;
  total: number;
  pendente: number;
  variacao: number;
}

interface VendaRegiao {
  provincia: string;
  municipios: number;
  clientes: number;
  total: number;
  percentagem: number;
}

interface VendaPeriodo {
  mes: string;
  abreviatura: string;
  entradas: number;
  faturas: number;
  receita: number;
  custos: number;
  margem: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const VENDAS_PRODUTO: VendaProduto[] = [
  {
    produto: "Hipoclorito de Sódio 12%",
    sku: "KTK-HCL-12",
    categoria: "Desinfectante",
    unidade: "litros",
    qtd: 84_500,
    valorUnitario: 950,
    total: 80_275_000,
    variacao: 12.4,
  },
  {
    produto: "Lixívia Industrial 5L",
    sku: "KTK-LX-5L",
    categoria: "Desinfectante",
    unidade: "unidades",
    qtd: 12_200,
    valorUnitario: 2_800,
    total: 34_160_000,
    variacao: 7.8,
  },
  {
    produto: "Hipoclorito de Cálcio 70%",
    sku: "KTK-HCC-70",
    categoria: "Desinfectante",
    unidade: "kg",
    qtd: 9_800,
    valorUnitario: 4_200,
    total: 41_160_000,
    variacao: 18.2,
  },
  {
    produto: "Lixívia Doméstica 1L",
    sku: "KTK-LX-1L",
    categoria: "Higiene",
    unidade: "unidades",
    qtd: 45_000,
    valorUnitario: 850,
    total: 38_250_000,
    variacao: -3.1,
  },
  {
    produto: "Água Tratada Bidão 20L",
    sku: "KTK-AT-20L",
    categoria: "Água Potável",
    unidade: "unidades",
    qtd: 22_400,
    valorUnitario: 3_500,
    total: 78_400_000,
    variacao: 5.6,
  },
  {
    produto: "Cloro Granulado 25kg",
    sku: "KTK-CG-25",
    categoria: "Desinfectante",
    unidade: "sacos",
    qtd: 3_100,
    valorUnitario: 18_500,
    total: 57_350_000,
    variacao: 9.3,
  },
  {
    produto: "Sulfato de Alumínio 50kg",
    sku: "KTK-SA-50",
    categoria: "Coagulante",
    unidade: "sacos",
    qtd: 1_800,
    valorUnitario: 24_000,
    total: 43_200_000,
    variacao: 2.1,
  },
];

const VENDAS_CLIENTE: VendaCliente[] = [
  {
    cliente: "EPAL — Empresa Pública de Águas de Luanda",
    nif: "5000012345",
    municipio: "Luanda",
    faturas: 24,
    total: 142_800_000,
    pendente: 18_500_000,
    variacao: 14.2,
  },
  {
    cliente: "SSSAS — Serviço Social das Forças Armadas",
    nif: "5000067890",
    municipio: "Luanda",
    faturas: 12,
    total: 68_450_000,
    pendente: 0,
    variacao: 6.8,
  },
  {
    cliente: "Governo Provincial do Huambo",
    nif: "5000031122",
    municipio: "Huambo",
    faturas: 8,
    total: 54_200_000,
    pendente: 9_200_000,
    variacao: 22.1,
  },
  {
    cliente: "Município do Lubango — DEAS",
    nif: "5000044556",
    municipio: "Lubango",
    faturas: 6,
    total: 38_750_000,
    pendente: 4_100_000,
    variacao: -1.4,
  },
  {
    cliente: "Pró-Água Serviços Hídricos Lda",
    nif: "5000099001",
    municipio: "Benguela",
    faturas: 15,
    total: 35_600_000,
    pendente: 0,
    variacao: 8.9,
  },
  {
    cliente: "Hospital Geral do Cuito",
    nif: "5000072233",
    municipio: "Bié",
    faturas: 4,
    total: 22_100_000,
    pendente: 3_800_000,
    variacao: 31.5,
  },
  {
    cliente: "SuperMercado HiperShopping Angola",
    nif: "5000088412",
    municipio: "Luanda",
    faturas: 18,
    total: 19_800_000,
    pendente: 2_200_000,
    variacao: 4.7,
  },
];

const VENDAS_REGIAO: VendaRegiao[] = [
  { provincia: "Luanda",        municipios: 9,  clientes: 142, total: 312_400_000, percentagem: 46.2 },
  { provincia: "Huambo",        municipios: 11, clientes: 38,  total: 87_600_000,  percentagem: 13.0 },
  { provincia: "Benguela",      municipios: 10, clientes: 44,  total: 74_200_000,  percentagem: 11.0 },
  { provincia: "Huíla",         municipios: 14, clientes: 29,  total: 58_100_000,  percentagem: 8.6 },
  { provincia: "Bié",           municipios: 9,  clientes: 18,  total: 41_300_000,  percentagem: 6.1 },
  { provincia: "Malanje",       municipios: 14, clientes: 12,  total: 28_900_000,  percentagem: 4.3 },
  { provincia: "Cabinda",       municipios: 4,  clientes: 9,   total: 22_400_000,  percentagem: 3.3 },
  { provincia: "Kwanza Norte",  municipios: 11, clientes: 7,   total: 18_700_000,  percentagem: 2.8 },
  { provincia: "Outras",        municipios: 0,  clientes: 14,  total: 32_800_000,  percentagem: 4.7 },
];

const VENDAS_PERIODO: VendaPeriodo[] = [
  { mes: "Janeiro 2026",   abreviatura: "Jan", entradas: 18, faturas: 52, receita: 68_400_000,  custos: 42_100_000, margem: 38.5 },
  { mes: "Fevereiro 2026", abreviatura: "Fev", entradas: 15, faturas: 44, receita: 59_200_000,  custos: 37_800_000, margem: 36.1 },
  { mes: "Março 2026",     abreviatura: "Mar", entradas: 22, faturas: 61, receita: 81_500_000,  custos: 50_200_000, margem: 38.4 },
  { mes: "Abril 2026",     abreviatura: "Abr", entradas: 19, faturas: 55, receita: 74_800_000,  custos: 46_500_000, margem: 37.8 },
  { mes: "Maio 2026",      abreviatura: "Mai", entradas: 24, faturas: 68, receita: 92_100_000,  custos: 56_300_000, margem: 38.9 },
  { mes: "Junho 2026",     abreviatura: "Jun", entradas: 21, faturas: 72, receita: 100_400_000, custos: 61_200_000, margem: 39.0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function VariacaoBadge({ v }: { v: number }) {
  if (v > 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-live dark:text-live">
        <TrendingUp className="w-3 h-3" />
        +{v.toFixed(1)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger dark:text-red-400">
      <TrendingDown className="w-3 h-3" />
      {v.toFixed(1)}%
    </span>
  );
}

function MiniBar({ pct, color = "bg-blue-500" }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded-full h-1.5 overflow-hidden mt-1">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── KPI totals ───────────────────────────────────────────────────────────────

const totalReceita = VENDAS_PERIODO.reduce((s, p) => s + p.receita, 0);
const totalFaturas = VENDAS_PERIODO.reduce((s, p) => s + p.faturas, 0);
const totalClientes = VENDAS_CLIENTE.length;
const margemMedia =
  VENDAS_PERIODO.reduce((s, p) => s + p.margem, 0) / VENDAS_PERIODO.length;

// ─── Tab content components ───────────────────────────────────────────────────

function TabProduto() {
  const maxTotal = Math.max(...VENDAS_PRODUTO.map((p) => p.total));
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
        <thead className="bg-surface dark:bg-gray-900/40">
          <tr>
            {["Produto", "SKU", "Categoria", "Quantidade", "Preço Unit.", "Total", "Var. YoY"].map((h) => (
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
          {VENDAS_PRODUTO.map((p) => (
            <tr key={p.sku} className="hover:bg-surface dark:hover:bg-gray-700/40 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <Package className="w-3.5 h-3.5 text-ink dark:text-blue-400" />
                  </span>
                  <span className="font-medium text-ink dark:text-white max-w-xs leading-snug">
                    {p.produto}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 font-mono text-xs text-ink-mid/70 whitespace-nowrap">{p.sku}</td>
              <td className="px-4 py-4">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  {p.categoria}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {p.qtd.toLocaleString("pt-AO")} {p.unidade}
              </td>
              <td className="px-4 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {formatAOA(p.valorUnitario)}
              </td>
              <td className="px-4 py-4">
                <div>
                  <p className="font-bold text-ink dark:text-white whitespace-nowrap">
                    {formatAOA(p.total)}
                  </p>
                  <MiniBar pct={(p.total / maxTotal) * 100} color="bg-blue-500" />
                </div>
              </td>
              <td className="px-4 py-4">
                <VariacaoBadge v={p.variacao} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabCliente() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
        <thead className="bg-surface dark:bg-gray-900/40">
          <tr>
            {["Cliente", "NIF", "Município", "Faturas", "Total Vendido", "Pendente", "Var. YoY"].map((h) => (
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
          {VENDAS_CLIENTE.map((c) => (
            <tr key={c.nif} className="hover:bg-surface dark:hover:bg-gray-700/40 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                    <Users className="w-3.5 h-3.5 text-live dark:text-live" />
                  </span>
                  <span className="font-medium text-ink dark:text-white max-w-xs leading-snug">
                    {c.cliente}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 font-mono text-xs text-ink-mid/70 whitespace-nowrap">{c.nif}</td>
              <td className="px-4 py-4 text-ink-mid dark:text-gray-400 whitespace-nowrap">{c.municipio}</td>
              <td className="px-4 py-4 text-center">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {c.faturas}
                </span>
              </td>
              <td className="px-4 py-4 font-bold text-ink dark:text-white whitespace-nowrap">
                {formatAOA(c.total)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {c.pendente > 0 ? (
                  <span className="text-sm font-semibold text-amber dark:text-amber">
                    {formatAOA(c.pendente)}
                  </span>
                ) : (
                  <span className="text-xs text-live dark:text-live font-semibold">Liquidado</span>
                )}
              </td>
              <td className="px-4 py-4">
                <VariacaoBadge v={c.variacao} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabRegiao() {
  const maxTotal = Math.max(...VENDAS_REGIAO.map((r) => r.total));
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
        <thead className="bg-surface dark:bg-gray-900/40">
          <tr>
            {["Província", "Municípios cobertos", "Clientes", "Total de Vendas", "Quota de Mercado"].map((h) => (
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
          {VENDAS_REGIAO.map((r) => (
            <tr key={r.provincia} className="hover:bg-surface dark:hover:bg-gray-700/40 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-amber/15 dark:bg-amber-900/30">
                    <MapPin className="w-3.5 h-3.5 text-amber dark:text-amber" />
                  </span>
                  <span className="font-semibold text-ink dark:text-white">{r.provincia}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-center text-gray-700 dark:text-gray-300">{r.municipios || "—"}</td>
              <td className="px-4 py-4 text-center">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {r.clientes}
                </span>
              </td>
              <td className="px-4 py-4">
                <div>
                  <p className="font-bold text-ink dark:text-white whitespace-nowrap">{formatAOA(r.total)}</p>
                  <MiniBar pct={(r.total / maxTotal) * 100} color="bg-amber" />
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-amber"
                      style={{ width: `${r.percentagem}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {r.percentagem.toFixed(1)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabPeriodo() {
  const maxReceita = Math.max(...VENDAS_PERIODO.map((p) => p.receita));
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
        <thead className="bg-surface dark:bg-gray-900/40">
          <tr>
            {["Mês", "Entradas", "Faturas Emitidas", "Receita", "Custos COGS", "Margem Bruta"].map((h) => (
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
          {VENDAS_PERIODO.map((p) => (
            <tr key={p.mes} className="hover:bg-surface dark:hover:bg-gray-700/40 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </span>
                  <span className="font-semibold text-ink dark:text-white whitespace-nowrap">{p.mes}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {p.entradas}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {p.faturas}
                </span>
              </td>
              <td className="px-4 py-4">
                <div>
                  <p className="font-bold text-ink dark:text-white whitespace-nowrap">
                    {formatAOA(p.receita)}
                  </p>
                  <MiniBar pct={(p.receita / maxReceita) * 100} color="bg-indigo-500" />
                </div>
              </td>
              <td className="px-4 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {formatAOA(p.custos)}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      p.margem >= 38
                        ? "text-live dark:text-live"
                        : "text-amber dark:text-amber"
                    }`}
                  >
                    {p.margem.toFixed(1)}%
                  </span>
                  <div className="w-16 bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-live"
                      style={{ width: `${p.margem}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-surface dark:bg-gray-900/30 font-semibold">
            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">TOTAL H1 2026</td>
            <td className="px-4 py-4 text-center text-sm text-ink dark:text-white">
              {VENDAS_PERIODO.reduce((s, p) => s + p.entradas, 0)}
            </td>
            <td className="px-4 py-4 text-center text-sm text-ink dark:text-white">
              {totalFaturas}
            </td>
            <td className="px-4 py-4 text-sm font-bold text-ink dark:text-white whitespace-nowrap">
              {formatAOA(totalReceita)}
            </td>
            <td className="px-4 py-4 text-sm font-bold text-ink dark:text-white whitespace-nowrap">
              {formatAOA(VENDAS_PERIODO.reduce((s, p) => s + p.custos, 0))}
            </td>
            <td className="px-4 py-4 text-sm font-bold text-live dark:text-live">
              {margemMedia.toFixed(1)}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "produto",  label: "Por Produto",  icon: <Package  className="w-4 h-4" /> },
  { key: "cliente",  label: "Por Cliente",  icon: <Users    className="w-4 h-4" /> },
  { key: "regiao",   label: "Por Região",   icon: <MapPin   className="w-4 h-4" /> },
  { key: "periodo",  label: "Por Período",  icon: <Calendar className="w-4 h-4" /> },
];

export default function RelatorioVendasPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("produto");
  const [periodoInicio, setPeriodoInicio] = useState<string>("2026-01-01");
  const [periodoFim, setPeriodoFim]       = useState<string>("2026-06-30");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-ink dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Relatório de Vendas
            </h1>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Análise por produto, cliente, região e período
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-gray-700 dark:text-gray-300 hover:bg-surface dark:hover:bg-gray-700 transition-colors">
            <FileDown className="w-4 h-4 text-live" />
            Exportar Excel
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-gray-700 dark:text-gray-300 hover:bg-surface dark:hover:bg-gray-700 transition-colors">
            <FileText className="w-4 h-4 text-danger" />
            Exportar PDF
          </button>
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-gray-700 dark:text-gray-300 hover:bg-surface dark:hover:bg-gray-700 transition-colors"
            title="Alternar ordenação"
          >
            {sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            Ordenação
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
            Data início
          </label>
          <input
            type="date"
            value={periodoInicio}
            onChange={(e) => setPeriodoInicio(e.target.value)}
            className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
            Data fim
          </label>
          <input
            type="date"
            value={periodoFim}
            onChange={(e) => setPeriodoFim(e.target.value)}
            className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
            Categoria de produto
          </label>
          <select className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
            <option value="">Todas</option>
            <option value="desinfectante">Desinfectante</option>
            <option value="agua">Água Potável</option>
            <option value="coagulante">Coagulante</option>
            <option value="higiene">Higiene</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">
            Região
          </label>
          <select className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
            <option value="">Todas as províncias</option>
            <option value="luanda">Luanda</option>
            <option value="huambo">Huambo</option>
            <option value="benguela">Benguela</option>
            <option value="huila">Huíla</option>
          </select>
        </div>
        <button
          onClick={() => { setPeriodoInicio("2026-01-01"); setPeriodoFim("2026-06-30"); }}
          className="px-3 py-2 rounded-lg text-sm border border-ink-ghost/80 dark:border-gray-600 text-ink-mid/70 hover:bg-surface dark:hover:bg-gray-700 transition-colors"
        >
          Limpar filtros
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <ShoppingCart className="w-4 h-4 text-ink dark:text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
              Receita H1 2026
            </span>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-white">
            {formatAOACompact(totalReceita)}
          </p>
          <p className="text-xs text-ink-mid/50 mt-1">Jan – Jun 2026</p>
        </div>

        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
              <TrendingUp className="w-4 h-4 text-live dark:text-live" />
            </div>
            <span className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
              Margem Média
            </span>
          </div>
          <p className="text-2xl font-bold text-live dark:text-live">
            {margemMedia.toFixed(1)}%
          </p>
          <p className="text-xs text-ink-mid/50 mt-1">Margem bruta período</p>
        </div>

        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-md">
              <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
              Faturas Emitidas
            </span>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-white">{totalFaturas}</p>
          <p className="text-xs text-ink-mid/50 mt-1">Total do período</p>
        </div>

        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber/15 dark:bg-amber-900/30 rounded-md">
              <Users className="w-4 h-4 text-amber dark:text-amber" />
            </div>
            <span className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
              Clientes Activos
            </span>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-white">{totalClientes}</p>
          <p className="text-xs text-ink-mid/50 mt-1">Com compras no período</p>
        </div>
      </div>

      {/* BI Chart Placeholder */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-dashed border-ink-ghost/80 dark:border-gray-600 p-8 flex flex-col items-center justify-center gap-3 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <BarChart2 className="w-8 h-8 text-ink-mid/50 dark:text-blue-500" />
        </div>
        <p className="text-base font-semibold text-ink-mid/70 dark:text-ink-mid/60">
          Gráfico — integração BI em curso
        </p>
        <p className="text-sm text-ink-mid/50 dark:text-ink-mid/40 max-w-md">
          Visualização de barras e linha de tendência de vendas mensais por produto. Será integrado com o módulo de BI após configuração do conector de dados.
        </p>
      </div>

      {/* Tab navigation + content */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-ink-ghost/60 dark:border-ink-ghost/20 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-ink text-ink dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                  : "border-transparent text-ink-mid/70 dark:text-ink-mid/60 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-surface dark:hover:bg-gray-700/40"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "produto"  && <TabProduto />}
          {activeTab === "cliente"  && <TabCliente />}
          {activeTab === "regiao"   && <TabRegiao />}
          {activeTab === "periodo"  && <TabPeriodo />}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-surface dark:bg-gray-900/20 border-t border-ink-ghost/40 dark:border-gray-700">
          <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40">
            Dados do período {periodoInicio} → {periodoFim} · Gerado em{" "}
            {new Date().toLocaleDateString("pt-PT")}
          </p>
        </div>
      </div>
    </div>
  );
}
