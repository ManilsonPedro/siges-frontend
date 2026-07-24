"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { History, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { portalAuthService, portalReservaService } from "@/shared/services/portal.service";

const ESTADO_LABEL: Record<string, string> = {
  concluida: "Concluída", paga: "Paga", cancelada: "Cancelada",
};
const ESTADO_COLOR: Record<string, string> = {
  concluida: "bg-live-dim text-live", paga: "bg-live-dim text-live", cancelada: "bg-danger/10 text-danger",
};

export default function HistoricoPage() {
  const router = useRouter();

  useEffect(() => {
    if (!portalAuthService.isAuthenticated()) router.push("/portal/login");
  }, [router]);

  const { data: reservas = [], isLoading } = useQuery({ queryKey: ["portal-historico"], queryFn: portalReservaService.historico });
  const { data: resumo } = useQuery({ queryKey: ["portal-resumo"], queryFn: portalReservaService.resumo });
  const { data: tipos = [] } = useQuery({ queryKey: ["portal-tipos"], queryFn: portalReservaService.listTiposLavagem });

  function tipoNome(id: string) { return tipos.find((t) => t.id === id)?.nome || id; }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/minhas-reservas" className="text-ink-mid/70 hover:text-ink"><ArrowLeft className="h-5 w-5" /></Link>
        <History className="h-7 w-7 text-ink dark:text-white" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Histórico de Lavagens</h1>
      </div>

      {resumo && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70 uppercase">Total de lavagens</p>
            <p className="text-2xl font-bold text-ink dark:text-white">{resumo.total_lavagens}</p>
          </div>
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70 uppercase">Valor total gasto</p>
            <p className="text-2xl font-bold text-ink dark:text-white">{resumo.valor_total_gasto.toLocaleString("pt-AO")} Kz</p>
          </div>
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70 uppercase">Serviço mais frequente</p>
            <p className="text-2xl font-bold text-ink dark:text-white">{resumo.tipo_lavagem_mais_frequente || "—"}</p>
          </div>
        </div>
      )}

      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {!isLoading && reservas.length === 0 && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow p-8 text-center text-ink-mid/70">
          Ainda não tem lavagens concluídas.
        </div>
      )}

      <div className="space-y-3">
        {reservas.map((r) => (
          <Link key={r.id} href={`/portal/historico/${r.id}`}
            className="block bg-panel dark:bg-panel rounded-xl shadow p-4 hover:bg-surface dark:hover:bg-ink-ghost/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink dark:text-white">{tipoNome(r.tipo_lavagem_id)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[r.estado] || "bg-surface text-ink-mid"}`}>{ESTADO_LABEL[r.estado] || r.estado}</span>
                  {r.preco_total != null && <span className="text-xs font-semibold text-ink dark:text-white">{r.preco_total.toLocaleString("pt-AO")} Kz</span>}
                </div>
                <p className="text-xs text-ink-mid/70 mt-1">{new Date(r.created_at).toLocaleString("pt-PT")}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-ink-mid/50" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
