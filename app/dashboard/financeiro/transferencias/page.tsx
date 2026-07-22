"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fundoService } from "@/shared/services/financeiro.service";
import { formatCurrency, formatDateTime } from "@/shared/utils";
import { toast } from "sonner";
import {
  RepeatIcon, ArrowRight, Wallet, History,
  AlertCircle, Loader2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/shared/utils";

type FundoTipo = "BCS" | "BFA";

function FundoCard({ tipo, saldo, disponivel, acumulado, selected, onClick }: {
  tipo: FundoTipo;
  saldo: number;
  disponivel: number;
  acumulado: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const colors: Record<FundoTipo, { bg: string; border: string; badge: string; text: string }> = {
    BCS: {
      bg:     "bg-blue-50 dark:bg-blue-950/30",
      border: selected ? "border-blue-500" : "border-blue-200 dark:border-blue-800",
      badge:  "bg-blue-600",
      text:   "text-blue-700 dark:text-blue-300",
    },
    BFA: {
      bg:     "bg-purple-50 dark:bg-purple-950/30",
      border: selected ? "border-purple-500" : "border-purple-200 dark:border-purple-800",
      badge:  "bg-purple-600",
      text:   "text-purple-700 dark:text-purple-300",
    },
  };
  const c = colors[tipo];

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 p-5 transition-all",
        c.bg, c.border,
        onClick && "cursor-pointer hover:shadow-md",
        selected && "ring-2 ring-offset-2",
        tipo === "BCS" ? "ring-blue-500" : "ring-purple-500"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", c.badge)}>
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-ink dark:text-white">Fundo {tipo}</span>
        </div>
        {selected && <CheckCircle2 className={cn("h-5 w-5", tipo === "BCS" ? "text-blue-500" : "text-purple-500")} />}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-ink-mid/70 dark:text-ink-mid/60">Saldo disponível</span>
          <span className={cn("font-bold", c.text)}>{formatCurrency(saldo)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-mid/70 dark:text-ink-mid/60">Valor carregado</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(disponivel)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-mid/70 dark:text-ink-mid/60">Acumulado saído</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(acumulado)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TransferenciasPage() {
  const qc = useQueryClient();

  const [origem,      setOrigem]      = useState<FundoTipo>("BCS");
  const [valor,       setValor]       = useState("");
  const [observacao,  setObservacao]  = useState("");

  const destino: FundoTipo = origem === "BCS" ? "BFA" : "BCS";

  const { data: fundos, isLoading } = useQuery({
    queryKey: ["fundos"],
    queryFn: fundoService.get,
    staleTime: 60_000,
  });

  const { data: historico = [], isLoading: histLoading } = useQuery({
    queryKey: ["fundos-historico"],
    queryFn: () => fundoService.historico(10),
    staleTime: 60_000,
  });

  const origemFundo = fundos?.[origem.toLowerCase() as "bcs" | "bfa"];
  const destinoFundo = fundos?.[destino.toLowerCase() as "bcs" | "bfa"];
  const valorNum = parseFloat(valor.replace(",", ".")) || 0;
  const saldoOrigem = origemFundo?.saldo_atual ?? 0;
  const insuficiente = valorNum > 0 && valorNum > saldoOrigem;

  const transferMut = useMutation({
    mutationFn: async () => {
      if (valorNum <= 0) throw new Error("Valor inválido");
      if (insuficiente) throw new Error("Saldo insuficiente");
      // Remove do fundo de origem
      await fundoService.update({
        tipo: origem,
        valor_disponivel: -(valorNum),
        observacao: observacao || `Transferência para Fundo ${destino}`,
      });
      // Adiciona ao fundo de destino
      await fundoService.update({
        tipo: destino,
        valor_disponivel: valorNum,
        observacao: observacao || `Transferência desde Fundo ${origem}`,
      });
    },
    onSuccess: () => {
      toast.success(`Transferência de ${formatCurrency(valorNum)} efectuada com sucesso`);
      setValor("");
      setObservacao("");
      qc.invalidateQueries({ queryKey: ["fundos"] });
      qc.invalidateQueries({ queryKey: ["fundos-historico"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: any) => toast.error(e?.message || e?.response?.data?.detail || "Erro na transferência"),
  });

  return (
    <div className="max-w-3xl space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Transferências entre Fundos</h1>
        <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 mt-1">
          Mova saldo entre Fundo BCS e Fundo BFA
        </p>
      </div>

      {/* Cards dos fundos */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-ink-mid/50" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FundoCard
            tipo="BCS"
            saldo={fundos?.bcs?.saldo_atual ?? 0}
            disponivel={fundos?.bcs?.valor_disponivel ?? 0}
            acumulado={fundos?.bcs?.acumulado ?? 0}
            selected={origem === "BCS"}
            onClick={() => setOrigem("BCS")}
          />
          <FundoCard
            tipo="BFA"
            saldo={fundos?.bfa?.saldo_atual ?? 0}
            disponivel={fundos?.bfa?.valor_disponivel ?? 0}
            acumulado={fundos?.bfa?.acumulado ?? 0}
            selected={origem === "BFA"}
            onClick={() => setOrigem("BFA")}
          />
        </div>
      )}

      {/* Formulário de transferência */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-ink dark:text-white">
          <RepeatIcon className="h-4 w-4 text-ink" />
          Nova Transferência
        </div>

        {/* Visualização origem → destino */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface dark:bg-gray-800/60">
          <div className="flex-1 text-center">
            <p className="text-[11px] text-ink-mid/50 uppercase tracking-wide mb-0.5">Origem</p>
            <p className={cn("text-base font-bold", origem === "BCS" ? "text-ink" : "text-purple-600")}>
              Fundo {origem}
            </p>
            <p className="text-xs text-ink-mid/70 mt-0.5">
              Saldo: {formatCurrency(saldoOrigem)}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-ink-mid/50 shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-[11px] text-ink-mid/50 uppercase tracking-wide mb-0.5">Destino</p>
            <p className={cn("text-base font-bold", destino === "BCS" ? "text-ink" : "text-purple-600")}>
              Fundo {destino}
            </p>
            <p className="text-xs text-ink-mid/70 mt-0.5">
              Saldo: {formatCurrency(destinoFundo?.saldo_atual ?? 0)}
            </p>
          </div>
        </div>

        <p className="text-xs text-ink-mid/50 -mt-1 text-center">
          Clique num fundo acima para escolher a origem
        </p>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Valor a transferir (AOA)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            className={cn(
              "w-full rounded-xl border px-4 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white",
              "focus:outline-none focus:ring-2 focus:ring-ink",
              insuficiente
                ? "border-red-400 dark:border-red-600"
                : "border-ink-ghost/80 dark:border-gray-700"
            )}
          />
          {insuficiente && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-danger">
              <AlertCircle className="h-3.5 w-3.5" />
              Saldo insuficiente no Fundo {origem} ({formatCurrency(saldoOrigem)} disponível)
            </p>
          )}
          {valorNum > 0 && !insuficiente && (
            <p className="mt-1.5 text-xs text-ink-mid/50">
              Saldo após transferência: <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(saldoOrigem - valorNum)}</span>
            </p>
          )}
        </div>

        {/* Observação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Observação <span className="text-ink-mid/50 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Motivo da transferência..."
            maxLength={200}
            className="w-full rounded-xl border border-ink-ghost/80 dark:border-gray-700 px-4 py-2.5 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>

        {/* Botão */}
        <button
          onClick={() => transferMut.mutate()}
          disabled={!valorNum || valorNum <= 0 || insuficiente || transferMut.isPending}
          className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          {transferMut.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> A processar...</>
          ) : (
            <><RepeatIcon className="h-4 w-4" /> Transferir {valorNum > 0 ? formatCurrency(valorNum) : ""}</>
          )}
        </button>
      </div>

      {/* Histórico recente */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
          <History className="h-4 w-4 text-ink-mid/70" />
          <h2 className="text-sm font-semibold text-ink dark:text-white">Histórico Recente de Movimentos de Fundo</h2>
        </div>

        {histLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-ink-mid/50" /></div>
        ) : historico.length === 0 ? (
          <p className="text-sm text-ink-mid/50 text-center py-6">Sem movimentos registados</p>
        ) : (
          <div className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {historico.map((h: any) => {
              const isPositivo = h.valor_novo > h.valor_anterior;
              return (
                <div key={h.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[11px] font-bold px-2 py-0.5 rounded-full",
                        h.tipo === "BCS" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                         : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                      )}>
                        {h.tipo ?? "—"}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {h.observacao || "Sem descrição"}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-mid/50 mt-0.5">
                      {h.created_at ? formatDateTime(h.created_at) : "—"}
                      {h.created_by_name && <> · {h.created_by_name}</>}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={cn("text-sm font-bold", isPositivo ? "text-live" : "text-danger")}>
                      {isPositivo ? "+" : ""}{formatCurrency((h.valor_novo ?? 0) - (h.valor_anterior ?? 0))}
                    </p>
                    <p className="text-[11px] text-ink-mid/50">
                      → {formatCurrency(h.valor_novo ?? 0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
