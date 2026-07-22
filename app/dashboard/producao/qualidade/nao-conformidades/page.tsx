"use client";

import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { useState } from "react";

type TipoNC = "Produto" | "Processo" | "Equipamento";
type EstadoNC = "Aberta" | "Em análise" | "Corrigida" | "Fechada";

interface NaoConformidade {
  id: string;
  data: string;
  lote: string;
  tipo: TipoNC;
  descricao: string;
  accaoCorrectiva: string;
  responsavel: string;
  prazo: string;
  estado: EstadoNC;
}

const NAO_CONFORMIDADES: NaoConformidade[] = [
  {
    id: "NC-2026-001",
    data: "13/06/2026",
    lote: "HIP-260613-441",
    tipo: "Produto",
    descricao: "Concentração de NaClO abaixo do mínimo especificado (2.1% vs. mínimo 3.0%). Lote bloqueado no armazém central.",
    accaoCorrectiva: "Reprocessamento do lote com adição de hipoclorito concentrado. Revisão do processo de dosagem.",
    responsavel: "António Moisés",
    prazo: "20/06/2026",
    estado: "Em análise",
  },
  {
    id: "NC-2026-002",
    data: "10/06/2026",
    lote: "HIP-260610-412",
    tipo: "Processo",
    descricao: "Temperatura de reacção excedeu o limite máximo em 4°C durante 12 minutos. Sensor de temperatura com desvio.",
    accaoCorrectiva: "Calibração do sensor de temperatura do reactor R-02. Verificação do sistema de arrefecimento.",
    responsavel: "Esperança Luvualu",
    prazo: "18/06/2026",
    estado: "Corrigida",
  },
  {
    id: "NC-2026-003",
    data: "05/06/2026",
    lote: "KTK-260605-061",
    tipo: "Equipamento",
    descricao: "Falha na linha de enchimento — cabeçal n.º 3 com derrame. Perda estimada de 80 L de produto acabado.",
    accaoCorrectiva: "Substituição da vedação do cabeçal n.º 3. Manutenção preventiva de todos os cabeçais programada.",
    responsavel: "Domingos Ferreira",
    prazo: "12/06/2026",
    estado: "Fechada",
  },
  {
    id: "NC-2026-004",
    data: "28/05/2026",
    lote: "HIP-260528-388",
    tipo: "Produto",
    descricao: "Coloração anormal (amarelo escuro) detectada no produto final. Possível contaminação com óxidos metálicos.",
    accaoCorrectiva: "Análise das matérias-primas do fornecedor Quimicão Angola. Rejeição do lote afectado.",
    responsavel: "Carlota Nzinga",
    prazo: "07/06/2026",
    estado: "Fechada",
  },
  {
    id: "NC-2026-005",
    data: "22/05/2026",
    lote: "KTK-260522-044",
    tipo: "Processo",
    descricao: "Registo manual de pH feito com 2 horas de atraso. Procedimento de controlo não cumprido pelo operador.",
    accaoCorrectiva: "Formação do operador. Instalação de sistema de alerta automático para atrasos no registo.",
    responsavel: "Beatriz Venâncio",
    prazo: "30/05/2026",
    estado: "Fechada",
  },
  {
    id: "NC-2026-006",
    data: "18/06/2026",
    lote: "KTK-260618-115",
    tipo: "Equipamento",
    descricao: "Agitador do tanque T-05 com vibração anormal. Risco de contaminação por partículas metálicas.",
    accaoCorrectiva: "Paragem imediata do tanque T-05. Inspeção mecânica programada. Desvio para tanque T-06.",
    responsavel: "Domingos Ferreira",
    prazo: "22/06/2026",
    estado: "Aberta",
  },
];

const TIPO_COLORS: Record<TipoNC, string> = {
  Produto: "bg-danger/10 dark:bg-red-900/30 text-danger dark:text-red-300",
  Processo: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Equipamento: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
};

const ESTADO_CONFIG: Record<EstadoNC, { color: string; icon: React.ReactNode }> = {
  "Aberta": {
    color: "bg-danger/10 dark:bg-red-900/30 text-danger dark:text-red-300",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  "Em análise": {
    color: "bg-amber/15 dark:bg-amber-900/30 text-amber dark:text-amber-300",
    icon: <Loader2 className="h-3.5 w-3.5" />,
  },
  "Corrigida": {
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  "Fechada": {
    color: "bg-live-dim dark:bg-emerald-900/30 text-live dark:text-emerald-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
};

export default function NaoConformidadesPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoNC | "Todos">("Todos");
  const [filtroTipo, setFiltroTipo] = useState<TipoNC | "Todos">("Todos");
  const [busca, setBusca] = useState("");

  const abertas = NAO_CONFORMIDADES.filter((n) => n.estado === "Aberta").length;
  const emAnalise = NAO_CONFORMIDADES.filter((n) => n.estado === "Em análise").length;
  const corrigidas = NAO_CONFORMIDADES.filter((n) => n.estado === "Corrigida").length;
  const fechadas = NAO_CONFORMIDADES.filter((n) => n.estado === "Fechada").length;

  const lista = NAO_CONFORMIDADES.filter((nc) => {
    const matchEstado = filtroEstado === "Todos" || nc.estado === filtroEstado;
    const matchTipo = filtroTipo === "Todos" || nc.tipo === filtroTipo;
    const matchBusca =
      busca === "" ||
      nc.id.toLowerCase().includes(busca.toLowerCase()) ||
      nc.lote.toLowerCase().includes(busca.toLowerCase()) ||
      nc.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      nc.responsavel.toLowerCase().includes(busca.toLowerCase());
    return matchEstado && matchTipo && matchBusca;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-danger" />
            Não Conformidades
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Gestão de ocorrências de não conformidade nos produtos, processos e equipamentos da empresa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
            Módulo em desenvolvimento
          </span>
          <button className="flex items-center gap-1.5 rounded-lg bg-danger hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors">
            <Plus className="h-4 w-4" />
            Nova NC
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — dados de demonstração.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Abertas", value: abertas, color: "text-red-700 dark:text-red-300", bg: "bg-danger/8 dark:bg-red-900/20 border-danger/30 dark:border-red-800" },
          { label: "Em Análise", value: emAnalise, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber/8 dark:bg-amber-900/20 border-amber/30 dark:border-amber-800" },
          { label: "Corrigidas", value: corrigidas, color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
          { label: "Fechadas", value: fechadas, color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border ${kpi.bg} p-4 shadow-sm`}>
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
            placeholder="Pesquisar NC, lote ou responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoNC | "Todos")}
            className="pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
          >
            <option value="Todos">Todos os estados</option>
            <option value="Aberta">Aberta</option>
            <option value="Em análise">Em análise</option>
            <option value="Corrigida">Corrigida</option>
            <option value="Fechada">Fechada</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoNC | "Todos")}
            className="px-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
          >
            <option value="Todos">Todos os tipos</option>
            <option value="Produto">Produto</option>
            <option value="Processo">Processo</option>
            <option value="Equipamento">Equipamento</option>
          </select>
        </div>
      </div>

      {/* Cards de NC */}
      <div className="space-y-4">
        {lista.map((nc) => {
          const estadoConf = ESTADO_CONFIG[nc.estado];
          const prazoDate = new Date(nc.prazo.split("/").reverse().join("-"));
          const hoje = new Date("2026-06-18");
          const atrasada = nc.estado !== "Fechada" && nc.estado !== "Corrigida" && prazoDate < hoje;

          return (
            <div key={nc.id} className={`rounded-xl border bg-panel dark:bg-panel shadow-sm overflow-hidden ${atrasada ? "border-red-300 dark:border-red-700" : "border-ink-ghost/60 dark:border-ink-ghost/20"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">{nc.id}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TIPO_COLORS[nc.tipo]}`}>
                    {nc.tipo}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${estadoConf.color}`}>
                    {estadoConf.icon}
                    {nc.estado}
                  </span>
                  {atrasada && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 dark:bg-red-900/40 px-2.5 py-1 text-xs font-semibold text-danger dark:text-red-300">
                      <AlertTriangle className="h-3 w-3" />
                      Prazo ultrapassado
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-ink-mid/70 dark:text-ink-mid/60">
                  <span>Data: <strong className="text-gray-700 dark:text-gray-300">{nc.data}</strong></span>
                  <span>Lote: <strong className="font-mono text-gray-700 dark:text-gray-300">{nc.lote}</strong></span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Prazo: <strong className={`${atrasada ? "text-danger dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{nc.prazo}</strong>
                  </span>
                </div>
              </div>
              <div className="px-5 pb-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">Descrição</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{nc.descricao}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide mb-1">Acção Correctiva</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{nc.accaoCorrectiva}</p>
                  <p className="mt-2 text-xs text-ink-mid/50 dark:text-ink-mid/40">
                    Responsável: <span className="font-medium text-ink-mid dark:text-ink-mid/60">{nc.responsavel}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {lista.length === 0 && (
          <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel px-6 py-10 text-center text-sm text-ink-mid/50 dark:text-ink-mid/40">
            Nenhuma não conformidade encontrada com os filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}
