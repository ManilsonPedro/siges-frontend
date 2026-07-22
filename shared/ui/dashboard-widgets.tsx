"use client";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, Legend,
} from "recharts";
import { useState } from "react";
import {
  Wallet, TrendingDown, TrendingUp, ArrowUp, ArrowDown, History,
} from "lucide-react";
import { relatoriosService, fundoService } from "@/shared/services/financeiro.service";
import { formatCurrency, formatDateTime } from "@/shared/utils";
import type { FundoReport } from "@/shared/types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

function Metric({
  label, value, icon: Icon, accent, subtitle,
}: {
  label: string; value: number; icon: React.ElementType; accent?: string; subtitle?: string;
}) {
  return (
    <div className="p-3 flex items-start gap-2">
      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
        <p className={`text-xs font-bold leading-tight break-all ${accent || "text-gray-900 dark:text-white"}`}>{formatCurrency(value)}</p>
        {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Widget 1 — Relatório de Fundos
// ──────────────────────────────────────────────────────────────────
export function WidgetRelatorioFundos() {
  const { data, isLoading } = useQuery({
    queryKey: ["relatorio-fundos"],
    queryFn: () => relatoriosService.fundos() as Promise<FundoReport>,
  });

  if (isLoading || !data) return <div className="p-8 text-center text-gray-400 animate-pulse">A carregar...</div>;

  return (
    <div className="p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Relatório de Fundos</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(["bcs", "bfa"] as const).map((tipo) => {
          const f = data[tipo];
          if (!f) return null;
          const cor = tipo === "bfa" ? "bg-purple-600" : "bg-blue-600";
          return (
            <div key={tipo} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className={`px-4 py-2.5 ${cor} text-white font-bold uppercase text-sm`}>{tipo === "bfa" ? "Fundo BFA" : "Fundo BCS"}</div>
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                <Metric label="Valor Disponível" value={f.valor_disponivel || 0} icon={Wallet} />
                <Metric label="Total Entradas" value={f.total_entradas || 0} icon={ArrowUp} accent="text-emerald-700" />
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
                <Metric label="Total Saídas" value={f.total_saidas || 0} icon={ArrowDown} accent="text-red-700" />
                <Metric label="Saldo Actual" value={f.saldo_atual || 0} icon={TrendingUp} accent="text-blue-700" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Widget 2 — Últimos Carregamentos
// ──────────────────────────────────────────────────────────────────
export function WidgetUltimosCarregamentos() {
  const { data: carregamentos = [], isLoading } = useQuery({
    queryKey: ["fundo-carregamentos-widget"],
    queryFn: () => fundoService.historico(10),
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400 animate-pulse">A carregar...</div>;

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-blue-600" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Últimos Carregamentos</h3>
      </div>
      {carregamentos.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">Sem carregamentos registados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Data</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Utilizador</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Fundo</th>
                <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Anterior</th>
                <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Novo</th>
                <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Variação</th>
              </tr>
            </thead>
            <tbody>
              {carregamentos.map((c) => {
                const diff = c.valor_novo - c.valor_anterior;
                const up = diff >= 0;
                return (
                  <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{formatDateTime(c.created_at)?.slice(0, 16)}</td>
                    <td className="px-3 py-2 font-medium">{c.user_name}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.fundo_tipo === "BFA" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{c.fundo_tipo || "BCS"}</span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(c.valor_anterior)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatCurrency(c.valor_novo)}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${up ? "text-emerald-700" : "text-red-700"}`}>
                      {up ? "+" : ""}{formatCurrency(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Widget 3 — Relatório Mensal
// ──────────────────────────────────────────────────────────────────
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function WidgetRelatorioMensal() {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);

  const { data: mensal, isLoading } = useQuery({
    queryKey: ["relatorio-mensal-widget", ano, mes],
    queryFn: () => relatoriosService.mensal(ano, mes),
  });

  const chartData = mensal?.resumo?.map((r: { tipo: string; estado: string; total: number; quantidade: number }) => ({
    name: `${r.tipo === "saida" ? "Saída" : "Entrada"} - ${r.estado}`,
    total: r.total,
  })) || [];

  return (
    <div className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Relatório Mensal</h3>
        <div className="flex gap-2 sm:ml-auto">
          <select value={mes} onChange={(e) => setMes(+e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs bg-white dark:bg-gray-800">
            {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select value={ano} onChange={(e) => setAno(+e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs bg-white dark:bg-gray-800">
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 animate-pulse">A carregar...</div>
      ) : chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sem dados para o período seleccionado.</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Widget 4 — Por Fornecedor
// ──────────────────────────────────────────────────────────────────
export function WidgetPorFornecedor() {
  const { data, isLoading } = useQuery({
    queryKey: ["relatorio-fornecedor-widget"],
    queryFn: () => relatoriosService.porFornecedor(),
  });

  const chartData = (data || []).slice(0, 10).map((r: { nome: string; total: number }) => ({
    name: r.nome.length > 18 ? r.nome.slice(0, 18) + "…" : r.nome,
    total: r.total,
  }));

  return (
    <div className="p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Top 10 Fornecedores</h3>
      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-gray-400 animate-pulse">A carregar...</div>
      ) : chartData.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-gray-400">Sem dados.</div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Widget 5 — Por Conceito
// ──────────────────────────────────────────────────────────────────
export function WidgetPorConceito() {
  const { data, isLoading } = useQuery({
    queryKey: ["relatorio-conceito-widget"],
    queryFn: () => relatoriosService.porConceito(),
  });

  const chartData = (data || []).map((r: { nome: string; total: number }) => ({
    name: r.nome.length > 18 ? r.nome.slice(0, 18) + "…" : r.nome,
    total: r.total,
  }));

  return (
    <div className="p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Por Conceito</h3>
      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-gray-400 animate-pulse">A carregar...</div>
      ) : chartData.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-gray-400">Sem dados.</div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {chartData.map((_: { name: string; total: number }, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
