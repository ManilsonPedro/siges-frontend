"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, LockOpen, Calendar, AlertTriangle } from "lucide-react";
import { periodoService, type PeriodoFechado } from "@/shared/services/financeiro.service";
import { usePermissions } from "@/shared/hooks/use-permissions";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function PeriodosPage() {
  const router = useRouter();
  const { has, isLoading: permsLoading } = usePermissions();
  const podeGerir = has("periodos.ver");
  const qc = useQueryClient();
  const agora = new Date();
  const [ano, setAno] = useState(agora.getFullYear());
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (!permsLoading && !podeGerir) router.replace("/dashboard");
  }, [permsLoading, podeGerir, router]);

  const { data: periodos = [], isLoading } = useQuery({
    queryKey: ["periodos"],
    queryFn: periodoService.list,
    enabled: podeGerir,
  });

  const fecharMutation = useMutation({
    mutationFn: () => periodoService.fechar(ano, mes, motivo || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periodos"] });
      toast.success(`Período ${ano}-${String(mes).padStart(2, "0")} fechado`);
      setMotivo("");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro ao fechar"),
  });

  const reabrirMutation = useMutation({
    mutationFn: (p: PeriodoFechado) => periodoService.reabrir(p.ano, p.mes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periodos"] });
      toast.success("Período reaberto");
    },
    onError: () => toast.error("Erro ao reabrir"),
  });

  if (!permsLoading && !podeGerir) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber/15 dark:bg-amber-900/30">
          <Lock className="h-5 w-5 text-amber" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Períodos Contabilísticos</h1>
          <p className="text-ink-mid/70 text-sm">Fechar meses para bloquear edição de movimentos antigos</p>
        </div>
      </div>

      <div className="bg-amber/8 dark:bg-amber/10 border border-amber/30 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-amber flex-shrink-0 mt-0.5" />
        <p className="text-amber dark:text-amber-300">
          Após fechar um período, <strong>ninguém</strong> poderá criar, alterar ou apagar movimentos com data dentro desse mês. Apenas o admin pode reabrir.
        </p>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ink dark:text-white mb-4">Fechar período</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano</label>
            <select value={ano} onChange={(e) => setAno(+e.target.value)}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mês</label>
            <select value={mes} onChange={(e) => setMes(+e.target.value)}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
              {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo (opcional)</label>
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)}
              placeholder="Fecho mensal apresentado"
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
        </div>
        <button onClick={() => fecharMutation.mutate()} disabled={fecharMutation.isPending}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg text-sm">
          <Lock className="h-4 w-4" />
          Fechar {MESES[mes-1]}/{ano}
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
          <h2 className="text-base font-semibold text-ink dark:text-white">Períodos fechados</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50 animate-pulse">A carregar...</div>
        ) : periodos.length === 0 ? (
          <div className="p-12 text-center text-ink-mid/50 text-sm">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            Nenhum período fechado.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Período</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Fechado em</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Motivo</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Acções</th>
              </tr>
            </thead>
            <tbody>
              {periodos.map((p) => (
                <tr key={p.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-ink dark:text-white">
                      <Lock className="h-3.5 w-3.5 text-amber" />
                      {MESES[p.mes-1]} {p.ano}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-mid/70">{new Date(p.fechado_em).toLocaleString("pt-PT")}</td>
                  <td className="px-4 py-3 text-sm text-ink-mid dark:text-ink-mid/50">{p.motivo || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm(`Reabrir ${MESES[p.mes-1]} ${p.ano}?`)) reabrirMutation.mutate(p); }}
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-live dark:bg-green-900/30 dark:text-live">
                      <LockOpen className="h-3 w-3" /> Reabrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
