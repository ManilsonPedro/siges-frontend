"use client";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { intelligenceService, type EvolucaoDiariaResponse } from "@/shared/services/financeiro.service";
import { formatCurrency } from "@/shared/utils";

interface ChartProps {
  fundo: "BCS" | "BFA";
  cor: string;
}

function ChartFundo({ fundo, cor }: ChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["evolucao-diaria", fundo],
    queryFn: () => intelligenceService.evolucaoDiaria(fundo),
  });

  if (isLoading || !data) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm h-80 animate-pulse" />
    );
  }

  // Merge das 2 séries num único array para Recharts
  const maxDia = Math.max(data.mes_actual.dias_no_mes, data.mes_anterior.dias_no_mes);
  const chartData = Array.from({ length: maxDia }, (_, i) => {
    const dia = i + 1;
    const pa = data.mes_actual.serie.find((p) => p.dia === dia);
    const pp = data.mes_anterior.serie.find((p) => p.dia === dia);
    return {
      dia,
      actual: pa?.saldo ?? null,
      anterior: pp?.saldo ?? null,
    };
  });

  const comp = data.comparativo;
  const positivo = comp.delta >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${fundo === "BFA" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
              {fundo}
            </span>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Evolução Diária</h3>
          </div>
          <p className="text-xs text-gray-500">{data.mes_actual.label} vs {data.mes_anterior.label}</p>
        </div>
      </div>

      {/* Cartão comparativo */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Saldo hoje</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(comp.saldo_actual)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Dia {comp.dia_comparacao} · mês anterior</p>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{formatCurrency(comp.saldo_mes_anterior_mesmo_dia)}</p>
        </div>
      </div>

      <div className={`flex items-center gap-1.5 text-xs font-semibold mb-3 ${positivo ? "text-emerald-600" : "text-red-600"}`}>
        {positivo ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        Variação: {positivo ? "+" : ""}{formatCurrency(comp.delta)}
        {comp.delta_pct !== null && (
          <span className="ml-1">({positivo ? "+" : ""}{comp.delta_pct.toFixed(1)}%)</span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            ticks={[1, 5, 10, 15, 20, 25, 30, 31].filter((d) => d <= chartData.length)}
            label={{ value: "Dia", position: "insideBottom", offset: -5, fontSize: 10 }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(v: number) => {
              if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
              if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
              return v.toFixed(0);
            }}
          />
          <Tooltip
            formatter={(v) => (v == null ? "—" : formatCurrency(Number(v)))}
            labelFormatter={(dia) => `Dia ${dia}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="anterior"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            name={data.mes_anterior.label}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={cor}
            strokeWidth={2.5}
            dot={{ r: 2.5 }}
            activeDot={{ r: 5 }}
            name={data.mes_actual.label}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EvolucaoDiariaChart() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Comparativo diário · Mês actual vs Mês anterior
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartFundo fundo="BCS" cor="#2563eb" />
        <ChartFundo fundo="BFA" cor="#9333ea" />
      </div>
    </div>
  );
}
