"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesLavagemService } from "@/shared/services/operacoes.service";
import { toast } from "sonner";
import { ListOrdered, Loader2, PlayCircle, CalendarClock, Car } from "lucide-react";
import Link from "next/link";

const PRIORIDADE_LABEL: Record<number, string> = {
  1: "Reserva — próxima ±15min",
  2: "Reserva agendada",
  3: "Walk-in",
};
const PRIORIDADE_COLOR: Record<number, string> = {
  1: "bg-live-dim text-live",
  2: "bg-ink/10 text-ink",
  3: "bg-amber-100 text-amber-700",
};

export default function FilaAtendimentoPage() {
  const qc = useQueryClient();

  const { data: fila = [], isLoading } = useQuery({
    queryKey: ["lavagem-fila"],
    queryFn: operacoesLavagemService.filaAtendimento,
    refetchInterval: 30_000,
  });

  const checkinMut = useMutation({
    mutationFn: (id: string) => operacoesLavagemService.checkin(id),
    onSuccess: () => {
      toast.success("Check-in efectuado");
      qc.invalidateQueries({ queryKey: ["lavagem-fila"] });
      qc.invalidateQueries({ queryKey: ["lavagem-ordens"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListOrdered className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Fila de Atendimento</h1>
        </div>
        <Link href="/dashboard/operacoes/lavagem/walkin/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 text-sm">
          <Car className="h-4 w-4" /> Novo walk-in
        </Link>
      </div>

      <p className="text-sm text-ink-mid/70">
        Ordem de atendimento: reserva dentro dos próximos ±15min, depois a próxima reserva agendada, depois walk-ins por ordem de chegada.
        Actualiza automaticamente a cada 30s.
      </p>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Matrícula</th>
              <th className="px-4 py-3">Horário / Espera</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && fila.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-mid/70">Fila vazia</td></tr>}
            {fila.map((f, i) => (
              <tr key={f.ordem_id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 text-sm font-semibold">{i + 1}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${PRIORIDADE_COLOR[f.prioridade]}`}>{PRIORIDADE_LABEL[f.prioridade]}</span></td>
                <td className="px-4 py-3 text-sm">{f.tipo_lavagem_nome}</td>
                <td className="px-4 py-3 font-mono text-sm">{f.matricula || "—"}</td>
                <td className="px-4 py-3 text-sm text-ink-mid flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {f.slot_hora ? new Date(f.slot_hora).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : new Date(f.espera_desde).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => checkinMut.mutate(f.ordem_id)} disabled={checkinMut.isPending}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-ink text-white rounded-lg hover:bg-ink/90 disabled:opacity-50">
                    <PlayCircle className="h-3.5 w-3.5" /> Check-in
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
