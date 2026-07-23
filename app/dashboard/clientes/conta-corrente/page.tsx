"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { clienteService } from "@/shared/services/financeiro.service";

function formatAOA(valor: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  }).format(valor);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ContaCorrentePage() {
  const { data: clientes = [] } = useQuery({ queryKey: ["clientes"], queryFn: clienteService.list });
  const [clienteId, setClienteId] = useState<string>("");

  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: ["cliente-conta-corrente", clienteId],
    queryFn: () => clienteService.contaCorrente(clienteId),
    enabled: !!clienteId,
  });

  const totalDebitos = lancamentos.reduce((acc, l) => acc + l.debito, 0);
  const totalCreditos = lancamentos.reduce((acc, l) => acc + l.credito, 0);
  const saldoFinal = lancamentos.length > 0 ? lancamentos[lancamentos.length - 1].saldo : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Conta Corrente</h1>
        <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
          Extrato de débitos (vendas) e créditos (pagamentos) por cliente.
        </p>
      </div>

      <div className="max-w-sm">
        <label className="mb-1 block text-sm font-medium text-ink dark:text-white">Cliente</label>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full rounded-lg border border-ink-ghost/60 bg-panel px-3 py-2 text-sm dark:border-ink-ghost/20 dark:bg-panel dark:text-gray-200"
        >
          <option value="">Seleccionar cliente…</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {!clienteId && (
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-8 text-center text-sm text-ink-mid/70 dark:border-ink-ghost/20">
          Seleccione um cliente para ver o extrato.
        </div>
      )}

      {clienteId && isLoading && (
        <div className="flex items-center gap-2 text-sm text-ink-mid/70">
          <Loader2 className="h-4 w-4 animate-spin" /> A carregar extrato…
        </div>
      )}

      {clienteId && !isLoading && lancamentos.length === 0 && (
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-8 text-center text-sm text-ink-mid/70 dark:border-ink-ghost/20">
          Sem movimentos para este cliente.
        </div>
      )}

      {clienteId && !isLoading && lancamentos.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total Débitos</p>
              <p className="text-lg font-bold text-ink dark:text-white">{formatAOA(totalDebitos)}</p>
            </div>
            <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total Créditos</p>
              <p className="text-lg font-bold text-live dark:text-green-400">{formatAOA(totalCreditos)}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950">
              <p className="text-xs text-blue-600 dark:text-blue-400">Saldo Final</p>
              <p className="text-lg font-bold text-blue-900 dark:text-white">{formatAOA(saldoFinal)}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-ghost/40 bg-surface dark:border-gray-700 dark:bg-gray-700/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Data</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Documento</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">Descrição</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Débito</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Crédito</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
                  {lancamentos.map((l, i) => (
                    <tr
                      key={l.id + i}
                      className={i === lancamentos.length - 1 ? "bg-blue-50/60 dark:bg-blue-950/30 font-semibold" : "hover:bg-surface dark:hover:bg-gray-700/30"}
                    >
                      <td className="px-4 py-3 text-ink-mid dark:text-gray-300">{formatDate(l.data)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-mid dark:text-gray-300">{l.documento}</td>
                      <td className="px-4 py-3 text-ink-mid dark:text-gray-300">
                        {l.descricao}
                        {i === lancamentos.length - 1 && (
                          <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            SALDO
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-ink dark:text-white">{l.debito > 0 ? formatAOA(l.debito) : "—"}</td>
                      <td className="px-4 py-3 text-right text-live dark:text-green-400">{l.credito > 0 ? formatAOA(l.credito) : "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-ink dark:text-white">{formatAOA(l.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
