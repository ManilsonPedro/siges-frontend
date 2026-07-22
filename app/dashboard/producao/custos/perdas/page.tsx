"use client";

import {
  AlertTriangle,
  Droplets,
  Flame,
  Calendar,
  PackageX,
  Wrench,
  FlaskConical,
  TrendingDown,
} from "lucide-react";

type MotivoPerca = "Derrame" | "Contaminação" | "Vencimento" | "Equipamento";

interface Perca {
  id: string;
  data: string;
  produto: string;
  lote: string;
  quantidadePerdida: number;
  unidade: string;
  motivo: MotivoPerca;
  descricao: string;
  valorEstimado: number;
  responsavel: string;
}

const PERDAS: Perca[] = [
  {
    id: "PDA-001",
    data: "05/06/2026",
    produto: "Lixívia KITOKA 5L",
    lote: "KTK-260605-061",
    quantidadePerdida: 80,
    unidade: "L",
    motivo: "Equipamento",
    descricao: "Falha no cabeçal n.º 3 da linha de enchimento — derrame durante operação de fecho.",
    valorEstimado: 148000,
    responsavel: "Domingos Ferreira",
  },
  {
    id: "PDA-002",
    data: "07/06/2026",
    produto: "Hipoclorito de Sódio 20L",
    lote: "HIP-260607-402",
    quantidadePerdida: 200,
    unidade: "L",
    motivo: "Contaminação",
    descricao: "Contaminação com partículas ferrosas detectada após inspeção. Lote descartado por precaução.",
    valorEstimado: 370000,
    responsavel: "Carlota Nzinga",
  },
  {
    id: "PDA-003",
    data: "13/06/2026",
    produto: "Hipoclorito de Sódio 20L",
    lote: "HIP-260613-441",
    quantidadePerdida: 8000,
    unidade: "L",
    motivo: "Vencimento",
    descricao: "Lote com concentração fora de especificação (2.1%). Produto não comercializável — descarte autorizado.",
    valorEstimado: 14800000,
    responsavel: "António Moisés",
  },
  {
    id: "PDA-004",
    data: "15/06/2026",
    produto: "Lixívia KITOKA 1L",
    lote: "KTK-260615-090",
    quantidadePerdida: 12,
    unidade: "L",
    motivo: "Derrame",
    descricao: "Derrame acidental durante transferência interna de produto acabado para armazém.",
    valorEstimado: 13200,
    responsavel: "Esperança Luvualu",
  },
  {
    id: "PDA-005",
    data: "16/06/2026",
    produto: "Hipoclorito de Sódio 5L",
    lote: "HIP-260616-488",
    quantidadePerdida: 25,
    unidade: "L",
    motivo: "Equipamento",
    descricao: "Perda de produto durante paragem não planeada do agitador T-03. Amostra enviada para análise.",
    valorEstimado: 46250,
    responsavel: "Domingos Ferreira",
  },
  {
    id: "PDA-006",
    data: "18/06/2026",
    produto: "Lixívia KITOKA 5L",
    lote: "KTK-260618-115",
    quantidadePerdida: 35,
    unidade: "L",
    motivo: "Equipamento",
    descricao: "Vibração anormal do agitador T-05. Produto descartado por suspeita de contaminação mecânica.",
    valorEstimado: 64750,
    responsavel: "Beatriz Venâncio",
  },
];

const MOTIVO_CONFIG: Record<MotivoPerca, { color: string; bg: string; icon: React.ReactNode }> = {
  Derrame: {
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: <Droplets className="h-3.5 w-3.5" />,
  },
  Contaminação: {
    color: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    icon: <FlaskConical className="h-3.5 w-3.5" />,
  },
  Vencimento: {
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  Equipamento: {
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 dark:bg-red-900/30",
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
};

function formatAOA(val: number): string {
  return val.toLocaleString("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " AOA";
}

export default function RegistoPerdasPage() {
  const totalPerdidoLitros = PERDAS.reduce((s, p) => s + p.quantidadePerdida, 0);
  const totalValor = PERDAS.reduce((s, p) => s + p.valorEstimado, 0);

  const porMotivo: Record<MotivoPerca, number> = { Derrame: 0, Contaminação: 0, Vencimento: 0, Equipamento: 0 };
  PERDAS.forEach((p) => { porMotivo[p.motivo] += p.valorEstimado; });

  const maiorPerca = PERDAS.reduce((prev, curr) => curr.valorEstimado > prev.valorEstimado ? curr : prev);

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <PackageX className="h-7 w-7 text-danger" />
            Registo de Perdas
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Controlo de perdas de produto — Aquasan Angola, Junho 2026.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Novo
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — dados de demonstração.
      </div>

      {/* Destaque total */}
      <div className="rounded-xl border-2 border-red-300 dark:border-red-700 bg-danger/8 dark:bg-red-900/20 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-danger dark:text-red-400 uppercase tracking-wide mb-1">Total de Perdas — Junho 2026</p>
          <p className="text-3xl font-bold text-danger dark:text-red-300">{formatAOA(totalValor)}</p>
          <p className="text-sm text-danger dark:text-red-400 mt-1">
            {totalPerdidoLitros.toLocaleString("pt-AO")} litros perdidos em {PERDAS.length} ocorrências
          </p>
        </div>
        <div className="flex items-center gap-2 text-danger dark:text-red-400">
          <TrendingDown className="h-10 w-10 opacity-30" />
        </div>
      </div>

      {/* KPIs por motivo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(Object.keys(porMotivo) as MotivoPerca[]).map((motivo) => {
          const conf = MOTIVO_CONFIG[motivo];
          const contagem = PERDAS.filter((p) => p.motivo === motivo).length;
          return (
            <div key={motivo} className={`rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm`}>
              <div className={`inline-flex items-center gap-1.5 rounded-full ${conf.bg} ${conf.color} px-2.5 py-1 text-xs font-semibold mb-2`}>
                {conf.icon}
                {motivo}
              </div>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{formatAOA(porMotivo[motivo])}</p>
              <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 mt-0.5">{contagem} ocorrência{contagem !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      {/* Maior perca */}
      <div className="rounded-xl border border-amber/30 dark:border-amber-800 bg-amber/8 dark:bg-amber-900/20 px-5 py-4 flex flex-wrap items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber dark:text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber dark:text-amber-300">Maior ocorrência do mês</p>
          <p className="text-xs text-amber dark:text-amber-400">
            {maiorPerca.data} — {maiorPerca.produto} — Lote {maiorPerca.lote} — {maiorPerca.descricao}
          </p>
        </div>
        <p className="text-base font-bold text-amber dark:text-amber-300 shrink-0">{formatAOA(maiorPerca.valorEstimado)}</p>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 text-sm">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                {["ID", "Data", "Produto", "Lote", "Qtd Perdida", "Motivo", "Descrição", "Valor Estimado", "Responsável"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {PERDAS.map((p) => {
                const conf = MOTIVO_CONFIG[p.motivo];
                return (
                  <tr key={p.id} className="hover:bg-surface dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">{p.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">{p.data}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-200 font-medium">{p.produto}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-ink-mid dark:text-gray-400">{p.lote}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-700 dark:text-gray-300">
                      {p.quantidadePerdida.toLocaleString("pt-AO")} {p.unidade}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full ${conf.bg} ${conf.color} px-2.5 py-1 text-xs font-semibold`}>
                        {conf.icon}
                        {p.motivo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-mid/70 dark:text-ink-mid/60 max-w-xs truncate" title={p.descricao}>
                      {p.descricao}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-danger dark:text-red-300">
                      {formatAOA(p.valorEstimado)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-mid dark:text-gray-400">{p.responsavel}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-surface dark:bg-gray-800/50 border-t border-ink-ghost/60 dark:border-ink-ghost/20">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase">
                  Total — {PERDAS.length} ocorrências
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {totalPerdidoLitros.toLocaleString("pt-AO")} L
                </td>
                <td colSpan={2} />
                <td className="px-4 py-3 text-right font-bold text-danger dark:text-red-300 whitespace-nowrap">
                  {formatAOA(totalValor)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Nota */}
      <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40">
        Valores estimados com base no custo de produção por litro. Perdas superiores a 1.000.000 AOA requerem aprovação da direcção.
      </p>
    </div>
  );
}
