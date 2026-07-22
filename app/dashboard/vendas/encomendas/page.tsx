"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Calendar,
  User,
  ChevronDown,
} from "lucide-react";

const ENCOMENDAS = [
  {
    id: "ENC-2026-0041",
    cliente: "Supermercado Nosso Super — Luanda",
    data: "2026-06-15",
    dataEntrega: "2026-06-20",
    produtos: [
      { nome: "Lixívia KITOKA 5L", qty: 120 },
      { nome: "Hipoclorito de Sódio 20L", qty: 30 },
    ],
    valorTotal: 1_245_600,
    estado: "Confirmada",
    vendedor: "Armindo Ferreira",
  },
  {
    id: "ENC-2026-0040",
    cliente: "Distribuidora Kero Talatona",
    data: "2026-06-14",
    dataEntrega: "2026-06-18",
    produtos: [{ nome: "Lixívia KITOKA 1L", qty: 500 }],
    valorTotal: 875_000,
    estado: "Entregue",
    vendedor: "Fernanda Nzinga",
  },
  {
    id: "ENC-2026-0039",
    cliente: "Hospital Geral de Luanda",
    data: "2026-06-13",
    dataEntrega: "2026-06-17",
    produtos: [
      { nome: "Hipoclorito de Sódio 200L", qty: 5 },
      { nome: "Hipoclorito de Sódio 20L", qty: 20 },
    ],
    valorTotal: 3_120_000,
    estado: "Entregue",
    vendedor: "Armindo Ferreira",
  },
  {
    id: "ENC-2026-0038",
    cliente: "Clínica Sagrada Esperança",
    data: "2026-06-12",
    dataEntrega: "2026-06-25",
    produtos: [{ nome: "Hipoclorito de Sódio 20L", qty: 40 }],
    valorTotal: 960_000,
    estado: "Pendente",
    vendedor: "Celeste Domingos",
  },
  {
    id: "ENC-2026-0037",
    cliente: "EMAB — Empresa de Águas de Benguela",
    data: "2026-06-11",
    dataEntrega: "2026-06-16",
    produtos: [{ nome: "Hipoclorito de Sódio 1000L IBC", qty: 2 }],
    valorTotal: 2_800_000,
    estado: "Entregue",
    vendedor: "Fernanda Nzinga",
  },
  {
    id: "ENC-2026-0036",
    cliente: "Ministério da Saúde — DNSP",
    data: "2026-06-10",
    dataEntrega: "2026-06-28",
    produtos: [
      { nome: "Lixívia KITOKA 5L", qty: 300 },
      { nome: "Lixívia KITOKA 1L", qty: 600 },
    ],
    valorTotal: 5_460_000,
    estado: "Confirmada",
    vendedor: "Armindo Ferreira",
  },
  {
    id: "ENC-2026-0035",
    cliente: "Hotel Intercontinental Luanda",
    data: "2026-06-09",
    dataEntrega: "2026-06-12",
    produtos: [
      { nome: "Lixívia KITOKA 5L", qty: 60 },
      { nome: "Hipoclorito de Sódio 20L", qty: 10 },
    ],
    valorTotal: 862_000,
    estado: "Cancelada",
    vendedor: "Celeste Domingos",
  },
  {
    id: "ENC-2026-0034",
    cliente: "EPAL — Empresa Pública de Águas de Luanda",
    data: "2026-06-08",
    dataEntrega: "2026-06-15",
    produtos: [{ nome: "Hipoclorito de Sódio 1000L IBC", qty: 6 }],
    valorTotal: 8_400_000,
    estado: "Entregue",
    vendedor: "Armindo Ferreira",
  },
  {
    id: "ENC-2026-0033",
    cliente: "Shoprite Angola — Viana",
    data: "2026-06-07",
    dataEntrega: "2026-06-22",
    produtos: [
      { nome: "Lixívia KITOKA 1L", qty: 1000 },
      { nome: "Lixívia KITOKA 5L", qty: 200 },
    ],
    valorTotal: 3_850_000,
    estado: "Pendente",
    vendedor: "Fernanda Nzinga",
  },
  {
    id: "ENC-2026-0032",
    cliente: "Governo Provincial do Huambo",
    data: "2026-06-05",
    dataEntrega: "2026-06-10",
    produtos: [{ nome: "Hipoclorito de Sódio 200L", qty: 8 }],
    valorTotal: 2_240_000,
    estado: "Entregue",
    vendedor: "Celeste Domingos",
  },
];

const ESTADOS = ["Todos", "Pendente", "Confirmada", "Entregue", "Cancelada"];

function formatAOA(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type Estado = "Pendente" | "Confirmada" | "Entregue" | "Cancelada";

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<Estado, { icon: React.ReactNode; classes: string }> = {
    Pendente: {
      icon: <Clock className="w-3 h-3" />,
      classes:
        "bg-amber/15 text-amber dark:bg-amber-900/40 dark:text-amber-300",
    },
    Confirmada: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      classes:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    Entregue: {
      icon: <Truck className="w-3 h-3" />,
      classes:
        "bg-live-dim text-live dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    Cancelada: {
      icon: <XCircle className="w-3 h-3" />,
      classes: "bg-danger/10 text-danger dark:bg-red-900/40 dark:text-red-300",
    },
  };

  const c = config[estado as Estado] ?? {
    icon: null,
    classes: "bg-surface text-ink-mid",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.classes}`}
    >
      {c.icon}
      {estado}
    </span>
  );
}

export default function EncomendasPage() {
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busca, setBusca] = useState("");

  const encomendasFiltradas = ENCOMENDAS.filter((e) => {
    const matchEstado =
      filtroEstado === "Todos" || e.estado === filtroEstado;
    const matchBusca =
      busca === "" ||
      e.id.toLowerCase().includes(busca.toLowerCase()) ||
      e.cliente.toLowerCase().includes(busca.toLowerCase());
    return matchEstado && matchBusca;
  });

  const totais = {
    pendente: ENCOMENDAS.filter((e) => e.estado === "Pendente").length,
    confirmada: ENCOMENDAS.filter((e) => e.estado === "Confirmada").length,
    entregue: ENCOMENDAS.filter((e) => e.estado === "Entregue").length,
    cancelada: ENCOMENDAS.filter((e) => e.estado === "Cancelada").length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <ShoppingCart className="w-6 h-6 text-ink dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink dark:text-white">
                Encomendas
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                Novo
              </span>
            </div>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 mt-0.5">
              Gestão de encomendas de clientes — Aquasan Angola
            </p>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink hover:bg-ink/90 text-white text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Encomenda
        </button>
      </div>

      {/* Banner módulo novo */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-50 border border-violet-200 dark:bg-violet-950/30 dark:border-violet-800">
        <Package className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
        <p className="text-sm text-violet-800 dark:text-violet-300">
          Módulo em desenvolvimento — funcionalidades de criação e edição serão
          activadas em breve.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Pendentes",
            value: totais.pendente,
            color: "text-amber dark:text-amber-400",
            bg: "bg-amber/8 dark:bg-amber/10",
            icon: <Clock className="w-5 h-5" />,
          },
          {
            label: "Confirmadas",
            value: totais.confirmada,
            color: "text-ink dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            icon: <CheckCircle2 className="w-5 h-5" />,
          },
          {
            label: "Entregues",
            value: totais.entregue,
            color: "text-live dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            icon: <Truck className="w-5 h-5" />,
          },
          {
            label: "Canceladas",
            value: totais.cancelada,
            color: "text-danger dark:text-red-400",
            bg: "bg-danger/8 dark:bg-red-900/20",
            icon: <XCircle className="w-5 h-5" />,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 ${kpi.bg}`}
          >
            <div className={`${kpi.color} mb-2`}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-ink dark:text-white">
              {kpi.value}
            </p>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-0.5">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mid/50" />
          <input
            type="text"
            placeholder="Pesquisar por nº encomenda ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel text-ink dark:text-white placeholder-ink-mid/50 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink appearance-none cursor-pointer"
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mid/50 pointer-events-none" />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 overflow-hidden bg-panel dark:bg-panel shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/60 dark:divide-ink-ghost/20">
            <thead>
              <tr className="bg-surface dark:bg-gray-900/40">
                {[
                  "Nº Encomenda",
                  "Cliente",
                  "Produtos",
                  "Data",
                  "Entrega Prevista",
                  "Vendedor",
                  "Valor Total",
                  "Estado",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/20">
              {encomendasFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-ink-mid/50"
                  >
                    Nenhuma encomenda encontrada.
                  </td>
                </tr>
              ) : (
                encomendasFiltradas.map((enc) => (
                  <tr
                    key={enc.id}
                    className="hover:bg-surface dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono font-medium text-ink dark:text-blue-400 whitespace-nowrap">
                      {enc.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink dark:text-white max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-ink-mid/50 shrink-0" />
                        <span className="truncate">{enc.cliente}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-mid dark:text-gray-300">
                      <div className="flex flex-col gap-0.5">
                        {enc.produtos.map((p, i) => (
                          <span key={i} className="whitespace-nowrap">
                            <span className="font-medium">{p.qty}x</span>{" "}
                            {p.nome}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-mid dark:text-gray-300 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-ink-mid/50" />
                        {formatDate(enc.data)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-mid dark:text-gray-300 whitespace-nowrap">
                      {formatDate(enc.dataEntrega)}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-mid dark:text-gray-300 whitespace-nowrap">
                      {enc.vendedor}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-ink dark:text-white whitespace-nowrap">
                      {formatAOA(enc.valorTotal)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <EstadoBadge estado={enc.estado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-ink-ghost/40 dark:border-ink-ghost/20 flex items-center justify-between">
          <p className="text-xs text-ink-mid/50">
            {encomendasFiltradas.length} de {ENCOMENDAS.length} encomendas
          </p>
          <p className="text-xs text-ink-mid/50">
            Total filtrado:{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {formatAOA(
                encomendasFiltradas.reduce((s, e) => s + e.valorTotal, 0)
              )}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
