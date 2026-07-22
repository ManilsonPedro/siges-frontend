"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fundoService, origensFundoService } from "@/shared/services/financeiro.service";
import { formatCurrency, formatDateTime } from "@/shared/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Wallet, TrendingDown, TrendingUp, Loader2, History, ArrowUp, ArrowDown, FileDown } from "lucide-react";
import type { Fundo } from "@/shared/types";

// Fallback labels para dados legacy (slugs antigos)
const LEGACY_LABELS: Record<string, string> = {
  aumento_capital: "Aumento de Capital",
  emprestimo: "Empréstimo",
  receita: "Receita",
  outro: "Outro",
};

const schema = z.object({
  tipo: z.enum(["BCS", "BFA"]),
  valor_disponivel: z.coerce.number().min(0, "Valor não pode ser negativo"),
  origem: z.string().optional(),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function FundoCards({ fundo, label, color }: { fundo: Fundo; label: string; color: string }) {
  return (
    <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
      <div className={`px-5 py-3 ${color}`}>
        <h3 className="text-white font-bold text-base">{label}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-y-0 divide-x-0 sm:divide-x divide-ink-ghost/40 dark:divide-ink-ghost/15 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
        {[
          { label: "Valor Disponibilizado", value: fundo.valor_disponivel, icon: Wallet, textColor: "" },
          { label: "Total Entradas", value: fundo.total_entradas ?? 0, icon: ArrowUp, textColor: "text-green-700 dark:text-green-400" },
          { label: "Acumulado (Saídas Pagas)", value: fundo.acumulado, icon: TrendingDown, textColor: "text-red-700 dark:text-red-400" },
          { label: "Saldo Disponível", value: fundo.saldo_atual, icon: TrendingUp, textColor: "text-blue-700 dark:text-blue-400" },
        ].map(({ label: l, value, icon: Icon, textColor }, i) => (
          <div key={l} className={`p-4 flex items-start gap-3 ${i > 0 && i < 2 ? "border-l border-ink-ghost/40 dark:border-ink-ghost/15 sm:border-0" : ""}`}>
            <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}><Icon className="h-4 w-4 text-white" /></div>
            <div className="min-w-0">
              <p className="text-xs text-ink-mid/70">{l}</p>
              <p className={`text-sm font-bold leading-tight break-all ${textColor || "text-ink dark:text-white"}`}>{formatCurrency(value)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 flex items-center gap-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
        <ArrowDown className="h-4 w-4 text-red-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-ink-mid/70">Total Saídas Registadas</p>
          <p className="text-sm font-bold text-danger break-all">{formatCurrency(fundo.total_saidas ?? 0)}</p>
        </div>
      </div>
      {fundo.updated_at && (
        <div className="px-5 py-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
          <p className="text-xs text-ink-mid/50">Última actualização: {formatDateTime(fundo.updated_at)}</p>
        </div>
      )}
    </div>
  );
}

export default function FundosPage() {
  const qc = useQueryClient();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { data: fundos, isLoading } = useQuery({ queryKey: ["fundo"], queryFn: fundoService.get });
  const { data: historico = [] } = useQuery({ queryKey: ["fundo-historico"], queryFn: () => fundoService.historico(10) });
  const { data: origensCatalogo = [] } = useQuery({ queryKey: ["origens-fundo"], queryFn: origensFundoService.listar });
  const origensAtivas = origensCatalogo.filter(o => o.estado === "ativo");

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: "BCS", valor_disponivel: 0, observacao: "" },
  });

  const valorWatch = watch("valor_disponivel");

  const updateMutation = useMutation({
    mutationFn: (dto: FormData) => fundoService.update({ tipo: dto.tipo, valor_disponivel: dto.valor_disponivel, observacao: dto.observacao, origem: dto.origem }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fundo"] });
      qc.invalidateQueries({ queryKey: ["fundo-historico"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Fundo actualizado com sucesso");
      reset({ tipo: "BCS", valor_disponivel: 0, observacao: "" });
    },
    onError: () => toast.error("Erro ao actualizar fundo"),
  });

  async function handleExport() {
    setIsExporting(true);
    try {
      const blob = await fundoService.exportExcel(dataInicio || undefined, dataFim || undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historico_fundos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao exportar Excel");
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-ink-mid/50 animate-pulse">A carregar...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Gestão de Fundos</h1>
        <p className="text-ink-mid/70 text-sm">Controle os fundos BCS e BFA separadamente</p>
      </div>

      {fundos?.bcs && <FundoCards fundo={fundos.bcs} label="Fundo BCS" color="bg-ink" />}
      {fundos?.bfa && <FundoCards fundo={fundos.bfa} label="Fundo BFA" color="bg-purple-600" />}

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-6">
        <h2 className="text-base font-semibold text-ink dark:text-white mb-4">Carregar Valor Disponibilizado</h2>
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fundo</label>
              <select
                {...register("tipo")}
                className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
              >
                <option value="BCS">BCS</option>
                <option value="BFA">BFA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Disponibilizado (AOA)</label>
              <input
                {...register("valor_disponivel")}
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
              />
              {valorWatch > 0 && (
                <p className="text-xs text-ink mt-1 font-medium">{formatCurrency(valorWatch)}</p>
              )}
              {errors.valor_disponivel && <p className="text-danger text-xs mt-1">{errors.valor_disponivel.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origem do fundo</label>
            <select
              {...register("origem")}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="">— Seleccionar (opcional) —</option>
              {origensAtivas.map(o => <option key={o.id} value={o.nome}>{o.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observação</label>
            <textarea
              {...register("observacao")}
              rows={2}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar Alterações
          </button>
        </form>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <History className="h-4 w-4 text-ink" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink dark:text-white">Histórico de Carregamentos</h2>
              <p className="text-xs text-ink-mid/50">Últimos 10 carregamentos</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-2 py-1.5 text-xs bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
            <span className="text-xs text-ink-mid/50">até</span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-2 py-1.5 text-xs bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
            <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-1.5 bg-live hover:bg-green-700 disabled:opacity-60 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors">
              {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileDown className="h-3 w-3" />}
              Exportar Excel
            </button>
          </div>
        </div>

        {historico.length === 0 ? (
          <div className="p-8 text-center text-ink-mid/50 text-sm">Nenhum carregamento registado ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface dark:bg-ink-ghost/20 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                  {["Data / Hora", "Utilizador", "Fundo", "Origem", "Valor Anterior", "Valor Novo", "Variação", "Observação"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-mid/70 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historico.map(c => {
                  const diff = c.valor_novo - c.valor_anterior;
                  const isUp = diff >= 0;
                  return (
                    <tr key={c.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-ink-ghost/20">
                      <td className="px-4 py-3 text-ink-mid/70 whitespace-nowrap">{formatDateTime(c.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-ink dark:text-white">{c.user_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${c.fundo_tipo === "BFA" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
                          {c.fundo_tipo || "BCS"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-mid dark:text-gray-400">{c.origem ? (LEGACY_LABELS[c.origem] || c.origem) : "—"}</td>
                      <td className="px-4 py-3 text-ink-mid dark:text-gray-400">{formatCurrency(c.valor_anterior)}</td>
                      <td className="px-4 py-3 font-semibold text-ink dark:text-white">{formatCurrency(c.valor_novo)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isUp ? "bg-green-100 text-green-700" : "bg-danger/10 text-danger"}`}>
                          {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {formatCurrency(Math.abs(diff))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-mid/70 max-w-xs truncate">{c.observacao || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
