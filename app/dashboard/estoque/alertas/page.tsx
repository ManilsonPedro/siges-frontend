"use client";

import {
  AlertTriangle,
  XCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Package,
  Bell,
  RefreshCw,
  Filter,
} from "lucide-react";

type EstadoAlerta = "Crítico" | "Baixo" | "Normal" | "Excesso";

interface Produto {
  codigo: string;
  nome: string;
  categoria: string;
  unidade: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  stockSeguranca: number;
  estado: EstadoAlerta;
  armazem: string;
  ultimaEntrada: string;
  ultimaSaida: string;
}

const PRODUTOS: Produto[] = [
  {
    codigo: "MP-HCL-001",
    nome: "Hipoclorito de Sódio 12% (Tambor 200L)",
    categoria: "Matéria-Prima",
    unidade: "Tambor",
    stockActual: 8,
    stockMinimo: 20,
    stockMaximo: 80,
    stockSeguranca: 10,
    estado: "Crítico",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-06-05",
    ultimaSaida: "2026-06-16",
  },
  {
    codigo: "MP-HCL-002",
    nome: "Hipoclorito de Sódio 10% (Tambor 200L)",
    categoria: "Matéria-Prima",
    unidade: "Tambor",
    stockActual: 3,
    stockMinimo: 15,
    stockMaximo: 60,
    stockSeguranca: 8,
    estado: "Crítico",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-05-28",
    ultimaSaida: "2026-06-17",
  },
  {
    codigo: "MP-SAL-001",
    nome: "Sal Industrial (Saco 50kg)",
    categoria: "Matéria-Prima",
    unidade: "Saco",
    stockActual: 42,
    stockMinimo: 50,
    stockMaximo: 200,
    stockSeguranca: 25,
    estado: "Baixo",
    armazem: "ARZ-02",
    ultimaEntrada: "2026-06-08",
    ultimaSaida: "2026-06-15",
  },
  {
    codigo: "EMB-PET-001",
    nome: "Embalagem PET 1L KITOKA",
    categoria: "Embalagem",
    unidade: "Unidade",
    stockActual: 1850,
    stockMinimo: 2000,
    stockMaximo: 10000,
    stockSeguranca: 1000,
    estado: "Baixo",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-06-01",
    ultimaSaida: "2026-06-17",
  },
  {
    codigo: "EMB-PET-005",
    nome: "Embalagem PET 5L KITOKA",
    categoria: "Embalagem",
    unidade: "Unidade",
    stockActual: 3200,
    stockMinimo: 1000,
    stockMaximo: 8000,
    stockSeguranca: 500,
    estado: "Normal",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-06-10",
    ultimaSaida: "2026-06-16",
  },
  {
    codigo: "PA-LIX-001",
    nome: "Lixívia KITOKA 1L (Caixa 12un)",
    categoria: "Produto Acabado",
    unidade: "Caixa",
    stockActual: 3200,
    stockMinimo: 500,
    stockMaximo: 4000,
    stockSeguranca: 200,
    estado: "Normal",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-06-14",
    ultimaSaida: "2026-06-17",
  },
  {
    codigo: "PA-LIX-005",
    nome: "Lixívia KITOKA 5L (Caixa 6un)",
    categoria: "Produto Acabado",
    unidade: "Caixa",
    stockActual: 980,
    stockMinimo: 200,
    stockMaximo: 1200,
    stockSeguranca: 100,
    estado: "Normal",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-06-12",
    ultimaSaida: "2026-06-17",
  },
  {
    codigo: "MP-SOD-001",
    nome: "Soda Cáustica (Saco 25kg)",
    categoria: "Matéria-Prima",
    unidade: "Saco",
    stockActual: 245,
    stockMinimo: 20,
    stockMaximo: 100,
    stockSeguranca: 10,
    estado: "Excesso",
    armazem: "ARZ-02",
    ultimaEntrada: "2026-05-15",
    ultimaSaida: "2026-06-10",
  },
  {
    codigo: "EMB-ROT-001",
    nome: "Rótulo KITOKA 1L (Rolo 1000un)",
    categoria: "Embalagem",
    unidade: "Rolo",
    stockActual: 2,
    stockMinimo: 10,
    stockMaximo: 40,
    stockSeguranca: 5,
    estado: "Crítico",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-04-20",
    ultimaSaida: "2026-06-17",
  },
  {
    codigo: "EMB-ROT-005",
    nome: "Rótulo KITOKA 5L (Rolo 500un)",
    categoria: "Embalagem",
    unidade: "Rolo",
    stockActual: 7,
    stockMinimo: 8,
    stockMaximo: 30,
    stockSeguranca: 4,
    estado: "Baixo",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-05-10",
    ultimaSaida: "2026-06-15",
  },
  {
    codigo: "PA-HIP-EMB",
    nome: "Hipoclorito Embalado 1L (Caixa 12un)",
    categoria: "Produto Acabado",
    unidade: "Caixa",
    stockActual: 620,
    stockMinimo: 150,
    stockMaximo: 800,
    stockSeguranca: 80,
    estado: "Normal",
    armazem: "ARZ-01",
    ultimaEntrada: "2026-06-13",
    ultimaSaida: "2026-06-17",
  },
  {
    codigo: "MAT-CAR-001",
    nome: "Cartão Ondulado (Folha A1)",
    categoria: "Embalagem",
    unidade: "Folha",
    stockActual: 12400,
    stockMinimo: 2000,
    stockMaximo: 8000,
    stockSeguranca: 1000,
    estado: "Excesso",
    armazem: "ARZ-02",
    ultimaEntrada: "2026-05-25",
    ultimaSaida: "2026-06-10",
  },
];

const ESTADO_CONFIG: Record<EstadoAlerta, {
  label: string;
  rowBg: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  textColor: string;
}> = {
  Crítico: {
    label: "Crítico",
    rowBg: "bg-red-50/60 dark:bg-red-950/20",
    badge: "bg-danger/10 text-danger dark:bg-red-900/40 dark:text-red-400",
    icon: XCircle,
    textColor: "text-danger dark:text-red-400",
  },
  Baixo: {
    label: "Baixo",
    rowBg: "bg-yellow-50/60 dark:bg-yellow-950/20",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    icon: TrendingDown,
    textColor: "text-yellow-600 dark:text-yellow-400",
  },
  Normal: {
    label: "Normal",
    rowBg: "",
    badge: "bg-live-dim text-live dark:bg-green-900/40 dark:text-green-400",
    icon: CheckCircle2,
    textColor: "text-live dark:text-green-400",
  },
  Excesso: {
    label: "Excesso",
    rowBg: "bg-blue-50/40 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    icon: TrendingUp,
    textColor: "text-ink dark:text-blue-400",
  },
};

function getBarColor(estado: EstadoAlerta) {
  if (estado === "Crítico") return "bg-danger";
  if (estado === "Baixo") return "bg-yellow-500";
  if (estado === "Excesso") return "bg-blue-500";
  return "bg-green-500";
}

function calcBarPct(produto: Produto) {
  const pct = (produto.stockActual / produto.stockMaximo) * 100;
  return Math.min(pct, 100);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const FILTROS: EstadoAlerta[] = ["Crítico", "Baixo", "Normal", "Excesso"];

export default function AlertasStockPage() {
  const criticos = PRODUTOS.filter((p) => p.estado === "Crítico").length;
  const baixos = PRODUTOS.filter((p) => p.estado === "Baixo").length;
  const excessos = PRODUTOS.filter((p) => p.estado === "Excesso").length;
  const emAlerta = criticos + baixos;

  return (
    <div className="space-y-6 p-6">
      {/* Banner Primavera */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/40">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Dados sincronizados do Primavera ERP — apenas leitura
          </p>
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Alertas de Stock
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitorização de níveis de stock mínimo, máximo e situações críticas — Aquasan Angola.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {emAlerta > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-sm font-semibold text-danger dark:bg-red-900/40 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {emAlerta} produto{emAlerta > 1 ? "s" : ""} em alerta
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Stock Crítico",
            value: criticos,
            sub: "abaixo do mínimo",
            color: "text-danger dark:text-red-400",
            bg: "border-danger/30 dark:border-red-800",
            icon: XCircle,
          },
          {
            label: "Stock Baixo",
            value: baixos,
            sub: "próximo do mínimo",
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "border-yellow-200 dark:border-yellow-800",
            icon: TrendingDown,
          },
          {
            label: "Stock Normal",
            value: PRODUTOS.filter((p) => p.estado === "Normal").length,
            sub: "dentro dos limites",
            color: "text-live dark:text-green-400",
            bg: "border-green-200 dark:border-green-800",
            icon: CheckCircle2,
          },
          {
            label: "Stock em Excesso",
            value: excessos,
            sub: "acima do máximo",
            color: "text-ink dark:text-blue-400",
            bg: "border-blue-200 dark:border-blue-800",
            icon: TrendingUp,
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border bg-panel p-4 dark:bg-slate-800 ${kpi.bg}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Filter className="h-3 w-3" /> Legenda:
        </span>
        {FILTROS.map((estado) => {
          const cfg = ESTADO_CONFIG[estado];
          return (
            <span key={estado} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
              <cfg.icon className="h-3 w-3" />
              {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-slate-200 bg-panel dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Todos os Artigos — Nível de Stock
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {PRODUTOS.length} artigos monitorizados
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Armazém</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Stock Actual</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Mínimo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Máximo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[140px]">Ocupação</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Última Entrada</th>
              </tr>
            </thead>
            <tbody>
              {[...PRODUTOS]
                .sort((a, b) => {
                  const ordem: Record<EstadoAlerta, number> = { Crítico: 0, Baixo: 1, Excesso: 2, Normal: 3 };
                  return ordem[a.estado] - ordem[b.estado];
                })
                .map((produto) => {
                  const cfg = ESTADO_CONFIG[produto.estado];
                  const barPct = calcBarPct(produto);
                  const minimoLine = (produto.stockMinimo / produto.stockMaximo) * 100;

                  return (
                    <tr
                      key={produto.codigo}
                      className={`border-b border-slate-100 hover:opacity-90 dark:border-slate-700/50 last:border-b-0 transition-colors ${cfg.rowBg}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{produto.codigo}</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-start gap-2">
                          <Package className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.textColor}`} />
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight">{produto.nome}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{produto.categoria}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 dark:text-slate-300">{produto.armazem}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold ${cfg.textColor}`}>
                          {produto.stockActual.toLocaleString("pt-AO")}
                        </span>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{produto.unidade}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {produto.stockMinimo.toLocaleString("pt-AO")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {produto.stockMaximo.toLocaleString("pt-AO")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600">
                          {/* Barra de stock actual */}
                          <div
                            className={`h-2 rounded-full ${getBarColor(produto.estado)}`}
                            style={{ width: `${barPct}%` }}
                          />
                          {/* Linha do mínimo */}
                          <div
                            className="absolute top-0 h-full w-0.5 bg-red-400 dark:bg-red-500 rounded-full"
                            style={{ left: `${minimoLine}%` }}
                            title={`Mínimo: ${produto.stockMinimo}`}
                          />
                        </div>
                        <p className="mt-0.5 text-right text-xs text-slate-400 dark:text-slate-500">
                          {Math.round(barPct)}%
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
                          <cfg.icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-xs text-slate-600 dark:text-slate-300">{formatDate(produto.ultimaEntrada)}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">saída: {formatDate(produto.ultimaSaida)}</p>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-700/30">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-full bg-red-400" />
              Linha vermelha = Stock mínimo
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-full bg-live" />
              Barra = Stock actual vs máximo
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Fonte: Primavera ERP · Sincronizado em 18/06/2026
          </p>
        </div>
      </div>
    </div>
  );
}
