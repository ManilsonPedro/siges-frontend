"use client";

import { useState } from "react";
import {
  FlaskConical,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  BarChart3,
  Layers,
  Droplets,
  User,
} from "lucide-react";

type Estado = "Concluído" | "Em Curso" | "Pendente" | "Atrasado";

interface OrdemProducao {
  id: string;
  data: string;
  turno: string;
  produto: string;
  lote: string;
  quantidadePlaneada: number;
  quantidadeRealizada: number;
  unidade: string;
  operador: string;
  linha: string;
  estado: Estado;
  observacoes: string;
}

const ORDENS: OrdemProducao[] = [
  {
    id: "OP-2026-0641",
    data: "19/06/2026",
    turno: "Manhã (06h–14h)",
    produto: "Hipoclorito de Sódio 20L",
    lote: "HIP-260619-541",
    quantidadePlaneada: 3000,
    quantidadeRealizada: 3000,
    unidade: "L",
    operador: "António Moisés",
    linha: "Linha A",
    estado: "Concluído",
    observacoes: "Produção sem intercorrências.",
  },
  {
    id: "OP-2026-0642",
    data: "19/06/2026",
    turno: "Manhã (06h–14h)",
    produto: "Lixívia KITOKA 5L",
    lote: "KTK-260619-210",
    quantidadePlaneada: 1500,
    quantidadeRealizada: 1500,
    unidade: "L",
    operador: "Carlota Nzinga",
    linha: "Linha B",
    estado: "Concluído",
    observacoes: "—",
  },
  {
    id: "OP-2026-0643",
    data: "19/06/2026",
    turno: "Tarde (14h–22h)",
    produto: "Hipoclorito de Sódio 5L",
    lote: "HIP-260619-542",
    quantidadePlaneada: 2000,
    quantidadeRealizada: 1420,
    unidade: "L",
    operador: "Domingos Ferreira",
    linha: "Linha A",
    estado: "Em Curso",
    observacoes: "Produção em curso — previsão de conclusão às 19h30.",
  },
  {
    id: "OP-2026-0644",
    data: "19/06/2026",
    turno: "Tarde (14h–22h)",
    produto: "Lixívia KITOKA 1L",
    lote: "KTK-260619-211",
    quantidadePlaneada: 800,
    quantidadeRealizada: 0,
    unidade: "L",
    operador: "Esperança Luvualu",
    linha: "Linha C",
    estado: "Pendente",
    observacoes: "Aguarda conclusão de setup de linha.",
  },
  {
    id: "OP-2026-0645",
    data: "19/06/2026",
    turno: "Noite (22h–06h)",
    produto: "Hipoclorito de Sódio 20L",
    lote: "HIP-260619-543",
    quantidadePlaneada: 2500,
    quantidadeRealizada: 0,
    unidade: "L",
    operador: "Manuel Lukwesa",
    linha: "Linha A",
    estado: "Pendente",
    observacoes: "Planeado para turno nocturno.",
  },
  {
    id: "OP-2026-0639",
    data: "18/06/2026",
    turno: "Manhã (06h–14h)",
    produto: "Lixívia KITOKA 20L",
    lote: "KTK-260618-208",
    quantidadePlaneada: 1200,
    quantidadeRealizada: 900,
    unidade: "L",
    operador: "Carlota Nzinga",
    linha: "Linha B",
    estado: "Atrasado",
    observacoes: "Paragem técnica de 2h por falha na bomba de enchimento. NC aberta.",
  },
  {
    id: "OP-2026-0638",
    data: "18/06/2026",
    turno: "Tarde (14h–22h)",
    produto: "Hipoclorito de Sódio 5L",
    lote: "HIP-260618-539",
    quantidadePlaneada: 1800,
    quantidadeRealizada: 1800,
    unidade: "L",
    operador: "António Moisés",
    linha: "Linha A",
    estado: "Concluído",
    observacoes: "—",
  },
  {
    id: "OP-2026-0637",
    data: "17/06/2026",
    turno: "Manhã (06h–14h)",
    produto: "Lixívia KITOKA 5L",
    lote: "KTK-260617-205",
    quantidadePlaneada: 2000,
    quantidadeRealizada: 2000,
    unidade: "L",
    operador: "Domingos Ferreira",
    linha: "Linha B",
    estado: "Concluído",
    observacoes: "—",
  },
];

const ESTADO_CONFIG: Record<Estado, { label: string; color: string; icon: React.ReactNode }> = {
  Concluído: {
    label: "Concluído",
    color: "bg-live-dim dark:bg-emerald-900/30 text-live dark:text-emerald-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  "Em Curso": {
    label: "Em Curso",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  Pendente: {
    label: "Pendente",
    color: "bg-surface dark:bg-ink-ghost/20 text-ink-mid dark:text-gray-400",
    icon: <Layers className="h-3.5 w-3.5" />,
  },
  Atrasado: {
    label: "Atrasado",
    color: "bg-danger/10 dark:bg-red-900/30 text-danger dark:text-red-300",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

function calcularEficiencia(realizada: number, planeada: number): string {
  if (planeada === 0) return "—";
  return ((realizada / planeada) * 100).toFixed(0) + "%";
}

export default function ProducaoDiariaPage() {
  const [filtroEstado, setFiltroEstado] = useState<Estado | "Todos">("Todos");
  const [busca, setBusca] = useState("");
  const [dataFiltro, setDataFiltro] = useState("2026-06-19");

  const totalPlaneado = ORDENS.reduce((s, o) => s + o.quantidadePlaneada, 0);
  const totalRealizado = ORDENS.reduce((s, o) => s + o.quantidadeRealizada, 0);
  const concluidas = ORDENS.filter((o) => o.estado === "Concluído").length;
  const atrasadas = ORDENS.filter((o) => o.estado === "Atrasado").length;
  const emCurso = ORDENS.filter((o) => o.estado === "Em Curso").length;

  const listagem = ORDENS.filter((o) => {
    const matchEstado = filtroEstado === "Todos" || o.estado === filtroEstado;
    const matchBusca =
      busca === "" ||
      o.produto.toLowerCase().includes(busca.toLowerCase()) ||
      o.lote.toLowerCase().includes(busca.toLowerCase()) ||
      o.operador.toLowerCase().includes(busca.toLowerCase()) ||
      o.id.toLowerCase().includes(busca.toLowerCase());
    return matchEstado && matchBusca;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-live" />
            Produção Diária
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-gray-400">
            Planeamento e acompanhamento da produção diária de hipoclorito e lixívia KITOKA — Aquasan Angola.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
            Módulo em desenvolvimento
          </span>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-live hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
            <Plus className="h-4 w-4" />
            Nova Ordem
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — dados de demonstração. Integração com o ERP Primavera prevista para Q3 2026.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-ink-mid/50" />
            <p className="text-xs text-ink-mid/70 dark:text-gray-400">Total Ordens</p>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">{ORDENS.length}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-emerald-50 dark:bg-emerald-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-live" />
            <p className="text-xs text-ink-mid/70 dark:text-gray-400">Concluídas</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{concluidas}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-ink-mid/70 dark:text-gray-400">Em Curso</p>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{emCurso}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-danger/8 dark:bg-red-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <p className="text-xs text-ink-mid/70 dark:text-gray-400">Atrasadas</p>
          </div>
          <p className="text-2xl font-bold text-danger dark:text-red-300">{atrasadas}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="h-4 w-4 text-cyan-500" />
            <p className="text-xs text-ink-mid/70 dark:text-gray-400">Eficiência Geral</p>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">
            {calcularEficiencia(totalRealizado, totalPlaneado)}
          </p>
          <p className="text-xs text-ink-mid/50 dark:text-gray-500 mt-0.5">
            {totalRealizado.toLocaleString("pt-AO")} / {totalPlaneado.toLocaleString("pt-AO")} L
          </p>
        </div>
      </div>

      {/* Resumo de produção por produto */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
          <BarChart3 className="h-5 w-5 text-live" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Resumo por Produto — Hoje</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                {["Produto", "Planeado (L)", "Realizado (L)", "Eficiência", "Barra"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {[
                { produto: "Hipoclorito de Sódio 20L", planeado: 5500, realizado: 4920 },
                { produto: "Hipoclorito de Sódio 5L", planeado: 3800, realizado: 3220 },
                { produto: "Lixívia KITOKA 20L", planeado: 1200, realizado: 900 },
                { produto: "Lixívia KITOKA 5L", planeado: 3500, realizado: 3500 },
                { produto: "Lixívia KITOKA 1L", planeado: 800, realizado: 0 },
              ].map((row) => {
                const pct = row.planeado > 0 ? Math.round((row.realizado / row.planeado) * 100) : 0;
                const barColor =
                  pct >= 95
                    ? "bg-live"
                    : pct >= 70
                    ? "bg-blue-500"
                    : pct >= 40
                    ? "bg-amber"
                    : "bg-danger";
                return (
                  <tr key={row.produto} className="hover:bg-surface dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {row.produto}
                    </td>
                    <td className="px-4 py-3 text-ink-mid dark:text-gray-400 whitespace-nowrap text-right">
                      {row.planeado.toLocaleString("pt-AO")}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap text-right font-semibold">
                      {row.realizado.toLocaleString("pt-AO")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span
                        className={`text-sm font-semibold ${
                          pct >= 95
                            ? "text-live dark:text-emerald-400"
                            : pct >= 70
                            ? "text-blue-600 dark:text-blue-400"
                            : pct >= 40
                            ? "text-amber dark:text-amber-400"
                            : "text-danger dark:text-red-400"
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 w-40">
                      <div className="w-full bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded-full h-2">
                        <div
                          className={`${barColor} h-2 rounded-full transition-all`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
          <input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
          <input
            type="text"
            placeholder="Pesquisar por ordem, produto, lote ou operador..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as Estado | "Todos")}
            className="pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
          >
            <option value="Todos">Todos os estados</option>
            <option value="Concluído">Concluído</option>
            <option value="Em Curso">Em Curso</option>
            <option value="Pendente">Pendente</option>
            <option value="Atrasado">Atrasado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Ordens de Produção */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
          <Layers className="h-5 w-5 text-live" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Ordens de Produção</h2>
          <span className="ml-auto text-xs text-ink-mid/50 dark:text-gray-500">
            {listagem.length} {listagem.length === 1 ? "ordem" : "ordens"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                {[
                  "Ordem",
                  "Data",
                  "Turno",
                  "Produto",
                  "Lote",
                  "Planeado",
                  "Realizado",
                  "Efic.",
                  "Linha",
                  "Operador",
                  "Estado",
                  "Observações",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {listagem.map((op) => {
                const ec = ESTADO_CONFIG[op.estado];
                const pct =
                  op.quantidadePlaneada > 0
                    ? Math.round((op.quantidadeRealizada / op.quantidadePlaneada) * 100)
                    : 0;
                return (
                  <tr
                    key={op.id}
                    className="hover:bg-surface dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {op.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">
                      {op.data}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-ink-mid/70 dark:text-gray-400">
                      {op.turno}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                      {op.produto}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-ink-mid dark:text-gray-400">
                      {op.lote}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-ink-mid dark:text-gray-400">
                      {op.quantidadePlaneada.toLocaleString("pt-AO")} {op.unidade}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-800 dark:text-gray-200">
                      {op.quantidadeRealizada.toLocaleString("pt-AO")} {op.unidade}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span
                        className={`text-xs font-semibold ${
                          pct >= 95
                            ? "text-live dark:text-emerald-400"
                            : pct >= 70
                            ? "text-blue-600 dark:text-blue-400"
                            : pct > 0
                            ? "text-amber dark:text-amber-400"
                            : "text-ink-mid/50"
                        }`}
                      >
                        {op.quantidadePlaneada > 0 ? `${pct}%` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">
                      {op.linha}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-ink-mid dark:text-gray-400">
                        <User className="h-3 w-3" />
                        {op.operador}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${ec.color}`}
                      >
                        {ec.icon}
                        {ec.label}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-ink-mid/70 dark:text-gray-400 max-w-xs truncate"
                      title={op.observacoes}
                    >
                      {op.observacoes}
                    </td>
                  </tr>
                );
              })}
              {listagem.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-10 text-center text-sm text-ink-mid/50 dark:text-gray-500"
                  >
                    Nenhuma ordem de produção encontrada com os filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé informativo */}
      <div className="rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-gray-800/40 px-5 py-4 text-xs text-ink-mid/70 dark:text-gray-400 flex flex-wrap gap-4 justify-between">
        <span>
          Volume total planeado:{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            {totalPlaneado.toLocaleString("pt-AO")} L
          </strong>
        </span>
        <span>
          Volume total realizado:{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            {totalRealizado.toLocaleString("pt-AO")} L
          </strong>
        </span>
        <span>
          Eficiência global:{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            {calcularEficiencia(totalRealizado, totalPlaneado)}
          </strong>
        </span>
        <span>Actualizado: 19/06/2026 às 17h45 (simulado)</span>
      </div>
    </div>
  );
}
