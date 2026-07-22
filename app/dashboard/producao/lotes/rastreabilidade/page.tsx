"use client";

import { useState } from "react";
import {
  Search,
  GitBranch,
  Package,
  FlaskConical,
  ClipboardCheck,
  Truck,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const LOTES_MOCK: Record<string, {
  numero: string;
  produto: string;
  dataFabrico: string;
  ordemProducao: string;
  quantidade: number;
  unidade: string;
  responsavel: string;
  materiasPrimas: { nome: string; quantidade: string; fornecedor: string; lote: string }[];
  controlos: { data: string; inspector: string; parametro: string; resultado: string; estado: "Aprovado" | "Reprovado" | "Condicional" }[];
  saidas: { data: string; cliente: string; quantidade: string; guia: string; destino: string }[];
}> = {
  "HIP-260610-412": {
    numero: "HIP-260610-412",
    produto: "Hipoclorito de Sódio 20L",
    dataFabrico: "10/06/2026",
    ordemProducao: "OP-2026-0612",
    quantidade: 8000,
    unidade: "L",
    responsavel: "António Moisés",
    materiasPrimas: [
      { nome: "Cloro Gasoso 99%", quantidade: "320 kg", fornecedor: "ChemTrade Luanda Lda", lote: "CG-260601-01" },
      { nome: "Soda Cáustica NaOH 50%", quantidade: "580 kg", fornecedor: "Quimicão Angola", lote: "SC-260601-07" },
      { nome: "Água desmineralizada", quantidade: "7100 L", fornecedor: "Produção interna", lote: "AD-260610-02" },
    ],
    controlos: [
      { data: "10/06/2026 14:00", inspector: "Carlota Nzinga", parametro: "pH", resultado: "12.8", estado: "Aprovado" },
      { data: "10/06/2026 14:15", inspector: "Carlota Nzinga", parametro: "Concentração NaClO", resultado: "5.2%", estado: "Aprovado" },
      { data: "10/06/2026 14:30", inspector: "Carlota Nzinga", parametro: "Cor", resultado: "Amarelo claro", estado: "Aprovado" },
      { data: "10/06/2026 14:45", inspector: "Carlota Nzinga", parametro: "Odor", resultado: "Cloro característico", estado: "Aprovado" },
    ],
    saidas: [
      { data: "12/06/2026", cliente: "Supermercado Kero – Viana", quantidade: "1200 L", guia: "GR-2026-1841", destino: "Luanda" },
      { data: "14/06/2026", cliente: "Hospital Josina Machel", quantidade: "800 L", guia: "GR-2026-1902", destino: "Luanda" },
      { data: "16/06/2026", cliente: "Prefeitura Municipal de Malanje", quantidade: "2000 L", guia: "GR-2026-1953", destino: "Malanje" },
    ],
  },
  "KTK-260615-088": {
    numero: "KTK-260615-088",
    produto: "Lixívia Multiuso 5L",
    dataFabrico: "15/06/2026",
    ordemProducao: "OP-2026-0631",
    quantidade: 3500,
    unidade: "L",
    responsavel: "Beatriz Venâncio",
    materiasPrimas: [
      { nome: "Hipoclorito de Sódio 12%", quantidade: "2800 L", fornecedor: "Produção interna", lote: "HIP-260612-391" },
      { nome: "Surfactante aniónico", quantidade: "35 kg", fornecedor: "Bema Chemicals Lda", lote: "SA-260601-14" },
      { nome: "Corante azul alimentar", quantidade: "2.1 kg", fornecedor: "Bema Chemicals Lda", lote: "CA-260601-02" },
      { nome: "Embalagem PEAD 5L", quantidade: "700 un", fornecedor: "PlastiAngola SA", lote: "EM-260601-05" },
    ],
    controlos: [
      { data: "15/06/2026 09:00", inspector: "Domingos Ferreira", parametro: "pH", resultado: "12.5", estado: "Aprovado" },
      { data: "15/06/2026 09:20", inspector: "Domingos Ferreira", parametro: "Concentração NaClO", resultado: "3.8%", estado: "Aprovado" },
      { data: "15/06/2026 09:35", inspector: "Domingos Ferreira", parametro: "Viscosidade", resultado: "1.8 mPa.s", estado: "Condicional" },
      { data: "15/06/2026 10:00", inspector: "Carlota Nzinga", parametro: "Viscosidade (reteste)", resultado: "2.1 mPa.s", estado: "Aprovado" },
    ],
    saidas: [
      { data: "17/06/2026", cliente: "Cash & Carry Jumbo – Luanda", quantidade: "700 L", guia: "GR-2026-2011", destino: "Luanda" },
      { data: "18/06/2026", cliente: "Distribuidora Nzoji Lda", quantidade: "1400 L", guia: "GR-2026-2034", destino: "Benguela" },
    ],
  },
};

const ESTADO_COLORS = {
  Aprovado: "bg-live-dim dark:bg-emerald-900/30 text-live dark:text-emerald-300",
  Reprovado: "bg-danger/10 dark:bg-red-900/30 text-danger dark:text-red-300",
  Condicional: "bg-amber/15 dark:bg-amber-900/30 text-amber dark:text-amber-300",
};

const ESTADO_ICONS = {
  Aprovado: <CheckCircle2 className="h-3.5 w-3.5" />,
  Reprovado: <XCircle className="h-3.5 w-3.5" />,
  Condicional: <AlertTriangle className="h-3.5 w-3.5" />,
};

function TimelineStep({ icon, color, title, children }: { icon: React.ReactNode; color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-white shadow`}>
          {icon}
        </div>
        <div className="mt-1 w-0.5 flex-1 bg-ink-ghost/60 dark:border-ink-ghost/20" />
      </div>
      <div className="pb-8 flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default function RastreabilidadeLotesPage() {
  const [busca, setBusca] = useState("");
  const [lote, setLote] = useState<typeof LOTES_MOCK[string] | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const encontrado = LOTES_MOCK[busca.trim().toUpperCase()];
    if (encontrado) {
      setLote(encontrado);
      setNaoEncontrado(false);
    } else {
      setLote(null);
      setNaoEncontrado(true);
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <GitBranch className="h-7 w-7 text-ink" />
            Rastreabilidade de Lotes
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Consulte o percurso completo de um lote — desde as matérias-primas até à entrega ao cliente.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Novo
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — os dados apresentados são de demonstração.
      </div>

      {/* Barra de busca */}
      <form onSubmit={handleBuscar} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
          <input
            type="text"
            placeholder="Introduza o número do lote (ex: HIP-260610-412)"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-ink hover:bg-ink/90 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <Search className="h-4 w-4" />
          Pesquisar
        </button>
      </form>

      {/* Sugestão */}
      <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 -mt-3">
        Tente: <button onClick={() => { setBusca("HIP-260610-412"); }} className="underline hover:text-blue-500">HIP-260610-412</button> ou{" "}
        <button onClick={() => { setBusca("KTK-260615-088"); }} className="underline hover:text-blue-500">KTK-260615-088</button>
      </p>

      {/* Não encontrado */}
      {naoEncontrado && (
        <div className="rounded-lg border border-danger/30 dark:border-red-800 bg-danger/8 dark:bg-red-900/20 px-4 py-3 text-sm text-danger dark:text-red-300 flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          Lote não encontrado. Verifique o número e tente novamente.
        </div>
      )}

      {/* Resultado */}
      {lote && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 shadow-sm">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Número de Lote</p>
                <p className="text-base font-bold text-ink dark:text-gray-100">{lote.numero}</p>
              </div>
              <div>
                <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Produto</p>
                <p className="text-base font-semibold text-ink dark:text-gray-100">{lote.produto}</p>
              </div>
              <div>
                <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Data de Fabrico</p>
                <p className="text-base font-semibold text-ink dark:text-gray-100">{lote.dataFabrico}</p>
              </div>
              <div>
                <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Quantidade</p>
                <p className="text-base font-semibold text-ink dark:text-gray-100">{lote.quantidade.toLocaleString("pt-AO")} {lote.unidade}</p>
              </div>
              <div>
                <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Responsável</p>
                <p className="text-base font-semibold text-ink dark:text-gray-100">{lote.responsavel}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-6">Percurso do Lote</h2>
            <div className="space-y-0">

              {/* 1 — Matérias-primas */}
              <TimelineStep icon={<Package className="h-4 w-4" />} color="bg-orange-500" title="Matérias-Primas Utilizadas">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-ink-mid/70 dark:text-ink-mid/60 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                        <th className="pb-1 pr-4 text-left font-medium">Material</th>
                        <th className="pb-1 pr-4 text-left font-medium">Qtd</th>
                        <th className="pb-1 pr-4 text-left font-medium">Fornecedor</th>
                        <th className="pb-1 text-left font-medium">Lote</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lote.materiasPrimas.map((mp, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                          <td className="py-1.5 pr-4 text-gray-700 dark:text-gray-300 font-medium">{mp.nome}</td>
                          <td className="py-1.5 pr-4 text-ink-mid dark:text-gray-400">{mp.quantidade}</td>
                          <td className="py-1.5 pr-4 text-ink-mid dark:text-gray-400">{mp.fornecedor}</td>
                          <td className="py-1.5 text-ink-mid/70 dark:text-gray-500 font-mono">{mp.lote}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TimelineStep>

              {/* 2 — Ordem de Produção */}
              <TimelineStep icon={<FlaskConical className="h-4 w-4" />} color="bg-ink" title="Ordem de Produção">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-2">
                    <p className="text-ink-mid/70 dark:text-ink-mid/60">Ordem</p>
                    <p className="font-bold text-ink dark:text-blue-300">{lote.ordemProducao}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-2">
                    <p className="text-ink-mid/70 dark:text-ink-mid/60">Data</p>
                    <p className="font-bold text-ink dark:text-blue-300">{lote.dataFabrico}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-2">
                    <p className="text-ink-mid/70 dark:text-ink-mid/60">Quantidade</p>
                    <p className="font-bold text-ink dark:text-blue-300">{lote.quantidade.toLocaleString("pt-AO")} {lote.unidade}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-2">
                    <p className="text-ink-mid/70 dark:text-ink-mid/60">Responsável</p>
                    <p className="font-bold text-ink dark:text-blue-300">{lote.responsavel}</p>
                  </div>
                </div>
              </TimelineStep>

              {/* 3 — Controlos de Qualidade */}
              <TimelineStep icon={<ClipboardCheck className="h-4 w-4" />} color="bg-live" title="Controlos de Qualidade">
                <div className="space-y-1.5">
                  {lote.controlos.map((c, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 text-xs">
                      <CalendarDays className="h-3 w-3 text-ink-mid/50" />
                      <span className="text-ink-mid/70 dark:text-ink-mid/60">{c.data}</span>
                      <ChevronRight className="h-3 w-3 text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{c.parametro}</span>
                      <ChevronRight className="h-3 w-3 text-gray-300" />
                      <span className="text-ink-mid dark:text-gray-400">{c.resultado}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${ESTADO_COLORS[c.estado]}`}>
                        {ESTADO_ICONS[c.estado]}
                        {c.estado}
                      </span>
                      <span className="text-ink-mid/50 dark:text-ink-mid/40">— {c.inspector}</span>
                    </div>
                  ))}
                </div>
              </TimelineStep>

              {/* 4 — Saídas para Clientes (sem linha final) */}
              <div className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white shadow">
                    <Truck className="h-4 w-4" />
                  </div>
                </div>
                <div className="pb-2 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Saídas para Clientes</p>
                  <div className="space-y-1.5">
                    {lote.saidas.map((s, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-2 text-xs">
                        <CalendarDays className="h-3 w-3 text-ink-mid/50" />
                        <span className="text-ink-mid/70 dark:text-ink-mid/60">{s.data}</span>
                        <ChevronRight className="h-3 w-3 text-gray-300" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{s.cliente}</span>
                        <ChevronRight className="h-3 w-3 text-gray-300" />
                        <span className="text-ink-mid dark:text-gray-400">{s.quantidade}</span>
                        <span className="font-mono text-ink-mid/50 dark:text-ink-mid/40">{s.guia}</span>
                        <span className="text-ink-mid/50 dark:text-ink-mid/40">→ {s.destino}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
