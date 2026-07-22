"use client";
import { useQuery } from "@tanstack/react-query";
import { rhTempoService } from "@/shared/services/rh.service";
import { Activity, Loader2 } from "lucide-react";

export default function AssiduidadePage() {
  const { data: indicadores = [], isLoading } = useQuery({ queryKey: ["assiduidade"], queryFn: () => rhTempoService.indicadorAssiduidade() });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Assiduidade</h1>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Colaborador</th><th className="px-4 py-3">Faltas Registadas</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={2} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && indicadores.length === 0 && <tr><td colSpan={2} className="p-8 text-center text-ink-mid/70">Nenhum colaborador ativo</td></tr>}
            {indicadores.map((i) => (
              <tr key={i.colaborador_id}>
                <td className="px-4 py-3 text-sm">{i.nome}</td>
                <td className="px-4 py-3 text-sm">{i.faltas_registadas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
