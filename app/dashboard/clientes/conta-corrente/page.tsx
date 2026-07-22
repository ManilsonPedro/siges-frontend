"use client";

import { FileText, ArrowUpRight, ArrowDownLeft, Database, User, ChevronDown } from "lucide-react";
import { useState } from "react";

type Lancamento = {
  id: string;
  data: string;
  documento: string;
  descricao: string;
  debito: number;
  credito: number;
  saldo: number;
};

const EXTRATO_POR_CLIENTE: Record<
  string,
  { nome: string; lancamentos: Lancamento[] }
> = {
  C001: {
    nome: "Hospital Geral de Luanda",
    lancamentos: [
      {
        id: "L001",
        data: "2026-01-08",
        documento: "FT 2026/0042",
        descricao: "Venda Hipoclorito 5L × 120",
        debito: 720_000,
        credito: 0,
        saldo: 720_000,
      },
      {
        id: "L002",
        data: "2026-01-22",
        documento: "RC 2026/0038",
        descricao: "Recebimento cheque BFA",
        debito: 0,
        credito: 720_000,
        saldo: 0,
      },
      {
        id: "L003",
        data: "2026-02-10",
        documento: "FT 2026/0198",
        descricao: "Venda Hipoclorito 5L × 200",
        debito: 1_200_000,
        credito: 0,
        saldo: 1_200_000,
      },
      {
        id: "L004",
        data: "2026-02-28",
        documento: "RC 2026/0185",
        descricao: "Recebimento transferência BAI",
        debito: 0,
        credito: 800_000,
        saldo: 400_000,
      },
      {
        id: "L005",
        data: "2026-03-15",
        documento: "FT 2026/0412",
        descricao: "Venda Hipoclorito 20L × 30",
        debito: 900_000,
        credito: 0,
        saldo: 1_300_000,
      },
      {
        id: "L006",
        data: "2026-03-30",
        documento: "RC 2026/0310",
        descricao: "Recebimento transferência BFA",
        debito: 0,
        credito: 1_300_000,
        saldo: 0,
      },
      {
        id: "L007",
        data: "2026-04-20",
        documento: "FT 2026/0678",
        descricao: "Venda KITOKA 5L × 240",
        debito: 960_000,
        credito: 0,
        saldo: 960_000,
      },
      {
        id: "L008",
        data: "2026-05-05",
        documento: "NC 2026/0045",
        descricao: "Nota de crédito — devolução parcial",
        debito: 0,
        credito: 110_000,
        saldo: 850_000,
      },
      {
        id: "L009",
        data: "2026-05-18",
        documento: "RC 2026/0480",
        descricao: "Recebimento numerário",
        debito: 0,
        credito: 850_000,
        saldo: 0,
      },
      {
        id: "L010",
        data: "2026-06-10",
        documento: "FT 2026/1142",
        descricao: "Venda Hipoclorito 5L × 120",
        debito: 720_000,
        credito: 0,
        saldo: 720_000,
      },
    ],
  },
  C003: {
    nome: "Distribuidora Maianga Lda",
    lancamentos: [
      {
        id: "L101",
        data: "2026-01-05",
        documento: "FT 2026/0011",
        descricao: "Venda KITOKA 5L × 600",
        debito: 1_800_000,
        credito: 0,
        saldo: 1_800_000,
      },
      {
        id: "L102",
        data: "2026-01-20",
        documento: "RC 2026/0015",
        descricao: "Recebimento transferência Atlantico",
        debito: 0,
        credito: 1_800_000,
        saldo: 0,
      },
      {
        id: "L103",
        data: "2026-02-03",
        documento: "FT 2026/0155",
        descricao: "Venda KITOKA 1L × 2400",
        debito: 2_640_000,
        credito: 0,
        saldo: 2_640_000,
      },
      {
        id: "L104",
        data: "2026-02-17",
        documento: "RC 2026/0148",
        descricao: "Recebimento parcial BAI",
        debito: 0,
        credito: 1_500_000,
        saldo: 1_140_000,
      },
      {
        id: "L105",
        data: "2026-03-01",
        documento: "FT 2026/0320",
        descricao: "Venda KITOKA 5L × 900",
        debito: 2_700_000,
        credito: 0,
        saldo: 3_840_000,
      },
      {
        id: "L106",
        data: "2026-03-20",
        documento: "RC 2026/0290",
        descricao: "Recebimento cheque BPC",
        debito: 0,
        credito: 3_840_000,
        saldo: 0,
      },
      {
        id: "L107",
        data: "2026-04-08",
        documento: "FT 2026/0590",
        descricao: "Venda KITOKA 5L × 720",
        debito: 2_160_000,
        credito: 0,
        saldo: 2_160_000,
      },
      {
        id: "L108",
        data: "2026-04-25",
        documento: "RC 2026/0415",
        descricao: "Recebimento transferência BFA",
        debito: 0,
        credito: 2_160_000,
        saldo: 0,
      },
      {
        id: "L109",
        data: "2026-05-14",
        documento: "FT 2026/0880",
        descricao: "Venda KITOKA 1L × 3000",
        debito: 3_300_000,
        credito: 0,
        saldo: 3_300_000,
      },
      {
        id: "L110",
        data: "2026-06-14",
        documento: "FT 2026/1155",
        descricao: "Venda KITOKA 5L × 600",
        debito: 1_800_000,
        credito: 0,
        saldo: 5_100_000,
      },
    ],
  },
  C005: {
    nome: "Supermercado Nosso Super Viana",
    lancamentos: [
      {
        id: "L201",
        data: "2026-01-12",
        documento: "FT 2026/0068",
        descricao: "Venda KITOKA 1L × 1200",
        debito: 1_320_000,
        credito: 0,
        saldo: 1_320_000,
      },
      {
        id: "L202",
        data: "2026-02-01",
        documento: "RC 2026/0062",
        descricao: "Recebimento transferência Atlantico",
        debito: 0,
        credito: 1_320_000,
        saldo: 0,
      },
      {
        id: "L203",
        data: "2026-03-10",
        documento: "FT 2026/0380",
        descricao: "Venda KITOKA 1L × 1800",
        debito: 1_980_000,
        credito: 0,
        saldo: 1_980_000,
      },
      {
        id: "L204",
        data: "2026-04-02",
        documento: "RC 2026/0345",
        descricao: "Recebimento parcial BAI",
        debito: 0,
        credito: 1_000_000,
        saldo: 980_000,
      },
      {
        id: "L205",
        data: "2026-04-18",
        documento: "FT 2026/0720",
        descricao: "Venda KITOKA 1L × 2400 + 5L × 120",
        debito: 2_640_000,
        credito: 0,
        saldo: 3_620_000,
      },
      {
        id: "L206",
        data: "2026-05-05",
        documento: "RC 2026/0490",
        descricao: "Recebimento transferência BFA",
        debito: 0,
        credito: 2_000_000,
        saldo: 1_620_000,
      },
      {
        id: "L207",
        data: "2026-06-12",
        documento: "FT 2026/1148",
        descricao: "Venda KITOKA 1L × 1200",
        debito: 1_320_000,
        credito: 0,
        saldo: 2_940_000,
      },
    ],
  },
};

const CLIENTES_OPCOES = Object.entries(EXTRATO_POR_CLIENTE).map(([id, data]) => ({
  id,
  nome: data.nome,
}));

function formatAOA(valor: number) {
  if (valor === 0) return "—";
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
  const [clienteId, setClienteId] = useState("C001");

  const clienteData = EXTRATO_POR_CLIENTE[clienteId];
  const lancamentos = clienteData?.lancamentos ?? [];
  const saldoFinal = lancamentos.length > 0 ? lancamentos[lancamentos.length - 1].saldo : 0;
  const totalDebitos = lancamentos.reduce((acc, l) => acc + l.debito, 0);
  const totalCreditos = lancamentos.reduce((acc, l) => acc + l.credito, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Banner Primavera */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/40">
        <Database className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Dados sincronizados do Primavera ERP — apenas leitura
        </span>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink dark:text-white">Conta Corrente</h1>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Primavera
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Extrato de movimentos por cliente — Aquasan Angola · 2026
          </p>
        </div>
      </div>

      {/* Selector de cliente */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <User className="h-4 w-4" />
          Cliente:
        </label>
        <div className="relative">
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="appearance-none rounded-lg border border-ink-ghost/80 bg-panel py-2 pl-3 pr-10 text-sm font-medium text-ink shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-ink-ghost/20 dark:text-white"
          >
            {CLIENTES_OPCOES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-ink-mid/50" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-danger/10 p-2 dark:bg-red-900/30">
              <ArrowUpRight className="h-5 w-5 text-danger dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total Débitos</p>
              <p className="text-lg font-bold text-danger dark:text-red-400">
                {formatAOA(totalDebitos)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 bg-panel p-5 dark:border-ink-ghost/20 dark:bg-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <ArrowDownLeft className="h-5 w-5 text-live dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total Créditos</p>
              <p className="text-lg font-bold text-live dark:text-green-400">
                {formatAOA(totalCreditos)}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`rounded-xl border p-5 ${
            saldoFinal > 0
              ? "border-amber/30 bg-amber/8 dark:border-amber-700 dark:bg-amber-950/30"
              : "border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                saldoFinal > 0
                  ? "bg-amber/15 dark:bg-amber-900/30"
                  : "bg-surface dark:bg-gray-700"
              }`}
            >
              <FileText
                className={`h-5 w-5 ${
                  saldoFinal > 0
                    ? "text-amber dark:text-amber-400"
                    : "text-ink-mid/70 dark:text-ink-mid/60"
                }`}
              />
            </div>
            <div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Saldo Final</p>
              <p
                className={`text-lg font-bold ${
                  saldoFinal > 0
                    ? "text-amber dark:text-amber-400"
                    : "text-ink dark:text-white"
                }`}
              >
                {formatAOA(saldoFinal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela extrato */}
      <div className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel">
        <div className="border-b border-ink-ghost/40 bg-surface px-4 py-3 dark:border-gray-700 dark:bg-gray-700/40">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Extrato — {clienteData?.nome}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-ghost/40 bg-surface dark:border-gray-700 dark:bg-gray-700/50">
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">
                  Data
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">
                  Documento
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-ink-mid dark:text-gray-300">
                  Descrição
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  Débito
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  Crédito
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-mid dark:text-gray-300">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
              {lancamentos.map((l, idx) => {
                const isUltimo = idx === lancamentos.length - 1;
                return (
                  <tr
                    key={l.id}
                    className={`transition-colors ${
                      isUltimo
                        ? "bg-amber-50/70 dark:bg-amber-950/20"
                        : "hover:bg-surface dark:hover:bg-gray-700/30"
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-ink-mid dark:text-gray-300">
                      {formatDate(l.data)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-400">
                        <FileText className="h-3.5 w-3.5" />
                        {l.documento}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{l.descricao}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {l.debito > 0 ? (
                        <span className="font-medium text-danger dark:text-red-400">
                          {formatAOA(l.debito)}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {l.credito > 0 ? (
                        <span className="font-medium text-live dark:text-green-400">
                          {formatAOA(l.credito)}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          isUltimo
                            ? l.saldo > 0
                              ? "text-amber dark:text-amber-400"
                              : "text-ink dark:text-white"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {formatAOA(l.saldo)}
                      </span>
                      {isUltimo && (
                        <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-xs font-bold text-amber dark:bg-amber-900/50 dark:text-amber-300">
                          SALDO
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
