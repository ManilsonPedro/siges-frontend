"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, Plus, LogOut, Loader2 } from "lucide-react";
import { portalAuthService, portalReservaService } from "@/shared/services/portal.service";
import { operacoesLavagemService } from "@/shared/services/operacoes.service";

const ESTADO_LABEL: Record<string, string> = {
  rascunho: "Rascunho", agendada: "Agendada", confirmada: "Confirmada", checkin: "Check-in",
  em_curso: "Em Curso", controlo_qualidade: "Controlo de Qualidade", concluida: "Concluída",
  paga: "Paga", cancelada: "Cancelada",
};
const ESTADO_COLOR: Record<string, string> = {
  rascunho: "bg-surface text-ink-mid", agendada: "bg-ink/10 text-ink", confirmada: "bg-ink/10 text-ink",
  checkin: "bg-amber-100 text-amber-700", em_curso: "bg-amber-100 text-amber-700",
  controlo_qualidade: "bg-amber-100 text-amber-700", concluida: "bg-live-dim text-live",
  paga: "bg-live-dim text-live", cancelada: "bg-danger/10 text-danger",
};

export default function MinhasReservasPage() {
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (!portalAuthService.isAuthenticated()) router.push("/portal/login");
  }, [router]);

  const { data: reservas = [], isLoading } = useQuery({ queryKey: ["portal-minhas-reservas"], queryFn: portalReservaService.minhasReservas });
  const { data: tipos = [] } = useQuery({ queryKey: ["portal-tipos"], queryFn: operacoesLavagemService.listTipos });

  const cancelarMut = useMutation({
    mutationFn: (id: string) => portalReservaService.cancelarReserva(id),
    onSuccess: () => { toast.success("Reserva cancelada"); qc.invalidateQueries({ queryKey: ["portal-minhas-reservas"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao cancelar"),
  });

  function tipoNome(id: string) { return tipos.find((t) => t.id === id)?.nome || id; }
  function sair() { portalAuthService.logout(); router.push("/portal/login"); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-7 w-7 text-ink dark:text-white" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">As Minhas Reservas</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/portal/reservar" className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 text-sm">
            <Plus className="h-4 w-4" /> Nova reserva
          </Link>
          <button onClick={sair} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-surface">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>

      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {!isLoading && reservas.length === 0 && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow p-8 text-center text-ink-mid/70">
          Ainda não tem nenhuma reserva. <Link href="/portal/reservar" className="text-ink dark:text-white font-medium hover:underline">Reservar agora</Link>
        </div>
      )}
      <div className="space-y-3">
        {reservas.map((r) => (
          <div key={r.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink dark:text-white">{tipoNome(r.tipo_lavagem_id)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[r.estado]}`}>{ESTADO_LABEL[r.estado] || r.estado}</span>
                  {r.preco_total != null && <span className="text-xs font-semibold text-ink dark:text-white">{r.preco_total.toLocaleString("pt-AO")} Kz</span>}
                </div>
                <p className="text-xs text-ink-mid/70 mt-1">{new Date(r.created_at).toLocaleString("pt-PT")}</p>
              </div>
              {(r.estado === "rascunho" || r.estado === "agendada" || r.estado === "confirmada") && (
                <button onClick={() => confirm("Cancelar esta reserva?") && cancelarMut.mutate(r.id)}
                  className="text-xs px-3 py-1.5 border border-danger text-danger rounded-lg hover:bg-danger/10">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
