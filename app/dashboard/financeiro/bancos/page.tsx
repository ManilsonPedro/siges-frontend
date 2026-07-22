"use client";

import { Database, CreditCard, ArrowUpCircle, ArrowDownCircle, Building2, RefreshCw } from "lucide-react";

function formatAOA(valor: number) {
  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(valor);
}

const contasBancarias = [
  {
    id: 1,
    banco: "BAI — Banco Angolano de Investimentos",
    sigla: "BAI",
    numeroConta: "000 423 819 101 7",
    iban: "AO06 0040 0000 0004 2381 9101 7",
    moeda: "AOA",
    saldoActual: 34_820_000,
    ultimoMovimento: { data: "17/06/2026", descricao: "Recebimento cliente — Supermercado Nosso Super", valor: 2_450_000, tipo: "entrada" },
    cor: "from-blue-600 to-blue-800",
    corBg: "bg-blue-50 dark:bg-blue-950/30",
    corBorder: "border-blue-200 dark:border-blue-800",
  },
  {
    id: 2,
    banco: "BFA — Banco de Fomento Angola",
    sigla: "BFA",
    numeroConta: "000 112 654 880 3",
    iban: "AO06 0055 0000 0011 2654 8803 0",
    moeda: "AOA",
    saldoActual: 18_150_000,
    ultimoMovimento: { data: "16/06/2026", descricao: "Pagamento fornecedor — Químicos do Sul Lda", valor: -3_120_000, tipo: "saida" },
    cor: "from-green-600 to-green-800",
    corBg: "bg-green-50 dark:bg-green-950/30",
    corBorder: "border-green-200 dark:border-green-800",
  },
  {
    id: 3,
    banco: "Banco Atlântico",
    sigla: "ATL",
    numeroConta: "000 078 392 445 1",
    iban: "AO06 0006 0000 0007 8392 4451 0",
    moeda: "AOA",
    saldoActual: 12_490_000,
    ultimoMovimento: { data: "15/06/2026", descricao: "Transferência interna — reforço de tesouraria", valor: 5_000_000, tipo: "entrada" },
    cor: "from-orange-500 to-orange-700",
    corBg: "bg-orange-50 dark:bg-orange-950/30",
    corBorder: "border-orange-200 dark:border-orange-800",
  },
  {
    id: 4,
    banco: "BPC — Banco de Poupança e Crédito",
    sigla: "BPC",
    numeroConta: "000 301 728 963 5",
    iban: "AO06 0040 0000 0030 1728 9635 0",
    moeda: "AOA",
    saldoActual: 11_620_000,
    ultimoMovimento: { data: "14/06/2026", descricao: "Pagamento salários — Junho 2026", valor: -8_740_000, tipo: "saida" },
    cor: "from-purple-600 to-purple-800",
    corBg: "bg-purple-50 dark:bg-purple-950/30",
    corBorder: "border-purple-200 dark:border-purple-800",
  },
];

const movimentosRecentes = [
  { id: 1, data: "17/06/2026", banco: "BAI", descricao: "Recebimento — Supermercado Nosso Super", referencia: "REC-2026-0412", tipo: "entrada", valor: 2_450_000 },
  { id: 2, data: "16/06/2026", banco: "BFA", descricao: "Pagamento fornecedor — Químicos do Sul Lda", referencia: "PAG-2026-0831", tipo: "saida", valor: 3_120_000 },
  { id: 3, data: "15/06/2026", banco: "ATL", descricao: "Transferência interna — reforço tesouraria", referencia: "TRF-2026-0099", tipo: "entrada", valor: 5_000_000 },
  { id: 4, data: "14/06/2026", banco: "BPC", descricao: "Pagamento salários — Junho 2026", referencia: "SAL-2026-0006", tipo: "saida", valor: 8_740_000 },
  { id: 5, data: "13/06/2026", banco: "BAI", descricao: "Recebimento — Hipermercado Shoprite Luanda", referencia: "REC-2026-0411", tipo: "entrada", valor: 6_300_000 },
  { id: 6, data: "12/06/2026", banco: "BFA", descricao: "Serviço de transporte — Logística Rápida Lda", referencia: "PAG-2026-0830", tipo: "saida", valor: 980_000 },
  { id: 7, data: "11/06/2026", banco: "BAI", descricao: "Recebimento — Governo Provincial de Benguela", referencia: "REC-2026-0410", tipo: "entrada", valor: 12_800_000 },
  { id: 8, data: "10/06/2026", banco: "BPC", descricao: "Pagamento aluguer armazém — Junho 2026", referencia: "PAG-2026-0829", tipo: "saida", valor: 1_450_000 },
  { id: 9, data: "09/06/2026", banco: "ATL", descricao: "Recebimento — Clínica São Lucas", referencia: "REC-2026-0409", tipo: "entrada", valor: 870_000 },
  { id: 10, data: "08/06/2026", banco: "BAI", descricao: "Imposto industrial — AGT Junho 2026", referencia: "PAG-2026-0828", tipo: "saida", valor: 4_210_000 },
];

const totalSaldo = contasBancarias.reduce((s, c) => s + c.saldoActual, 0);

export default function BancosPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Contas Bancárias</h1>
          <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 mt-1">
            Posição bancária consolidada da Aquasan Angola — Junho 2026
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Database size={12} />
          Primavera ERP
        </span>
      </div>

      {/* Banner Primavera */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
        <Database size={16} className="text-ink dark:text-blue-400 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          Dados sincronizados do Primavera ERP — apenas leitura
        </p>
      </div>

      {/* KPI Total Geral */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 p-3">
            <Building2 size={22} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 font-medium">Saldo Total Consolidado</p>
            <p className="text-3xl font-bold text-ink dark:text-white mt-0.5">{formatAOA(totalSaldo)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-mid/50 dark:text-ink-mid/40">
          <RefreshCw size={12} />
          <span>Actualizado em 17/06/2026 às 09:15</span>
        </div>
      </div>

      {/* Cards Contas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {contasBancarias.map((conta) => (
          <div
            key={conta.id}
            className={`rounded-xl border ${conta.corBorder} ${conta.corBg} p-5 shadow-sm flex flex-col gap-3`}
          >
            {/* Header do card */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg bg-gradient-to-br ${conta.cor} p-2`}>
                  <CreditCard size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">{conta.sigla}</span>
              </div>
              <span className="text-xs text-ink-mid/50 dark:text-ink-mid/40 font-mono">{conta.numeroConta}</span>
            </div>

            {/* Nome do banco */}
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 leading-tight">{conta.banco}</p>
              <p className="text-[10px] text-ink-mid/50 dark:text-ink-mid/40 font-mono mt-0.5 truncate">{conta.iban}</p>
            </div>

            {/* Saldo */}
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 font-medium mb-0.5">Saldo Actual</p>
              <p className="text-xl font-bold text-ink dark:text-white">{formatAOA(conta.saldoActual)}</p>
            </div>

            {/* Último movimento */}
            <div className="border-t border-ink-ghost/60 dark:border-ink-ghost/20 pt-3">
              <p className="text-[10px] text-ink-mid/50 dark:text-ink-mid/40 uppercase tracking-wider mb-1">Último Movimento</p>
              <div className="flex items-start gap-1.5">
                {conta.ultimoMovimento.tipo === "entrada" ? (
                  <ArrowUpCircle size={13} className="text-live shrink-0 mt-0.5" />
                ) : (
                  <ArrowDownCircle size={13} className="text-danger shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-tight line-clamp-2">{conta.ultimoMovimento.descricao}</p>
                  <p className="text-[10px] text-ink-mid/50 dark:text-ink-mid/40 mt-0.5">{conta.ultimoMovimento.data}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold mt-2 ${conta.ultimoMovimento.tipo === "entrada" ? "text-live dark:text-emerald-400" : "text-danger dark:text-red-400"}`}>
                {conta.ultimoMovimento.tipo === "entrada" ? "+" : "-"}{formatAOA(Math.abs(conta.ultimoMovimento.valor))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela Movimentos Recentes */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Movimentos Recentes</h2>
          <span className="text-xs text-ink-mid/50 dark:text-ink-mid/40">Últimos 10 registos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface dark:bg-ink-ghost/20">
                <th className="text-left px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Data</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Banco</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Descrição</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Referência</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Tipo</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {movimentosRecentes.map((mov) => (
                <tr key={mov.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors">
                  <td className="px-6 py-4 text-ink-mid dark:text-gray-400 whitespace-nowrap">{mov.data}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-surface dark:bg-gray-700 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {mov.banco}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200 max-w-xs truncate">{mov.descricao}</td>
                  <td className="px-6 py-4 text-ink-mid/70 dark:text-ink-mid/60 font-mono text-xs">{mov.referencia}</td>
                  <td className="px-6 py-4">
                    {mov.tipo === "entrada" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-live-dim dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-live dark:text-emerald-400">
                        <ArrowUpCircle size={11} /> Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-semibold text-danger dark:text-red-400">
                        <ArrowDownCircle size={11} /> Saída
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${mov.tipo === "entrada" ? "text-live dark:text-emerald-400" : "text-danger dark:text-red-400"}`}>
                    {mov.tipo === "entrada" ? "+" : "-"}{formatAOA(mov.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
