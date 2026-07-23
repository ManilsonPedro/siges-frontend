"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Loader2, Car } from "lucide-react";
import { portalAuthService, portalReservaService } from "@/shared/services/portal.service";

const ESTADO_LABEL: Record<string, string> = {
  concluida: "Concluída", paga: "Paga", cancelada: "Cancelada",
};

export default function HistoricoDetalhePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  useEffect(() => {
    if (!portalAuthService.isAuthenticated()) router.push("/portal/login");
  }, [router]);

  const { data: reserva, isLoading } = useQuery({
    queryKey: ["portal-historico-detalhe", params.id],
    queryFn: () => portalReservaService.detalheReserva(params.id),
    enabled: !!params.id,
  });

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (!reserva) return <p className="text-ink-mid/70">Reserva não encontrada.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/portal/historico" className="text-ink-mid/70 hover:text-ink"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-ink dark:text-white">{reserva.tipo_lavagem_nome}</h1>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 rounded bg-live-dim text-live">{ESTADO_LABEL[reserva.estado] || reserva.estado}</span>
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
          <span className="text-sm font-medium">Total pago</span>
          <span className="text-lg font-bold text-ink dark:text-white">
            {reserva.preco_total != null ? `${reserva.preco_total.toLocaleString("pt-AO")} Kz` : "—"}
          </span>
        </div>

        {reserva.controlo_qualidade && (
          <div className="pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
            <p className="text-sm font-medium mb-1">Avaliação de qualidade recebida</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`h-5 w-5 ${n <= reserva.controlo_qualidade!.pontuacao ? "fill-amber-400 text-amber-400" : "text-ink-ghost"}`} />
              ))}
            </div>
            {reserva.controlo_qualidade.observacoes && (
              <p className="text-sm text-ink-mid/70 mt-1">{reserva.controlo_qualidade.observacoes}</p>
            )}
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

        {reserva.re_lavagem_de_id && (
          <p className="text-xs text-ink-mid/70 pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
            Esta lavagem foi oferecida como re-lavagem de uma reserva anterior.
          </p>
        )}
      </div>
    </div>
  );
}
