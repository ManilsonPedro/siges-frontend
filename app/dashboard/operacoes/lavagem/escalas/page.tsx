"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesLavagemService, operacoesEstacaoService } from "@/shared/services/operacoes.service";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, X, Loader2 } from "lucide-react";

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function EscalasLavagemPage() {
  const qc = useQueryClient();
  const [data, setData] = useState(hojeISO());

  const { data: boxes = [] } = useQuery({ queryKey: ["lavagem-boxes"], queryFn: operacoesLavagemService.listBoxes });
  const { data: turnos = [] } = useQuery({ queryKey: ["turnos"], queryFn: operacoesEstacaoService.listTurnos });
  const { data: equipas = [] } = useQuery({ queryKey: ["lavagem-equipas"], queryFn: operacoesLavagemService.listEquipas });
  const { data: escalas = [] } = useQuery({
    queryKey: ["lavagem-escalas", data],
    queryFn: () => operacoesLavagemService.listEscalas({ data: `${data}T00:00:00` }),
  });

  const createMut = useMutation({
    mutationFn: (dto: { equipa_id: string; box_id: string; turno_id: string }) =>
      operacoesLavagemService.createEscala({ ...dto, data: `${data}T00:00:00` }),
    onSuccess: () => { toast.success("Escala atribuída"); qc.invalidateQueries({ queryKey: ["lavagem-escalas", data] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => operacoesLavagemService.deleteEscala(id),
    onSuccess: () => { toast.success("Escala removida"); qc.invalidateQueries({ queryKey: ["lavagem-escalas", data] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  function escalaDe(boxId: string, turnoId: string) {
    return escalas.find((e) => e.box_id === boxId && e.turno_id === turnoId);
  }

  function onSelect(boxId: string, turnoId: string, equipaId: string) {
    const existente = escalaDe(boxId, turnoId);
    if (existente) deleteMut.mutate(existente.id);
    if (equipaId) createMut.mutate({ equipa_id: equipaId, box_id: boxId, turno_id: turnoId });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Escalas de Turno</h1>
        </div>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)}
          className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
      </div>

      <p className="text-sm text-ink-mid/70">
        Escale a equipa de cada box, por turno, no início do dia. Ao fazer check-in numa ordem, a equipa do box
        no turno corrente é atribuída automaticamente — sem escolha manual do operador.
      </p>

      {(boxes.length === 0 || turnos.length === 0) && (
        <p className="text-ink-mid/70 text-center py-8">
          É necessário ter pelo menos um box e um turno operacional configurados.
        </p>
      )}

      {boxes.length > 0 && turnos.length > 0 && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20">
              <tr className="text-left text-xs uppercase text-ink-mid/70">
                <th className="px-4 py-3">Box</th>
                {turnos.map((t) => (
                  <th key={t.id} className="px-4 py-3">{t.nome} ({t.hora_inicio}–{t.hora_fim})</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {boxes.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-sm font-medium">{b.codigo} — {b.nome}</td>
                  {turnos.map((t) => {
                    const escala = escalaDe(b.id, t.id);
                    return (
                      <td key={t.id} className="px-4 py-3">
                        <select
                          value={escala?.equipa_id || ""}
                          onChange={(e) => onSelect(b.id, t.id, e.target.value)}
                          className="w-full border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20"
                        >
                          <option value="">Sem equipa</option>
                          {equipas.filter((eq) => eq.activo).map((eq) => (
                            <option key={eq.id} value={eq.id}>{eq.nome}</option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
