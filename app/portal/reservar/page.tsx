"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, CalendarClock } from "lucide-react";
import { portalAuthService, portalReservaService } from "@/shared/services/portal.service";
import { operacoesLavagemService } from "@/shared/services/operacoes.service";

export default function PortalReservarPage() {
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (!portalAuthService.isAuthenticated()) router.push("/portal/login");
  }, [router]);

  const [tipoId, setTipoId] = useState("");
  const [viaturaId, setViaturaId] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [slotId, setSlotId] = useState("");
  const [showNovaViatura, setShowNovaViatura] = useState(false);
  const [novaViatura, setNovaViatura] = useState({ matricula: "", marca: "", modelo: "", cor: "" });

  const { data: tipos = [] } = useQuery({ queryKey: ["portal-tipos"], queryFn: operacoesLavagemService.listTipos });
  const { data: extras = [] } = useQuery({ queryKey: ["portal-extras"], queryFn: operacoesLavagemService.listExtras });
  const { data: viaturas = [] } = useQuery({ queryKey: ["portal-viaturas"], queryFn: portalReservaService.listViaturas });

  const { data: slots = [], isFetching: isLoadingSlots } = useQuery({
    queryKey: ["portal-disponibilidade", data, tipoId],
    queryFn: () => portalReservaService.disponibilidade({ data, tipo_lavagem_id: tipoId }),
    enabled: !!tipoId && !!data,
  });

  const criarViaturaMut = useMutation({
    mutationFn: () => portalReservaService.registarViatura(novaViatura),
    onSuccess: (v) => {
      toast.success("Veículo registado");
      qc.invalidateQueries({ queryKey: ["portal-viaturas"] });
      setViaturaId(v.id);
      setShowNovaViatura(false);
      setNovaViatura({ matricula: "", marca: "", modelo: "", cor: "" });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const criarReservaMut = useMutation({
    mutationFn: () => portalReservaService.criarReserva({ viatura_id: viaturaId, tipo_lavagem_id: tipoId, slot_id: slotId, extra_ids: extraIds }),
    onSuccess: () => {
      toast.success("Reserva confirmada! Enviámos um email de confirmação.");
      router.push("/portal/minhas-reservas");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao criar reserva"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarClock className="h-7 w-7 text-ink dark:text-white" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Reservar Lavagem</h1>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de lavagem *</label>
          <select value={tipoId} onChange={(e) => { setTipoId(e.target.value); setSlotId(""); }}
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
            <option value="">Seleccionar…</option>
            {tipos.filter((t) => t.activo).map((t) => (
              <option key={t.id} value={t.id}>{t.nome} — {t.preco_base.toLocaleString("pt-AO")} Kz</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">O meu veículo *</label>
          <div className="flex gap-2">
            <select value={viaturaId} onChange={(e) => setViaturaId(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>
              {viaturas.map((v) => <option key={v.id} value={v.id}>{v.matricula} {v.marca ? `— ${v.marca} ${v.modelo || ""}` : ""}</option>)}
            </select>
            <button type="button" onClick={() => setShowNovaViatura(!showNovaViatura)} className="px-3 py-2 border rounded-lg text-sm hover:bg-surface inline-flex items-center gap-1">
              <Plus className="h-4 w-4" /> Novo
            </button>
          </div>
          {showNovaViatura && (
            <div className="mt-3 p-4 border rounded-lg space-y-3 dark:border-ink-ghost/20">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Matrícula *" value={novaViatura.matricula} onChange={(e) => setNovaViatura({ ...novaViatura, matricula: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                <input placeholder="Marca" value={novaViatura.marca} onChange={(e) => setNovaViatura({ ...novaViatura, marca: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                <input placeholder="Modelo" value={novaViatura.modelo} onChange={(e) => setNovaViatura({ ...novaViatura, modelo: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                <input placeholder="Cor" value={novaViatura.cor} onChange={(e) => setNovaViatura({ ...novaViatura, cor: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
              </div>
              <button type="button" disabled={!novaViatura.matricula || criarViaturaMut.isPending} onClick={() => criarViaturaMut.mutate()}
                className="text-sm px-3 py-1.5 bg-ink text-white rounded-lg disabled:opacity-50">
                {criarViaturaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar veículo"}
              </button>
            </div>
          )}
        </div>

        {extras.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Extras</label>
            <div className="space-y-1">
              {extras.filter((ex) => ex.activo).map((ex) => (
                <label key={ex.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={extraIds.includes(ex.id)}
                    onChange={(e) => setExtraIds(e.target.checked ? [...extraIds, ex.id] : extraIds.filter((id) => id !== ex.id))} />
                  {ex.nome} — {ex.preco.toLocaleString("pt-AO")} Kz
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Data *</label>
          <input type="date" value={data} min={new Date().toISOString().slice(0, 10)} onChange={(e) => { setData(e.target.value); setSlotId(""); }}
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>

        {tipoId && (
          <div>
            <label className="block text-sm font-medium mb-2">Horários disponíveis</label>
            {isLoadingSlots && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isLoadingSlots && slots.length === 0 && <p className="text-sm text-ink-mid/70">Sem horários disponíveis nesta data.</p>}
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button key={s.id} type="button" onClick={() => setSlotId(s.id)}
                  className={`text-sm px-3 py-2 rounded-lg border ${slotId === s.id ? "bg-ink text-white border-ink" : "hover:bg-surface dark:border-ink-ghost/20"}`}>
                  {new Date(s.data_hora_inicio).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                  <div className="text-xs opacity-70">{s.preco_estimado.toLocaleString("pt-AO")} Kz</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="button" disabled={!tipoId || !viaturaId || !slotId || criarReservaMut.isPending} onClick={() => criarReservaMut.mutate()}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ink text-white rounded-lg disabled:opacity-50 mt-2">
          {criarReservaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar reserva"}
        </button>
      </div>
    </div>
  );
}
