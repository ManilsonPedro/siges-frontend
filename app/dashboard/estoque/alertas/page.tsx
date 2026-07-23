"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Package,
  Bell,
  Filter,
  Loader2,
} from "lucide-react";
import { estoqueService } from "@/shared/services/financeiro.service";
import type { StockSaldo } from "@/shared/types";

function calcBarPct(saldo: StockSaldo) {
  if (saldo.stock_minimo <= 0) return 0;
  // referência visual: dobro do mínimo = barra cheia
  const referencia = saldo.stock_minimo * 2;
  const pct = (saldo.qtd_actual / referencia) * 100;
  return Math.min(pct, 100);
}

export default function AlertasStockPage() {
  const { data: saldos = [], isLoading } = useQuery({
    queryKey: ["estoque-saldos"],
    queryFn: () => estoqueService.saldos(),
  });

  const abaixoMinimo = saldos.filter((s) => s.abaixo_minimo);
  const normais = saldos.filter((s) => !s.abaixo_minimo);

  const ordenados = [...saldos].sort((a, b) => {
    if (a.abaixo_minimo === b.abaixo_minimo) return a.produto_nome.localeCompare(b.produto_nome);
    return a.abaixo_minimo ? -1 : 1;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Alertas de Stock
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Produtos abaixo do stock mínimo configurado, por armazém.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {abaixoMinimo.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-sm font-semibold text-danger dark:bg-red-900/40 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {abaixoMinimo.length} produto{abaixoMinimo.length > 1 ? "s" : ""} abaixo do mínimo
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> A carregar stock…
        </div>
      )}

      {!isLoading && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-danger/30 bg-panel p-4 dark:border-red-800 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Abaixo do Mínimo</p>
                <XCircle className="h-4 w-4 text-danger dark:text-red-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-danger dark:text-red-400">{abaixoMinimo.length}</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">requer reposição</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-panel p-4 dark:border-green-800 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stock Normal</p>
                <CheckCircle2 className="h-4 w-4 text-live dark:text-green-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-live dark:text-green-400">{normais.length}</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">dentro do mínimo</p>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Legenda:
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger dark:bg-red-900/40 dark:text-red-400">
              <XCircle className="h-3 w-3" /> Abaixo do Mínimo
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-live-dim px-2.5 py-1 text-xs font-semibold text-live dark:bg-green-900/40 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" /> Normal
            </span>
          </div>

          {/* Tabela */}
          <div className="rounded-xl border border-slate-200 bg-panel dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Todos os Artigos — Nível de Stock
                </h2>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {saldos.length} combinações produto/armazém
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Armazém</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Stock Actual</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Reservado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Mínimo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[140px]">Nível</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenados.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                        Sem produtos com stock configurado.
                      </td>
                    </tr>
                  )}
                  {ordenados.map((saldo) => {
                    const barPct = calcBarPct(saldo);
                    return (
                      <tr
                        key={`${saldo.produto_id}-${saldo.armazem_id}`}
                        className={`border-b border-slate-100 hover:opacity-90 dark:border-slate-700/50 last:border-b-0 transition-colors ${
                          saldo.abaixo_minimo ? "bg-red-50/60 dark:bg-red-950/20" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{saldo.produto_sku}</span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-start gap-2">
                            <Package className={`mt-0.5 h-4 w-4 shrink-0 ${saldo.abaixo_minimo ? "text-danger dark:text-red-400" : "text-slate-400"}`} />
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight">{saldo.produto_nome}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{saldo.armazem_codigo} — {saldo.armazem_nome}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-bold ${saldo.abaixo_minimo ? "text-danger dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}>
                            {saldo.qtd_actual.toLocaleString("pt-AO")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-slate-500 dark:text-slate-400">{saldo.qtd_reservada.toLocaleString("pt-AO")}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {saldo.stock_minimo.toLocaleString("pt-AO")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600">
                            <div
                              className={`h-2 rounded-full ${saldo.abaixo_minimo ? "bg-danger" : "bg-green-500"}`}
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {saldo.abaixo_minimo ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger dark:bg-red-900/40 dark:text-red-400">
                              <XCircle className="h-3 w-3" /> Abaixo do Mínimo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-live-dim px-2.5 py-1 text-xs font-semibold text-live dark:bg-green-900/40 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" /> Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-700/30">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Stock mínimo configurável por produto/armazém em Armazéns &amp; Inventário.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Fonte: Estoque
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
