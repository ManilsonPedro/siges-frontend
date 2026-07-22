"use client";
import { useQuery } from "@tanstack/react-query";
import { produtividadeService } from "@/shared/services/financeiro.service";
import { formatCurrency } from "@/shared/utils";
import { Users, TrendingUp } from "lucide-react";

export function ProdutividadeUsersWidget({ dataInicio, dataFim }: { dataInicio?: string; dataFim?: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["produtividade-users", dataInicio, dataFim],
    queryFn: () => produtividadeService.porUser(dataInicio, dataFim),
  });

  const total = data.reduce((s, u) => s + u.movimentos_criados, 0);
  const max = Math.max(1, ...data.map(u => u.movimentos_criados));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Produtividade por utilizador</h3>
            <p className="text-[10px] text-gray-500">Movimentos criados · entradas · saídas · fechados</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-500">{total} mov.</span>
      </div>
      {isLoading ? (
        <div className="p-6 text-center text-gray-400 text-sm">A carregar...</div>
      ) : data.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">Sem dados no período.</div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((u) => {
            const pct = Math.round((u.movimentos_criados / max) * 100);
            return (
              <div key={u.user_id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                      {u.user_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.user_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-gray-900 dark:text-white">{u.movimentos_criados}</span>
                    {u.movimentos_fechados > 0 && (
                      <span className="text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{u.movimentos_fechados} fechados</span>
                    )}
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span className="text-emerald-600">↑ {formatCurrency(u.total_entradas)}</span>
                  <span className="text-red-600">↓ {formatCurrency(u.total_saidas)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
