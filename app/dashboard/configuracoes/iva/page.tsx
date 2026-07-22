"use client";

import {
  Percent,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
  CalendarDays,
  Info,
} from "lucide-react";

const taxasIva = [
  {
    id: 1,
    codigo: "IVA-000",
    descricao: "Isento de IVA",
    taxa: 0,
    tipo: "Isento",
    vigenciaInicio: "01/01/2019",
    vigenciaFim: "—",
    estado: "Activa",
    observacao: "Aplicável a produtos essenciais e exportações",
  },
  {
    id: 2,
    codigo: "IVA-007",
    descricao: "Taxa Reduzida",
    taxa: 7,
    tipo: "Reduzido",
    vigenciaInicio: "01/10/2019",
    vigenciaFim: "—",
    estado: "Activa",
    observacao: "Produtos alimentares e medicamentos",
  },
  {
    id: 3,
    codigo: "IVA-014",
    descricao: "Taxa Normal",
    taxa: 14,
    tipo: "Normal",
    vigenciaInicio: "01/10/2019",
    vigenciaFim: "—",
    estado: "Activa",
    observacao: "Taxa geral aplicável à maioria dos produtos e serviços",
  },
  {
    id: 4,
    codigo: "IVA-010",
    descricao: "Taxa Especial Transitória",
    taxa: 10,
    tipo: "Reduzido",
    vigenciaInicio: "01/10/2019",
    vigenciaFim: "30/09/2021",
    estado: "Inactiva",
    observacao: "Taxa transitória aplicada durante o período de ajustamento",
  },
];

const tipoConfig: Record<string, string> = {
  Normal:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Reduzido:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Isento:
    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

export default function IvaPage() {
  const activas = taxasIva.filter((t) => t.estado === "Activa").length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuração de IVA
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
              <Sparkles className="w-3 h-3" />
              Novo
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Taxas de IVA em vigor para facturação da empresa
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Nova Taxa
        </button>
      </div>

      {/* Banner módulo novo */}
      <div className="flex items-start gap-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-4 py-3">
        <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-violet-700 dark:text-violet-300">
          <span className="font-semibold">Módulo em desenvolvimento</span> — as taxas configuradas aqui serão aplicadas automaticamente na emissão de facturas e proformas.
        </p>
      </div>

      {/* Nota legal */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Taxas de IVA de acordo com o <span className="font-medium">Código do IVA Angola</span> (Lei n.º 7/19 de 24 de Abril, actualizada). Taxa normal vigente: <span className="font-semibold">14%</span>.
        </p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total de Taxas", valor: taxasIva.length, cor: "text-gray-900 dark:text-white" },
          { label: "Activas", valor: activas, cor: "text-green-600 dark:text-green-400" },
          { label: "Inactivas", valor: taxasIva.length - activas, cor: "text-red-500 dark:text-red-400" },
          { label: "Taxa Padrão", valor: "14%", cor: "text-blue-600 dark:text-blue-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.cor}`}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Taxas Configuradas ({taxasIva.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {["Código", "Descrição", "Taxa (%)", "Tipo", "Vigência Início", "Vigência Fim", "Estado"].map((col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {taxasIva.map((taxa) => (
                <tr
                  key={taxa.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {taxa.codigo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{taxa.descricao}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{taxa.observacao}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 font-bold text-lg text-gray-900 dark:text-white">
                      <Percent className="w-4 h-4 text-gray-400" />
                      {taxa.taxa}%
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoConfig[taxa.tipo] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {taxa.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                      {taxa.vigenciaInicio}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                    {taxa.vigenciaFim}
                  </td>
                  <td className="px-5 py-3.5">
                    {taxa.estado === "Activa" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactiva
                      </span>
                    )}
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
