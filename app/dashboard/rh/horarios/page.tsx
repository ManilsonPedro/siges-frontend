"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rhService, rhTempoService } from "@/shared/services/rh.service";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Clock, Loader2 } from "lucide-react";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function HorariosPage() {
  const qc = useQueryClient();
  const [colaboradorId, setColaboradorId] = useState("");
  const [horarios, setHorarios] = useState<Record<number, { hora_entrada: string; hora_saida: string; activo: boolean }>>({});

  const { data: colaboradores = [] } = useQuery({ queryKey: ["colaboradores"], queryFn: () => rhService.listColaboradores() });
  const { data: horariosAtuais = [] } = useQuery({
    queryKey: ["horarios", colaboradorId],
    queryFn: () => rhTempoService.getHorarios(colaboradorId),
    enabled: !!colaboradorId,
  });

  useEffect(() => {
    const base: Record<number, { hora_entrada: string; hora_saida: string; activo: boolean }> = {};
    for (let i = 0; i < 7; i++) {
      const existente = horariosAtuais.find((h) => h.dia_semana === i);
      base[i] = existente ? { hora_entrada: existente.hora_entrada, hora_saida: existente.hora_saida, activo: true } : { hora_entrada: "08:00", hora_saida: "17:00", activo: false };
    }
    setHorarios(base);
  }, [horariosAtuais, colaboradorId]);

  const saveMut = useMutation({
    mutationFn: () => {
      const lista = Object.entries(horarios).filter(([, v]) => v.activo).map(([dia, v]) => ({ dia_semana: parseInt(dia), hora_entrada: v.hora_entrada, hora_saida: v.hora_saida }));
      return rhTempoService.setHorarios(colaboradorId, lista);
    },
    onSuccess: () => { toast.success("Horário guardado"); qc.invalidateQueries({ queryKey: ["horarios", colaboradorId] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Horários</h1>
      </div>

      <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
        <option value="">Seleccionar colaborador…</option>
        {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>

      {colaboradorId && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow p-6 space-y-3">
          {DIAS.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <label className="flex items-center gap-2 w-32">
                <input type="checkbox" checked={horarios[i]?.activo ?? false} onChange={(e) => setHorarios({ ...horarios, [i]: { ...horarios[i], activo: e.target.checked } })} />
                <span className="text-sm">{d}</span>
              </label>
              <input type="time" value={horarios[i]?.hora_entrada || "08:00"} disabled={!horarios[i]?.activo}
                onChange={(e) => setHorarios({ ...horarios, [i]: { ...horarios[i], hora_entrada: e.target.value } })}
                className="border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20 disabled:opacity-40" />
              <span className="text-ink-mid">até</span>
              <input type="time" value={horarios[i]?.hora_saida || "17:00"} disabled={!horarios[i]?.activo}
                onChange={(e) => setHorarios({ ...horarios, [i]: { ...horarios[i], hora_saida: e.target.value } })}
                className="border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20 disabled:opacity-40" />
            </div>
          ))}
          <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="mt-4 px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar horário"}
          </button>
        </div>
      )}
    </div>
  );
}
