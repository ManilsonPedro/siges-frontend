"use client";

import { useState } from "react";
import {
  Banknote,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  User,
  RefreshCw,
  FileText,
} from "lucide-react";

const COBRANCAS = [
  {
    id: "FAT-2026-0198",
    cliente: "Supermercado Nosso Super — Luanda",
    valor: 1_245_600,
    emissao: "2026-04-10",
    vencimento: "2026-05-10",
    diasAtraso: 39,
    estado: "Vencido",
    contacto: "+244 923 456 789",
  },
  {
    id: "FAT-2026-0201",
    cliente: "Distribuidora Kero Talatona",
    valor: 875_000,
    emissao: "2026-05-20",
    vencimento: "2026-06-20",
    diasAtraso: 0,
    estado: "A Vencer",
    contacto: "+244 912 345 678",
  },
  {
    id: "FAT-2026-0185",
    cliente: "Hospital Geral de Luanda",
    valor: 3_120_000,
    emissao: "2026-03-15",
    vencimento: "2026-04-15",
    diasAtraso: 64,
    estado: "Vencido",
    contacto: "+244 934 567 890",
  },
  {
    id: "FAT-2026-0209",
    cliente: "Clínica Sagrada Esperança",
    valor: 960_000,
    emissao: "2026-06-01",
    vencimento: "2026-07-01",
    diasAtraso: 0,
    estado: "A Vencer",
    contacto: "+244 945 678 901",
  },
  {
    id: "FAT-2026-0177",
    cliente: "EMAB — Empresa de Águas de Benguela",
    valor: 2_800_000,
    emissao: "2026-02-28",
    vencimento: "2026-03-30",
    diasAtraso: 80,
    estado: "Vencido",
    contacto: "+244 956 789 012",
  },
  {
    id: "FAT-2026-0212",
    cliente: "Ministério da Saúde — DNSP",
    valor: 5_460_000,
    emissao: "2026-06-10",
    vencimento: "2026-07-10",
    diasAtraso: 0,
    estado: "A Vencer",
    contacto: "+244 923 111 222",
  },
  {
    id: "FAT-2026-0190",
    cliente: "Hotel Intercontinental Luanda",
    valor: 862_000,
    emissao: "2026-04-25",
    vencimento: "2026-05-25",
    diasAtraso: 24,
    estado: "Vencido",
    contacto: "+244 912 333 444",
  },
  {
    id: "FAT-2026-0168",
    cliente: "EPAL — Empresa Pública de Águas de Luanda",
    valor: 8_400_000,
    emissao: "2026-05-02",
    vencimento: "2026-06-02",
    diasAtraso: 16,
    estado: "Vencido",
    contacto: "+244 934 555 666",
  },
  {
    id: "FAT-2026-0215",
    cliente: "Shoprite Angola — Viana",
    valor: 3_850_000,
    emissao: "2026-06-12",
    vencimento: "2026-07-12",
    diasAtraso: 0,
    estado: "A Vencer",
    contacto: "+244 945 777 888",
  },
  {
    id: "FAT-2026-0160",
    cliente: "Governo Provincial do Huambo",
    valor: 2_240_000,
    emissao: "2026-03-05",
    vencimento: "2026-04-05",
    diasAtraso: 74,
    estado: "Vencido",
    contacto: "+244 956 999 000",
  },
  {
    id: "FAT-2026-0155",
    cliente: "Farmácia Kimaluanda — Cacuaco",
    valor: 415_000,
    emissao: "2026-02-10",
    vencimento: "2026-03-10",
    diasAtraso: 100,
    estado: "Vencido",
    contacto: "+244 923 100 200",
  },
  {
    id: "FAT-2026-0204",
    cliente: "Universidade Agostinho Neto",
    valor: 1_560_000,
    emissao: "2026-05-28",
    vencimento: "2026-06-28",
    diasAtraso: 0,
    estado: "A Vencer",
    contacto: "+244 912 300 400",
  },
  {
    id: "FAT-2026-0149",
    cliente: "Escola Americana de Luanda",
    valor: 388_000,
    emissao: "2026-05-10",
    vencimento: "2026-05-25",
    diasAtraso: 0,
    estado: "Pago",
    contacto: "+244 934 500 600",
  },
  {
    id: "FAT-2026-0182",
    cliente: "Total Energies Angola",
    valor: 4_200_000,
    emissao: "2026-05-15",
    vencimento: "2026-06-15",
    diasAtraso: 0,
    estado: "Pago",
    contacto: "+244 945 700 800",
  },
  {
    id: "FAT-2026-0195",
    cliente: "Sonangol EP",
    valor: 6_750_000,
    emissao: "2026-05-22",
    vencimento: "2026-06-22",
    diasAtraso: 0,
    estado: "Pago",
    contacto: "+244 956 900 100",
  },
];

const ESTADOS_FILTRO = ["Todos", "Pago", "A Vencer", "Vencido"];

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

type EstadoCobranca = "Pago" | "A Vencer" | "Vencido";

function EstadoBadge({ estado, diasAtraso }: { estado: string; diasAtraso: number }) {
  const isAlerta = estado === "Vencido" && diasAtraso > 30;

  const config: Record<EstadoCobranca, { icon: React.ReactNode; classes: string }> = {
    Pago: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      classes:
        "bg-live-dim text-live dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    "A Vencer": {
      icon: <Clock className="w-3 h-3" />,
      classes:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    Vencido: {
      icon: <AlertTriangle className="w-3 h-3" />,
      classes: isAlerta
        ? "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200 font-semibold ring-1 ring-red-400"
        : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    },
  };

  const c = config[estado as EstadoCobranca] ?? {
    icon: null,
    classes: "bg-surface text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${c.classes}`}
    >
      {c.icon}
      {estado}
    </span>
  );
}

export default function CobrancasPage() {
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busca, setBusca] = useState("");

  const filtradas = COBRANCAS.filter((c) => {
    const matchEstado = filtroEstado === "Todos" || c.estado === filtroEstado;
    const matchBusca =
      busca === "" ||
      c.id.toLowerCase().includes(busca.toLowerCase()) ||
      c.cliente.toLowerCase().includes(busca.toLowerCase());
    return matchEstado && matchBusca;
  });

  const totalDivida = COBRANCAS.filter(
    (c) => c.estado !== "Pago"
  ).reduce((s, c) => s + c.valor, 0);

  const totalVencido = COBRANCAS.filter(
    (c) => c.estado === "Vencido"
  ).reduce((s, c) => s + c.valor, 0);

  const totalAVencer = COBRANCAS.filter(
    (c) => c.estado === "A Vencer"
  ).reduce((s, c) => s + c.valor, 0);

  const totalPago = COBRANCAS.filter(
    (c) => c.estado === "Pago"
  ).reduce((s, c) => s + c.valor, 0);

  const alertasGraves = COBRANCAS.filter(
    (c) => c.estado === "Vencido" && c.diasAtraso > 30
  );

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-live-dim dark:bg-emerald-900/30">
            <Banknote className="w-6 h-6 text-live dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink dark:text-white">
                Cobranças
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                Primavera
              </span>
            </div>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 mt-0.5">
              Controlo de cobranças e dívidas de clientes
            </p>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-surface dark:hover:bg-gray-700 transition-colors shadow-sm">
          <RefreshCw className="w-4 h-4" />
          Sincronizar
        </button>
      </div>

      {/* Banner Primavera */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 border border-sky-200 dark:bg-sky-950/30 dark:border-sky-800">
        <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
        <p className="text-sm text-sky-800 dark:text-sky-300">
          Dados sincronizados do Primavera ERP — apenas leitura. Para lançar
          pagamentos aceda ao Primavera directamente.
        </p>
      </div>

      {/* Alerta vermelho para vencidos graves */}
      {alertasGraves.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-danger/8 border border-red-300 dark:bg-red-950/40 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-danger dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-danger dark:text-red-300">
              {alertasGraves.length} fatura(s) com mais de 30 dias de atraso
            </p>
            <ul className="mt-1 space-y-0.5">
              {alertasGraves.map((c) => (
                <li key={c.id} className="text-xs text-danger dark:text-red-400">
                  {c.id} — {c.cliente} —{" "}
                  <span className="font-semibold">{formatAOA(c.valor)}</span>{" "}
                  ({c.diasAtraso} dias em atraso)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total em Dívida",
            value: formatAOA(totalDivida),
            sub: "Vencido + A vencer",
            icon: <TrendingDown className="w-5 h-5" />,
            color: "text-gray-700 dark:text-gray-200",
            bg: "bg-surface dark:bg-ink-ghost/20",
            iconColor: "text-ink-mid/70 dark:text-gray-400",
          },
          {
            label: "Vencido",
            value: formatAOA(totalVencido),
            sub: `${COBRANCAS.filter((c) => c.estado === "Vencido").length} faturas`,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "text-danger dark:text-red-300",
            bg: "bg-danger/8 dark:bg-red-950/30",
            iconColor: "text-danger dark:text-red-400",
          },
          {
            label: "A Vencer",
            value: formatAOA(totalAVencer),
            sub: `${COBRANCAS.filter((c) => c.estado === "A Vencer").length} faturas`,
            icon: <Clock className="w-5 h-5" />,
            color: "text-blue-700 dark:text-blue-300",
            bg: "bg-blue-50 dark:bg-blue-950/30",
            iconColor: "text-blue-500 dark:text-blue-400",
          },
          {
            label: "Recebido (mês)",
            value: formatAOA(totalPago),
            sub: `${COBRANCAS.filter((c) => c.estado === "Pago").length} faturas pagas`,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "text-live dark:text-emerald-300",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
            iconColor: "text-emerald-500 dark:text-emerald-400",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 ${kpi.bg}`}
          >
            <div className={`${kpi.iconColor} mb-2`}>{kpi.icon}</div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs font-medium text-ink-mid dark:text-gray-300 mt-0.5">
              {kpi.label}
            </p>
            <p className="text-xs text-ink-mid/50 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mid/50" />
          <input
            type="text"
            placeholder="Pesquisar por nº fatura ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel text-ink dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
          >
            {ESTADOS_FILTRO.map((e) => (
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
          <table className="min-w-full divide-y divide-ink-ghost/60 dark:divide-gray-700">
            <thead>
              <tr className="bg-surface dark:bg-gray-900/40">
                {[
                  "Nº Fatura",
                  "Cliente",
                  "Valor",
                  "Emissão",
                  "Vencimento",
                  "Dias em Atraso",
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
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
              {filtradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-ink-mid/50"
                  >
                    Nenhuma cobrança encontrada.
                  </td>
                </tr>
              ) : (
                filtradas.map((c) => {
                  const isAlertaGrave =
                    c.estado === "Vencido" && c.diasAtraso > 30;
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        isAlertaGrave
                          ? "bg-red-50/60 dark:bg-red-950/20 hover:bg-danger/8 dark:hover:bg-red-950/30"
                          : "hover:bg-surface dark:hover:bg-gray-700/30"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-mono font-medium text-ink dark:text-blue-400 whitespace-nowrap">
                        {c.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink dark:text-white max-w-[220px]">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-ink-mid/50 shrink-0" />
                          <div>
                            <p className="truncate">{c.cliente}</p>
                            <p className="text-xs text-ink-mid/50">{c.contacto}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-ink dark:text-white whitespace-nowrap">
                        {formatAOA(c.valor)}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-mid dark:text-gray-300 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-ink-mid/50" />
                          {formatDate(c.emissao)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-mid dark:text-gray-300 whitespace-nowrap">
                        {formatDate(c.vencimento)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {c.estado === "Pago" ? (
                          <span className="text-sm text-ink-mid/50">—</span>
                        ) : c.diasAtraso > 0 ? (
                          <span
                            className={`text-sm font-semibold ${
                              c.diasAtraso > 30
                                ? "text-danger dark:text-red-400"
                                : "text-orange-600 dark:text-orange-400"
                            }`}
                          >
                            {c.diasAtraso} dias
                            {c.diasAtraso > 30 && (
                              <AlertTriangle className="inline w-3.5 h-3.5 ml-1 mb-0.5" />
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-ink-mid/50">A prazo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <EstadoBadge estado={c.estado} diasAtraso={c.diasAtraso} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-ink-ghost/40 dark:border-gray-700 flex items-center justify-between">
          <p className="text-xs text-ink-mid/50">
            {filtradas.length} de {COBRANCAS.length} registos
          </p>
          <p className="text-xs text-ink-mid/50">
            Total filtrado:{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {formatAOA(filtradas.reduce((s, c) => s + c.valor, 0))}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
