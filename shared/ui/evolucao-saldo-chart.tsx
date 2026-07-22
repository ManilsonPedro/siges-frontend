"use client";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { intelligenceService } from "@/shared/services/financeiro.service";
import { formatCurrency } from "@/shared/utils";

interface Props {
  meses?: number;
}

export function EvolucaoSaldoChart({ meses = 6 }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["evolucao-saldo", meses],
    queryFn: () => intelligenceService.evolucaoSaldo(meses),
  });

  if (isLoading)
    return <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm h-72 animate-pulse" />;

  if (!data) return null;

  // Merge bcs/bfa em pontos comuns
  const chartData = data.bcs.map((b, i) => ({
    mes: b.mes,
    BCS: b.saldo,
    BFA: data.bfa[i]?.saldo || 0,
  }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Evolução de Saldo · últimos {meses} meses</h2>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number) => formatCurrency(v)} />
          <Legend />
          <Line type="monotone" dataKey="BCS" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="BFA" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
