"use client";

import { useState } from "react";
import {
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Award,
  Package,
  FlaskConical,
  CalendarDays,
} from "lucide-react";

type StatusLote = "Liberado" | "Bloqueado" | "Em Quarentena";

interface Lote {
  id: string;
  numero: string;
  produto: string;
  categoria: string;
  dataProducao: string;
  dataValidade: string;
  quantidade: number;
  unidade: string;
  responsavel: string;
  armazem: string;
  status: StatusLote;
  certificado: string;
  observacoes: string;
}

const LOTES: Lote[] = [
  {
    id: "L-001",
    numero: "HIP-260619-534",
    produto: "Hipoclorito de Sódio 20L",
    categoria: "Hipoclorito",
    dataProducao: "19/06/2026",
    dataValidade: "19/12/2026",
    quantidade: 4800,
    unidade: "L",
    responsavel: "Beatriz Venâncio",
    armazem: "Armazém Central – Luanda",
    status: "Liberado",
    certificado: "CQ-2026-534",
    observacoes: "Lote produzido dentro das especificações. pH 12.9, concentração 5.2%.",
  },
  {
    id: "L-002",
    numero: "KTK-260618-102",
    produto: "Lixívia KITOKA 5L",
    categoria: "KITOKA",
    dataProducao: "18/06/2026",
    dataValidade: "18/12/2026",
    quantidade: 3500,
    unidade: "L",
    responsavel: "António Moisés",
    armazem: "Armazém Norte – Malanje",
    status: "Liberado",
    certificado: "CQ-2026-102",
    observacoes: "—",
  },
  {
    id: "L-003",
    numero: "HIP-260617-488",
    produto: "Hipoclorito de Sódio 5L",
    categoria: "Hipoclorito",
    dataProducao: "17/06/2026",
    dataValidade: "17/12/2026",
    quantidade: 2200,
    unidade: "L",
    responsavel: "Carlota Nzinga",
    armazem: "Armazém Central – Luanda",
    status: "Em Quarentena",
    certificado: "—",
    observacoes: "pH 13.2, ligeiramente elevado. Aguarda reensaio laboratorial.",
  },
  {
    id: "L-004",
    numero: "KTK-260616-088",
    produto: "Lixívia KITOKA 1L",
    categoria: "KITOKA",
    dataProducao: "16/06/2026",
    dataValidade: "16/12/2026",
    quantidade: 6000,
    unidade: "L",
    responsavel: "Domingos Ferreira",
    armazem: "Armazém Sul – Benguela",
    status: "Liberado",
    certificado: "CQ-2026-088",
    observacoes: "—",
  },
  {
    id: "L-005",
    numero: "HIP-260613-441",
    produto: "Hipoclorito de Sódio 20L",
    categoria: "Hipoclorito",
    dataProducao: "13/06/2026",
    dataValidade: "13/12/2026",
    quantidade: 1800,
    unidade: "L",
    responsavel: "Domingos Ferreira",
    armazem: "Armazém Central – Luanda",
    status: "Bloqueado",
    certificado: "—",
    observacoes: "Concentração 2.1%, abaixo do mínimo aceitável (3%). Lote retido — NC aberta.",
  },
  {
    id: "L-006",
    numero: "KTK-260612-077",
    produto: "Lixívia KITOKA 20L",
    categoria: "KITOKA",
    dataProducao: "12/06/2026",
    dataValidade: "12/12/2026",
    quantidade: 5200,
    unidade: "L",
    responsavel: "Esperança Luvualu",
    armazem: "Armazém Exportação",
    status: "Liberado",
    certificado: "CQ-2026-077",
    observacoes: "Destinado a exportação – Namíbia.",
  },
  {
    id: "L-007",
    numero: "HIP-260610-412",
    produto: "Hipoclorito de Sódio 20L",
    categoria: "Hipoclorito",
    dataProducao: "10/06/2026",
    dataValidade: "10/12/2026",
    quantidade: 4400,
    unidade: "L",
    responsavel: "Beatriz Venâncio",
    armazem: "Armazém Central – Luanda",
    status: "Liberado",
    certificado: "CQ-2026-412",
    observacoes: "—",
  },
  {
    id: "L-008",
    numero: "KTK-260608-055",
    produto: "Lixívia KITOKA 5L",
    categoria: "KITOKA",
    dataProducao: "08/06/2026",
    dataValidade: "08/12/2026",
    quantidade: 3100,
    unidade: "L",
    responsavel: "António Moisés",
    armazem: "Armazém Norte – Malanje",
    status: "Liberado",
    certificado: "CQ-2026-055",
    observacoes: "—",
  },
  {
    id: "L-009",
    numero: "HIP-260605-398",
    produto: "Hipoclorito de Sódio 5L",
    categoria: "Hipoclorito",
    dataProducao: "05/06/2026",
    dataValidade: "05/12/2026",
    quantidade: 2600,
    unidade: "L",
    responsavel: "Carlota Nzinga",
    armazem: "Armazém Sul – Benguela",
    status: "Em Quarentena",
    certificado: "—",
    observacoes: "Cor ligeiramente diferente do padrão. Aguarda confirmação do laboratório.",
  },
  {
    id: "L-010",
    numero: "KTK-260603-031",
    produto: "Lixívia KITOKA 20L",
    categoria: "KITOKA",
    dataProducao: "03/06/2026",
    dataValidade: "03/12/2026",
    quantidade: 7200,
    unidade: "L",
    responsavel: "Esperança Luvualu",
    armazem: "Armazém Exportação",
    status: "Liberado",
    certificado: "CQ-2026-031",
    observacoes: "Exportação – Zâmbia.",
  },
];

const STATUS_CONFIG: Record<StatusLote, { label: string; color: string; icon: React.ReactNode }> = {
  Liberado: {
    label: "Liberado",
    color: "bg-live-dim dark:bg-emerald-900/30 text-live dark:text-emerald-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  Bloqueado: {
    label: "Bloqueado",
    color: "bg-danger/10 dark:bg-red-900/30 text-danger dark:text-red-300",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  "Em Quarentena": {
    label: "Em Quarentena",
    color: "bg-amber/15 dark:bg-amber-900/30 text-amber dark:text-amber-300",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

export default function HistoricoLotesPage() {
  const [filtroStatus, setFiltroStatus] = useState<StatusLote | "Todos">("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState<"Todos" | "Hipoclorito" | "KITOKA">("Todos");
  const [busca, setBusca] = useState("");

  const totalLitros = LOTES.reduce((acc, l) => acc + l.quantidade, 0);
  const liberados = LOTES.filter((l) => l.status === "Liberado").length;
  const bloqueados = LOTES.filter((l) => l.status === "Bloqueado").length;
  const quarentena = LOTES.filter((l) => l.status === "Em Quarentena").length;

  const listagem = LOTES.filter((l) => {
    const matchStatus = filtroStatus === "Todos" || l.status === filtroStatus;
    const matchCategoria = filtroCategoria === "Todos" || l.categoria === filtroCategoria;
    const matchBusca =
      busca === "" ||
      l.numero.toLowerCase().includes(busca.toLowerCase()) ||
      l.produto.toLowerCase().includes(busca.toLowerCase()) ||
      l.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      l.armazem.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchCategoria && matchBusca;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <Layers className="h-7 w-7 text-live" />
            Histórico de Lotes
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Histórico completo de lotes produzidos com rastreabilidade e certificados de qualidade — Aquasan Angola / KITOKA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-panel px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-surface dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
            Módulo em desenvolvimento
          </span>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — dados de demonstração. Integração com ERP Primavera e emissão de certificados em curso.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-ink-mid/50" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total de Lotes</p>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">{LOTES.length}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-emerald-50 dark:bg-emerald-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-live" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Liberados</p>
          </div>
          <p className="text-2xl font-bold text-live dark:text-emerald-300">{liberados}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-amber/8 dark:bg-amber-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Em Quarentena</p>
          </div>
          <p className="text-2xl font-bold text-amber dark:text-amber-300">{quarentena}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-danger/8 dark:bg-red-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-danger" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Bloqueados</p>
          </div>
          <p className="text-2xl font-bold text-danger dark:text-red-300">{bloqueados}</p>
        </div>
      </div>

      {/* Resumo de volume */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-live-dim dark:bg-emerald-900/30">
            <FlaskConical className="h-5 w-5 text-live" />
          </div>
          <div>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Volume Total Produzido</p>
            <p className="text-lg font-bold text-ink dark:text-gray-100">
              {totalLitros.toLocaleString("pt-AO")} L
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Certificados Emitidos</p>
            <p className="text-lg font-bold text-ink dark:text-gray-100">
              {LOTES.filter((l) => l.certificado !== "—").length} / {LOTES.length}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
            <CalendarDays className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Período</p>
            <p className="text-lg font-bold text-ink dark:text-gray-100">Jun 2026</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
          <input
            type="text"
            placeholder="Pesquisar lote, produto, responsável ou armazém..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-panel text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusLote | "Todos")}
            className="pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-panel text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
          >
            <option value="Todos">Todos os estados</option>
            <option value="Liberado">Liberado</option>
            <option value="Em Quarentena">Em Quarentena</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>
        </div>
        <div className="relative">
          <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value as "Todos" | "Hipoclorito" | "KITOKA")}
            className="pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-panel text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
          >
            <option value="Todos">Todas as categorias</option>
            <option value="Hipoclorito">Hipoclorito</option>
            <option value="KITOKA">KITOKA</option>
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
                  "Nº Lote",
                  "Produto",
                  "Data Produção",
                  "Validade",
                  "Quantidade",
                  "Responsável",
                  "Armazém",
                  "Certificado",
                  "Estado",
                  "Observações",
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
              {listagem.map((lote) => {
                const sc = STATUS_CONFIG[lote.status];
                return (
                  <tr
                    key={lote.id}
                    className="hover:bg-surface dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-700 dark:text-gray-300 font-semibold">
                      {lote.numero}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-200 font-medium">
                      {lote.produto}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">
                      {lote.dataProducao}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">
                      {lote.dataValidade}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700 dark:text-gray-300 font-medium">
                      {lote.quantidade.toLocaleString("pt-AO")} {lote.unidade}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">
                      {lote.responsavel}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400 max-w-[180px] truncate" title={lote.armazem}>
                      {lote.armazem}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {lote.certificado !== "—" ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-blue-700 dark:text-blue-300">
                          <Award className="h-3.5 w-3.5" />
                          {lote.certificado}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-mid/50 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${sc.color}`}
                      >
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-ink-mid/70 dark:text-ink-mid/60 max-w-xs truncate"
                      title={lote.observacoes}
                    >
                      {lote.observacoes}
                    </td>
                  </tr>
                );
              })}
              {listagem.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm text-ink-mid/50 dark:text-gray-500"
                  >
                    Nenhum lote encontrado com os filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-ink-ghost/40 dark:border-ink-ghost/15 text-xs text-ink-mid/50 dark:text-gray-500 flex items-center justify-between flex-wrap gap-2">
          <span>
            A mostrar {listagem.length} de {LOTES.length} lotes
          </span>
          <span>
            Volume filtrado:{" "}
            <strong className="text-ink-mid dark:text-gray-300">
              {listagem.reduce((acc, l) => acc + l.quantidade, 0).toLocaleString("pt-AO")} L
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
