"use client";
import { useQuery } from "@tanstack/react-query";
import { fiscalidadeService } from "@/shared/services/financeiro2.service";
import { useState } from "react";
import { Receipt, Loader2 } from "lucide-react";

export default function IvaPage() {
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["relatorio-iva", de, ate],
    queryFn: () => fiscalidadeService.relatorioIva({ de: de || undefined, ate: ate || undefined }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">IVA</h1>
      </div>

      <div className="flex gap-3">
        <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
      </div>

      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70">Total de Vendas</p>
            <p className="text-xl font-bold">{data.total_vendas.toLocaleString("pt-AO")} Kz</p>
          </div>
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70">Total IVA</p>
            <p className="text-xl font-bold">{data.total_iva.toLocaleString("pt-AO")} Kz</p>
          </div>
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70">Nº de Vendas</p>
            <p className="text-xl font-bold">{data.n_vendas}</p>
          </div>
        </div>
      )}
    </div>
  );
}
