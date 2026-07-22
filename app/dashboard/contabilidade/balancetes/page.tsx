"use client";
import { useQuery } from "@tanstack/react-query";
import { contabilidadeService } from "@/shared/services/financeiro2.service";
import { useState } from "react";
import { Calculator, Loader2, Info } from "lucide-react";

export default function BalancetesPage() {
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["balancetes", de, ate],
    queryFn: () => contabilidadeService.balancetes({ de: de || undefined, ate: ate || undefined }),
  });

  const totalEntradas = data?.linhas.reduce((s, l) => s + l.entradas, 0) || 0;
  const totalSaidas = data?.linhas.reduce((s, l) => s + l.saidas, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Balancetes</h1>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
        <Info className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">Fonte: dados internos — não substitui contabilidade certificada (fatura legal/SAF-T continuam no ERP fiscal).</p>
      </div>

      <div className="flex gap-3">
        <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Conceito</th><th className="px-4 py-3 text-right">Entradas</th><th className="px-4 py-3 text-right">Saídas</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && (data?.linhas.length ?? 0) === 0 && <tr><td colSpan={3} className="p-8 text-center text-ink-mid/70">Sem movimentos no período</td></tr>}
            {data?.linhas.map((l, i) => (
              <tr key={i}>
                <td className="px-4 py-3 text-sm">{l.conceito}</td>
                <td className="px-4 py-3 text-sm text-right tabular-nums text-live">{l.entradas.toLocaleString("pt-AO")} Kz</td>
                <td className="px-4 py-3 text-sm text-right tabular-nums text-danger">{l.saidas.toLocaleString("pt-AO")} Kz</td>
              </tr>
            ))}
          </tbody>
          {data && (
            <tfoot className="bg-surface dark:bg-ink-ghost/20 font-semibold">
              <tr><td className="px-4 py-3">Total</td><td className="px-4 py-3 text-right tabular-nums">{totalEntradas.toLocaleString("pt-AO")} Kz</td><td className="px-4 py-3 text-right tabular-nums">{totalSaidas.toLocaleString("pt-AO")} Kz</td></tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
