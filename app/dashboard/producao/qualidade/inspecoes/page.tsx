"use client";

import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { useState } from "react";

type Resultado = "Aprovado" | "Reprovado" | "Condicional";

interface Inspecao {
  id: string;
  data: string;
  lote: string;
  produto: string;
  inspector: string;
  ph: string;
  concentracao: string;
  cor: string;
  odor: string;
  resultado: Resultado;
  observacoes: string;
}

const INSPECOES: Inspecao[] = [
  {
    id: "INS-001",
    data: "18/06/2026",
    lote: "HIP-260618-521",
    produto: "Hipoclorito de Sódio 20L",
    inspector: "Carlota Nzinga",
    ph: "12.9",
    concentracao: "5.3%",
    cor: "Amarelo claro",
    odor: "Característico",
    resultado: "Aprovado",
    observacoes: "Parâmetros dentro dos limites especificados.",
  },
  {
    id: "INS-002",
    data: "17/06/2026",
    lote: "KTK-260617-102",
    produto: "Lixívia Multiuso 5L",
    inspector: "Domingos Ferreira",
    ph: "12.4",
    concentracao: "3.9%",
    cor: "Azul translúcido",
    odor: "Característico",
    resultado: "Aprovado",
    observacoes: "—",
  },
  {
    id: "INS-003",
    data: "16/06/2026",
    lote: "HIP-260616-488",
    produto: "Hipoclorito de Sódio 5L",
    inspector: "Esperança Luvualu",
    ph: "13.2",
    concentracao: "4.1%",
    cor: "Amarelo escuro",
    odor: "Forte",
    resultado: "Condicional",
    observacoes: "pH ligeiramente elevado. Recolhida amostra para análise laboratorial.",
  },
  {
    id: "INS-004",
    data: "15/06/2026",
    lote: "KTK-260615-088",
    produto: "Lixívia Multiuso 1L",
    inspector: "Carlota Nzinga",
    ph: "12.5",
    concentracao: "3.8%",
    cor: "Azul translúcido",
    odor: "Característico",
    resultado: "Aprovado",
    observacoes: "—",
  },
  {
    id: "INS-005",
    data: "13/06/2026",
    lote: "HIP-260613-441",
    produto: "Hipoclorito de Sódio 20L",
    inspector: "Domingos Ferreira",
    ph: "11.8",
    concentracao: "2.1%",
    cor: "Incolor",
    odor: "Fraco",
    resultado: "Reprovado",
    observacoes: "Concentração abaixo do mínimo (3%). Lote bloqueado — aguarda decisão. NC aberta.",
  },
  {
    id: "INS-006",
    data: "12/06/2026",
    lote: "KTK-260612-077",
    produto: "Lixívia Multiuso 20L",
    inspector: "Esperança Luvualu",
    ph: "12.7",
    concentracao: "4.0%",
    cor: "Azul translúcido",
    odor: "Característico",
    resultado: "Aprovado",
    observacoes: "—",
  },
  {
    id: "INS-007",
    data: "10/06/2026",
    lote: "HIP-260610-412",
    produto: "Hipoclorito de Sódio 20L",
    inspector: "Carlota Nzinga",
    ph: "12.8",
    concentracao: "5.2%",
    cor: "Amarelo claro",
    odor: "Característico",
    resultado: "Aprovado",
    observacoes: "—",
  },
];

const RESULTADO_CONFIG: Record<Resultado, { label: string; color: string; icon: React.ReactNode }> = {
  Aprovado: {
    label: "Aprovado",
    color: "bg-live-dim dark:bg-emerald-900/30 text-live dark:text-emerald-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  Reprovado: {
    label: "Reprovado",
    color: "bg-danger/10 dark:bg-red-900/30 text-danger dark:text-red-300",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  Condicional: {
    label: "Condicional",
    color: "bg-amber/15 dark:bg-amber-900/30 text-amber dark:text-amber-300",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

export default function InspecoesQualidadePage() {
  const [filtroResultado, setFiltroResultado] = useState<Resultado | "Todos">("Todos");
  const [busca, setBusca] = useState("");

  const aprovados = INSPECOES.filter((i) => i.resultado === "Aprovado").length;
  const reprovados = INSPECOES.filter((i) => i.resultado === "Reprovado").length;
  const condicionais = INSPECOES.filter((i) => i.resultado === "Condicional").length;

  const listagem = INSPECOES.filter((i) => {
    const matchResultado = filtroResultado === "Todos" || i.resultado === filtroResultado;
    const matchBusca =
      busca === "" ||
      i.lote.toLowerCase().includes(busca.toLowerCase()) ||
      i.produto.toLowerCase().includes(busca.toLowerCase()) ||
      i.inspector.toLowerCase().includes(busca.toLowerCase());
    return matchResultado && matchBusca;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-live" />
            Inspeções de Qualidade
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Registo dos controlos de qualidade realizados sobre os lotes produzidos pela empresa.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Módulo em desenvolvimento
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — dados de demonstração. Integração com LIMS prevista.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Inspeções", value: INSPECOES.length, color: "text-ink dark:text-gray-100", bg: "bg-panel dark:bg-panel" },
          { label: "Aprovados", value: aprovados, color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Condicionais", value: condicionais, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber/8 dark:bg-amber-900/20" },
          { label: "Reprovados", value: reprovados, color: "text-red-700 dark:text-red-300", bg: "bg-danger/8 dark:bg-red-900/20" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 ${kpi.bg} p-4 shadow-sm`}>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
          <input
            type="text"
            placeholder="Pesquisar lote, produto ou inspector..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-panel text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroResultado}
            onChange={(e) => setFiltroResultado(e.target.value as Resultado | "Todos")}
            className="pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-panel text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
          >
            <option value="Todos">Todos os resultados</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Condicional">Condicional</option>
            <option value="Reprovado">Reprovado</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                {["Data", "Lote", "Produto", "Inspector", "pH", "Concentração", "Cor", "Odor", "Resultado", "Observações"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {listagem.map((ins) => {
                const rc = RESULTADO_CONFIG[ins.resultado];
                return (
                  <tr key={ins.id} className="hover:bg-surface dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">{ins.data}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-700 dark:text-gray-300">{ins.lote}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-200 font-medium">{ins.produto}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">{ins.inspector}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-gray-700 dark:text-gray-300">{ins.ph}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-gray-700 dark:text-gray-300">{ins.concentracao}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">{ins.cor}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">{ins.odor}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${rc.color}`}>
                        {rc.icon}
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-mid/70 dark:text-ink-mid/60 max-w-xs truncate" title={ins.observacoes}>
                      {ins.observacoes}
                    </td>
                  </tr>
                );
              })}
              {listagem.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-ink-mid/50 dark:text-ink-mid/40">
                    Nenhuma inspeção encontrada com os filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
