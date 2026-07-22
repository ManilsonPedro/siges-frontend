"use client";

import {
  Plug,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Key,
} from "lucide-react";

const apis = [
  {
    id: 1,
    nome: "Primavera ERP Gateway",
    urlBase: "https://erp.aquasan.ao/api/v2",
    versao: "v2.4.1",
    autenticacao: "Bearer",
    estado: "Activa",
    ultimaChamada: "18/06/2026 às 23:05",
    erros24h: 0,
    latenciaMs: 142,
  },
  {
    id: 2,
    nome: "Portal AGT — Factura Electrónica",
    urlBase: "https://agt.minfin.gov.ao/api",
    versao: "v1.0",
    autenticacao: "API Key",
    estado: "Activa",
    ultimaChamada: "18/06/2026 às 22:58",
    erros24h: 1,
    latenciaMs: 380,
  },
  {
    id: 3,
    nome: "BNA — Taxas de Câmbio",
    urlBase: "https://opendata.bna.ao/taxas",
    versao: "v1.2",
    autenticacao: "API Key",
    estado: "Activa",
    ultimaChamada: "18/06/2026 às 08:00",
    erros24h: 0,
    latenciaMs: 220,
  },
  {
    id: 4,
    nome: "SMS Gateway — Africell",
    urlBase: "https://sms.africell.ao/api",
    versao: "v3.1",
    autenticacao: "Bearer",
    estado: "Inactiva",
    ultimaChamada: "14/06/2026 às 16:22",
    erros24h: 0,
    latenciaMs: null,
  },
  {
    id: 5,
    nome: "Serviço de Email — SMTP Aquasan",
    urlBase: "smtp://mail.aquasan.ao",
    versao: "SMTP",
    autenticacao: "Bearer",
    estado: "Activa",
    ultimaChamada: "18/06/2026 às 22:47",
    erros24h: 0,
    latenciaMs: 55,
  },
  {
    id: 6,
    nome: "Webhooks Internos — Financ-BI",
    urlBase: "https://financbi.aquasan.ao/webhooks",
    versao: "v1.0",
    autenticacao: "Bearer",
    estado: "Activa",
    ultimaChamada: "18/06/2026 às 23:01",
    erros24h: 3,
    latenciaMs: 98,
  },
];

const autenticacaoCor: Record<string, string> = {
  Bearer:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "API Key":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const autenticacaoIcone: Record<string, React.ReactNode> = {
  Bearer: <ShieldCheck className="w-3 h-3" />,
  "API Key": <Key className="w-3 h-3" />,
};

export default function ApisPage() {
  const activas = apis.filter((a) => a.estado === "Activa").length;
  const totalErros = apis.reduce((acc, a) => acc + a.erros24h, 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestão de APIs
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
              <Sparkles className="w-3 h-3" />
              Novo
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Integrações externas e serviços conectados ao Financ-BI Jennos
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Nova API
        </button>
      </div>

      {/* Banner módulo novo */}
      <div className="flex items-start gap-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-4 py-3">
        <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-violet-700 dark:text-violet-300">
          <span className="font-semibold">Módulo em desenvolvimento</span> — monitorização de saúde, alertas automáticos e logs detalhados serão activados brevemente.
        </p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total de APIs", valor: apis.length, cor: "text-gray-900 dark:text-white" },
          { label: "Activas", valor: activas, cor: "text-green-600 dark:text-green-400" },
          { label: "Inactivas", valor: apis.length - activas, cor: "text-gray-500 dark:text-gray-400" },
          { label: "Erros (24h)", valor: totalErros, cor: totalErros > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400" },
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
            APIs Configuradas ({apis.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {["Nome da API", "URL Base", "Versão", "Autenticação", "Estado", "Última Chamada", "Erros 24h", "Acções"].map((col) => (
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
              {apis.map((api) => (
                <tr
                  key={api.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Plug className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {api.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 break-all">
                      {api.urlBase}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                      {api.versao}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${autenticacaoCor[api.autenticacao] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {autenticacaoIcone[api.autenticacao]}
                      {api.autenticacao}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {api.estado === "Activa" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs">{api.ultimaChamada}</span>
                    </div>
                    {api.latenciaMs !== null && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-5">
                        {api.latenciaMs} ms
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {api.erros24h > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {api.erros24h}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />0
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Testar conexão
                    </button>
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
