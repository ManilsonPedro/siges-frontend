"use client";
import { useQuery } from "@tanstack/react-query";
import { contabilidadeService } from "@/shared/services/financeiro2.service";
import { conceitoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { BookOpen, Loader2, Info } from "lucide-react";

export default function RazaoPage() {
  const [conceitoId, setConceitoId] = useState("");

  const { data: conceitos = [] } = useQuery({ queryKey: ["conceitos"], queryFn: conceitoService.list });
  const { data, isLoading } = useQuery({
    queryKey: ["razao", conceitoId],
    queryFn: () => contabilidadeService.razao(conceitoId),
    enabled: !!conceitoId,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Razão</h1>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
        <Info className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">Fonte: dados internos — extrato de lançamentos por conceito.</p>
      </div>

      <select value={conceitoId} onChange={(e) => setConceitoId(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
        <option value="">Seleccionar conceito…</option>
        {conceitos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>

      {conceitoId && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Data</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3">Observações</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
              {!isLoading && (data?.lancamentos.length ?? 0) === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Sem lançamentos</td></tr>}
              {data?.lancamentos.map((l: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-sm">{new Date(l.data).toLocaleDateString("pt-PT")}</td>
                  <td className="px-4 py-3 text-sm capitalize">{l.tipo}</td>
                  <td className={`px-4 py-3 text-sm text-right tabular-nums ${l.tipo === "entrada" ? "text-live" : "text-danger"}`}>{l.valor.toLocaleString("pt-AO")} Kz</td>
                  <td className="px-4 py-3 text-sm text-ink-mid">{l.observacoes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
