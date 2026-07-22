"use client";

import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  PlayCircle,
  PauseCircle,
  CalendarDays,
  FlaskConical,
  User,
  Package,
} from "lucide-react";

type EstadoOrdem =
  | "Pendente"
  | "Em Curso"
  | "Pausada"
  | "Concluída"
  | "Cancelada";

interface OrdemProducao {
  id: string;
  numero: string;
  data: string;
  dataPrevista: string;
  produto: string;
  categoria: string;
  quantidadePrevista: number;
  quantidadeProduzida: number;
  unidade: string;
  operador: string;
  linha: string;
  estado: EstadoOrdem;
  lote: string;
  observacoes: string;
}

const ORDENS: OrdemProducao[] = [
  {
    id: "OP-001",
    numero: "OP-2026-0061",
    data: "19/06/2026",
    dataPrevista: "19/06/2026",
    produto: "Hipoclorito de Sódio 20L",
    categoria: "Hipoclorito",
    quantidadePrevista: 500,
    quantidadeProduzida: 0,
    unidade: "L",
    operador: "António Moisés",
    linha: "Linha A – Hipoclorito",
    estado: "Em Curso",
    lote: "HIP-260619-601",
    observacoes: "Ordem em processamento. Mistura na fase 2.",
  },
  {
    id: "OP-002",
    numero: "OP-2026-0060",
    data: "18/06/2026",
    dataPrevista: "18/06/2026",
    produto: "Lixívia KITOKA 5L",
    categoria: "KITOKA",
    quantidadePrevista: 1200,
    quantidadeProduzida: 1200,
    unidade: "L",
    operador: "Beatriz Venâncio",
    linha: "Linha B – KITOKA",
    estado: "Concluída",
    lote: "KTK-260618-599",
    observacoes: "—",
  },
  {
    id: "OP-003",
    numero: "OP-2026-0059",
    data: "17/06/2026",
    dataPrevista: "17/06/2026",
    produto: "Hipoclorito de Sódio 5L",
    categoria: "Hipoclorito",
    quantidadePrevista: 800,
    quantidadeProduzida: 800,
    unidade: "L",
    operador: "Carlota Nzinga",
    linha: "Linha A – Hipoclorito",
    estado: "Concluída",
    lote: "HIP-260617-587",
    observacoes: "—",
  },
  {
    id: "OP-004",
    numero: "OP-2026-0058",
    data: "16/06/2026",
    dataPrevista: "16/06/2026",
    produto: "Lixívia KITOKA 1L",
    categoria: "KITOKA",
    quantidadePrevista: 3000,
    quantidadeProduzida: 1800,
    unidade: "L",
    operador: "Domingos Ferreira",
    linha: "Linha B – KITOKA",
    estado: "Pausada",
    lote: "KTK-260616-571",
    observacoes: "Parada técnica — substituição de bomba doseadora. Retoma prevista amanhã.",
  },
  {
    id: "OP-005",
    numero: "OP-2026-0057",
    data: "15/06/2026",
    dataPrevista: "15/06/2026",
    produto: "Hipoclorito de Sódio 20L",
    categoria: "Hipoclorito",
    quantidadePrevista: 600,
    quantidadeProduzida: 600,
    unidade: "L",
    operador: "Esperança Luvualu",
    linha: "Linha A – Hipoclorito",
    estado: "Concluída",
    lote: "HIP-260615-558",
    observacoes: "—",
  },
  {
    id: "OP-006",
    numero: "OP-2026-0056",
    data: "13/06/2026",
    dataPrevista: "14/06/2026",
    produto: "Lixívia KITOKA 20L",
    categoria: "KITOKA",
    quantidadePrevista: 400,
    quantidadeProduzida: 0,
    unidade: "L",
    operador: "António Moisés",
    linha: "Linha B – KITOKA",
    estado: "Cancelada",
    lote: "—",
    observacoes: "Cancelada por falta de matéria-prima (soda cáustica). Reabastecimento pendente.",
  },
  {
    id: "OP-007",
    numero: "OP-2026-0055",
    data: "12/06/2026",
    dataPrevista: "12/06/2026",
    produto: "Hipoclorito de Sódio 5L",
    categoria: "Hipoclorito",
    quantidadePrevista: 1000,
    quantidadeProduzida: 1000,
    unidade: "L",
    operador: "Carlota Nzinga",
    linha: "Linha A – Hipoclorito",
    estado: "Concluída",
    lote: "HIP-260612-541",
    observacoes: "—",
  },
  {
    id: "OP-008",
    numero: "OP-2026-0054",
    data: "11/06/2026",
    dataPrevista: "11/06/2026",
    produto: "Lixívia KITOKA 5L",
    categoria: "KITOKA",
    quantidadePrevista: 900,
    quantidadeProduzida: 900,
    unidade: "L",
    operador: "Domingos Ferreira",
    linha: "Linha B – KITOKA",
    estado: "Concluída",
    lote: "KTK-260611-528",
    observacoes: "—",
  },
  {
    id: "OP-009",
    numero: "OP-2026-0053",
    data: "10/06/2026",
    dataPrevista: "10/06/2026",
    produto: "Hipoclorito de Sódio 20L",
    categoria: "Hipoclorito",
    quantidadePrevista: 700,
    quantidadeProduzida: 700,
    unidade: "L",
    operador: "Esperança Luvualu",
    linha: "Linha A – Hipoclorito",
    estado: "Concluída",
    lote: "HIP-260610-512",
    observacoes: "—",
  },
  {
    id: "OP-010",
    numero: "OP-2026-0052",
    data: "20/06/2026",
    dataPrevista: "20/06/2026",
    produto: "Lixívia KITOKA 1L",
    categoria: "KITOKA",
    quantidadePrevista: 5000,
    quantidadeProduzida: 0,
    unidade: "L",
    operador: "Beatriz Venâncio",
    linha: "Linha B – KITOKA",
    estado: "Pendente",
    lote: "—",
    observacoes: "Aguarda libertação de linha e confirmação de matéria-prima.",
  },
];

const ESTADO_CONFIG: Record<
  EstadoOrdem,
  { label: string; color: string; icon: React.ReactNode }
> = {
  Pendente: {
    label: "Pendente",
    color:
      "bg-surface dark:bg-ink-ghost/20 text-ink-mid dark:text-ink-mid/50",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  "Em Curso": {
    label: "Em Curso",
    color:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    icon: <PlayCircle className="h-3.5 w-3.5" />,
  },
  Pausada: {
    label: "Pausada",
    color:
      "bg-amber/15 dark:bg-amber-900/30 text-amber dark:text-amber-300",
    icon: <PauseCircle className="h-3.5 w-3.5" />,
  },
  Concluída: {
    label: "Concluída",
    color:
      "bg-live-dim dark:bg-emerald-900/30 text-live dark:text-emerald-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  Cancelada: {
    label: "Cancelada",
    color:
      "bg-danger/10 dark:bg-red-900/30 text-danger dark:text-red-300",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

export default function OrdensProducaoPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoOrdem | "Todos">(
    "Todos"
  );
  const [filtroProduto, setFiltroProduto] = useState<string>("Todos");
  const [busca, setBusca] = useState("");

  const totalOrdens = ORDENS.length;
  const emCurso = ORDENS.filter((o) => o.estado === "Em Curso").length;
  const concluidas = ORDENS.filter((o) => o.estado === "Concluída").length;
  const pendentes = ORDENS.filter(
    (o) => o.estado === "Pendente" || o.estado === "Pausada"
  ).length;
  const litrosTotais = ORDENS.filter((o) => o.estado === "Concluída").reduce(
    (acc, o) => acc + o.quantidadeProduzida,
    0
  );

  const produtosUnicos = Array.from(
    new Set(ORDENS.map((o) => o.produto))
  ).sort();

  const listagem = ORDENS.filter((o) => {
    const matchEstado =
      filtroEstado === "Todos" || o.estado === filtroEstado;
    const matchProduto =
      filtroProduto === "Todos" || o.produto === filtroProduto;
    const matchBusca =
      busca === "" ||
      o.numero.toLowerCase().includes(busca.toLowerCase()) ||
      o.produto.toLowerCase().includes(busca.toLowerCase()) ||
      o.operador.toLowerCase().includes(busca.toLowerCase()) ||
      o.lote.toLowerCase().includes(busca.toLowerCase());
    return matchEstado && matchProduto && matchBusca;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-live" />
            Todas as Ordens de Produção
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Lista completa de ordens de produção com filtros por estado, produto e período — Aquasan Angola / KITOKA.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
            Módulo em desenvolvimento
          </span>
          <button className="inline-flex items-center gap-2 rounded-lg bg-live hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
            <Plus className="h-4 w-4" />
            Nova Ordem
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — dados de demonstração. Integração com Primavera ERP em curso.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 text-ink-mid/50" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total Ordens</p>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">{totalOrdens}</p>
        </div>
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <PlayCircle className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-blue-600 dark:text-blue-400">Em Curso</p>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{emCurso}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <p className="text-xs text-live dark:text-emerald-400">Concluídas</p>
          </div>
          <p className="text-2xl font-bold text-live dark:text-emerald-300">{concluidas}</p>
        </div>
        <div className="rounded-xl border border-amber/30 dark:border-amber-800 bg-amber/8 dark:bg-amber-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-amber" />
            <p className="text-xs text-amber dark:text-amber-400">Litros Produzidos</p>
          </div>
          <p className="text-2xl font-bold text-amber dark:text-amber-300">
            {litrosTotais.toLocaleString("pt-AO")}
            <span className="text-sm font-normal ml-1">L</span>
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
          <input
            type="text"
            placeholder="Pesquisar ordem, produto, operador ou lote..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value as EstadoOrdem | "Todos")
            }
            className="pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
          >
            <option value="Todos">Todos os estados</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Curso">Em Curso</option>
            <option value="Pausada">Pausada</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
        <div className="relative">
          <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroProduto}
            onChange={(e) => setFiltroProduto(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
          >
            <option value="Todos">Todos os produtos</option>
            {produtosUnicos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                {[
                  "Ordem",
                  "Data",
                  "Prevista",
                  "Produto",
                  "Operador",
                  "Linha",
                  "Qtd. Prev.",
                  "Qtd. Prod.",
                  "Progresso",
                  "Lote",
                  "Estado",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {listagem.map((ordem) => {
                const ec = ESTADO_CONFIG[ordem.estado];
                const progresso =
                  ordem.quantidadePrevista > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (ordem.quantidadeProduzida /
                            ordem.quantidadePrevista) *
                            100
                        )
                      )
                    : 0;
                const progressoColor =
                  progresso === 100
                    ? "bg-live"
                    : progresso > 50
                    ? "bg-blue-500"
                    : progresso > 0
                    ? "bg-amber"
                    : "bg-ink-ghost/30 dark:bg-gray-600";

                return (
                  <tr
                    key={ordem.id}
                    className="hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold text-live dark:text-emerald-400">
                      {ordem.numero}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-ink-mid/60">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-ink-mid/50" />
                        {ordem.data}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid/70 dark:text-gray-500 text-xs">
                      {ordem.dataPrevista}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-medium">
                        <FlaskConical className="h-3.5 w-3.5 text-live shrink-0" />
                        {ordem.produto}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-ink-mid/60">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-ink-mid/50" />
                        {ordem.operador}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-ink-mid/70 dark:text-ink-mid/60">
                      {ordem.linha}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                      {ordem.quantidadePrevista.toLocaleString("pt-AO")}{" "}
                      <span className="text-xs text-ink-mid/50">{ordem.unidade}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                      {ordem.quantidadeProduzida.toLocaleString("pt-AO")}{" "}
                      <span className="text-xs text-ink-mid/50">{ordem.unidade}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-ink-ghost/30 dark:bg-gray-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progressoColor}`}
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-mid/70 dark:text-ink-mid/60 w-8 text-right">
                          {progresso}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-ink-mid dark:text-ink-mid/60">
                      {ordem.lote}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${ec.color}`}
                      >
                        {ec.icon}
                        {ec.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {listagem.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-sm text-ink-mid/50 dark:text-ink-mid/40"
                  >
                    Nenhuma ordem encontrada com os filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer da tabela */}
        <div className="px-4 py-3 border-t border-ink-ghost/40 dark:border-ink-ghost/15 bg-surface dark:bg-gray-800/30 flex items-center justify-between text-xs text-ink-mid/70 dark:text-ink-mid/60">
          <span>
            {listagem.length} de {totalOrdens} ordens
          </span>
          <span className="hidden sm:block">
            Pendentes/Pausadas:{" "}
            <strong className="text-amber dark:text-amber-400">
              {pendentes}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
