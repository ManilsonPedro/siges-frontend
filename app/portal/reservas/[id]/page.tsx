"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Car, Check, Loader2, Star } from "lucide-react";
import { portalAuthService, portalReservaService } from "@/shared/services/portal.service";

// Estados que representam uma reserva ainda em curso — só aqui faz sentido
// fazer polling agressivo. Concluída/paga/cancelada nunca voltam a mudar.
const ESTADOS_EM_PROGRESSO = new Set([
  "rascunho", "agendada", "confirmada", "checkin", "em_curso", "controlo_qualidade",
]);

const ETAPAS = [
  { estado: "agendada", label: "Agendada" },
  { estado: "confirmada", label: "Confirmada" },
  { estado: "checkin", label: "Check-in" },
  { estado: "em_curso", label: "Em Lavagem" },
  { estado: "controlo_qualidade", label: "Controlo de Qualidade" },
  { estado: "concluida", label: "Concluída" },
];

const ESTADO_LABEL: Record<string, string> = {
  rascunho: "Rascunho", agendada: "Agendada", confirmada: "Confirmada", checkin: "Check-in",
  em_curso: "Em Curso", controlo_qualidade: "Controlo de Qualidade", concluida: "Concluída",
  paga: "Paga", cancelada: "Cancelada",
};

function EtapaProgresso({ estadoActual }: { estadoActual: string }) {
  if (estadoActual === "cancelada") {
    return (
      <div className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">
        Esta reserva foi cancelada.
      </div>
    );
  }
  const indiceActual = ETAPAS.findIndex((e) => e.estado === estadoActual);
  const indiceEfectivo = estadoActual === "paga" ? ETAPAS.length : indiceActual;

  return (
    <div className="flex items-center">
      {ETAPAS.map((etapa, i) => {
        const activa = etapa.estado === estadoActual;
        const feita = i < indiceEfectivo || activa || estadoActual === "paga";
        return (
          <div key={etapa.estado} className="flex-1 flex items-center">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                feita ? "bg-ink text-white" : "bg-surface text-ink-mid/50 dark:bg-ink-ghost/20"
              } ${activa ? "ring-2 ring-offset-2 ring-ink dark:ring-offset-panel" : ""}`}>
                {feita && !activa ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] text-center leading-tight ${activa ? "font-semibold text-ink dark:text-white" : "text-ink-mid/60"}`}>
                {etapa.label}
              </span>
            </div>
            {i < ETAPAS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i < indiceEfectivo ? "bg-ink" : "bg-surface dark:bg-ink-ghost/20"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ReservaAcompanhamentoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();

  useEffect(() => {
    if (!portalAuthService.isAuthenticated()) router.push("/portal/login");
  }, [router]);

  const { data: reserva, isLoading } = useQuery({
    queryKey: ["portal-reserva-detalhe", params.id],
    queryFn: () => portalReservaService.detalheReserva(params.id),
    enabled: !!params.id,
    // Polling agressivo (5s) só enquanto a reserva está activamente em
    // progresso — assim que atinge um estado terminal, o próprio
    // TanStack Query pára de repetir o pedido automaticamente.
    refetchInterval: (query) => {
      const estado = query.state.data?.estado;
      return estado && ESTADOS_EM_PROGRESSO.has(estado) ? 5_000 : false;
    },
  });

  const cancelarMut = useMutation({
    mutationFn: () => portalReservaService.cancelarReserva(params.id),
    onSuccess: () => {
      toast.success("Reserva cancelada");
      qc.invalidateQueries({ queryKey: ["portal-reserva-detalhe", params.id] });
      qc.invalidateQueries({ queryKey: ["portal-reservas-activas"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao cancelar"),
  });

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (!reserva) return <p className="text-ink-mid/70">Reserva não encontrada.</p>;

  const podeCancel = ["rascunho", "agendada", "confirmada"].includes(reserva.estado);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/portal/minhas-reservas" className="text-ink-mid/70 hover:text-ink"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-ink dark:text-white">{reserva.tipo_lavagem_nome}</h1>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-6 space-y-5">
        <EtapaProgresso estadoActual={reserva.estado} />

        <div className="flex items-center justify-between pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
          <span className="text-xs px-2 py-1 rounded bg-ink/10 text-ink dark:text-white">{ESTADO_LABEL[reserva.estado] || reserva.estado}</span>
          <span className="text-sm text-ink-mid/70">{new Date(reserva.created_at).toLocaleString("pt-PT")}</span>
        </div>

        {reserva.viatura_matricula && (
          <div className="flex items-center gap-2 text-sm text-ink-mid">
            <Car className="h-4 w-4" />
            {reserva.viatura_matricula}
            {(reserva.viatura_marca || reserva.viatura_modelo) && (
              <span>— {[reserva.viatura_marca, reserva.viatura_modelo].filter(Boolean).join(" ")}</span>
            )}
          </div>
        )}

        {reserva.extras.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Extras</p>
            <ul className="text-sm text-ink-mid space-y-1">
              {reserva.extras.map((ex) => (
                <li key={ex.extra_id} className="flex justify-between">
                  <span>{ex.extra_id}</span>
                  <span>{ex.preco_aplicado.toLocaleString("pt-AO")} Kz</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
          <span className="text-sm font-medium">Total estimado</span>
          <span className="text-lg font-bold text-ink dark:text-white">
            {reserva.preco_total != null ? `${reserva.preco_total.toLocaleString("pt-AO")} Kz` : "—"}
          </span>
        </div>

        {reserva.controlo_qualidade && (
          <div className="pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
            <p className="text-sm font-medium mb-1">Avaliação de qualidade</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`h-5 w-5 ${n <= reserva.controlo_qualidade!.pontuacao ? "fill-amber-400 text-amber-400" : "text-ink-ghost"}`} />
              ))}
            </div>
          </div>
        )}

        {(reserva.fotos_antes.length > 0 || reserva.fotos_depois.length > 0) && (
          <div className="pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Antes</p>
              <div className="grid grid-cols-2 gap-2">
                {reserva.fotos_antes.map((url) => <img key={url} src={url} className="rounded-lg" alt="Antes" />)}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Depois</p>
              <div className="grid grid-cols-2 gap-2">
                {reserva.fotos_depois.map((url) => <img key={url} src={url} className="rounded-lg" alt="Depois" />)}
              </div>
            </div>
          </div>
        )}

        {podeCancel && (
          <div className="pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
            <button
              onClick={() => confirm("Cancelar esta reserva?") && cancelarMut.mutate()}
              disabled={cancelarMut.isPending}
              className="text-xs px-3 py-1.5 border border-danger text-danger rounded-lg hover:bg-danger/10 disabled:opacity-50"
            >
              {cancelarMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : "Cancelar reserva"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
