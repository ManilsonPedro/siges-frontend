"use client";
import { useQuery } from "@tanstack/react-query";
import { rhAvaliacaoService } from "@/shared/services/rh.service";
import { TrendingUp, Loader2 } from "lucide-react";

export default function ProdutividadePage() {
  const { data, isLoading } = useQuery({ queryKey: ["produtividade-rh"], queryFn: () => rhAvaliacaoService.indicadorProdutividade() });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Produtividade</h1>
      </div>

      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70">Progresso Médio de Objetivos</p>
            <p className="text-xl font-bold">{data.media_progresso_pct}%</p>
          </div>
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70">Nº de Objetivos</p>
            <p className="text-xl font-bold">{data.n_objetivos}</p>
          </div>
        </div>
      )}
    </div>
  );
}
