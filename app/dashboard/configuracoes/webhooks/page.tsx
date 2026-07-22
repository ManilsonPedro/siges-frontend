"use client";

import {
  Webhook,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  AlertTriangle,
  ShoppingCart,
  PackageX,
  ClipboardCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const webhooks = [
  {
    id: 1,
    urlDestino: "https://erp.empresa.ao/webhooks/vendas",
    evento: "venda.criada",
    descricaoEvento: "Nova venda registada no Financ-BI",
    estado: "Activo",
    ultimaExecucao: "18/06/2026 às 23:04",
    httpStatus: 200,
    tentativas: 1,
  },
  {
    id: 2,
    urlDestino: "https://alerts.empresa.ao/stock",
    evento: "stock.alerta",
    descricaoEvento: "Stock abaixo do nível mínimo configurado",
    estado: "Activo",
    ultimaExecucao: "18/06/2026 às 21:30",
    httpStatus: 200,
    tentativas: 1,
  },
  {
    id: 3,
    urlDestino: "https://financbi.empresa.ao/aprovacoes/notify",
    evento: "aprovacao.pendente",
    descricaoEvento: "Documento aguarda aprovação de responsável",
    estado: "Activo",
    ultimaExecucao: "18/06/2026 às 22:47",
    httpStatus: 200,
    tentativas: 1,
  },
  {
    id: 4,
    urlDestino: "https://crm.empresa.ao/sync/clientes",
    evento: "venda.criada",
    descricaoEvento: "Sincronização de cliente com o CRM após venda",
    estado: "Activo",
    ultimaExecucao: "18/06/2026 às 23:04",
    httpStatus: 422,
    tentativas: 3,
  },
  {
    id: 5,
    urlDestino: "https://sms.africell.ao/dispatch",
    evento: "stock.alerta",
    descricaoEvento: "Envio de SMS ao responsável de armazém",
    estado: "Inactivo",
    ultimaExecucao: "14/06/2026 às 09:15",
    httpStatus: null,
    tentativas: 0,
  },
  {
    id: 6,
    urlDestino: "https://erp.empresa.ao/webhooks/compras",
    evento: "aprovacao.pendente",
    descricaoEvento: "Notificação de OC pendente no Primavera",
    estado: "Activo",
    ultimaExecucao: "18/06/2026 às 18:32",
    httpStatus: 200,
    tentativas: 1,
  },
];

const eventoCor: Record<string, string> = {
  "venda.criada":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "stock.alerta":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "aprovacao.pendente":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const eventoIcone: Record<string, React.ReactNode> = {
  "venda.criada": <ShoppingCart className="w-3 h-3" />,
  "stock.alerta": <PackageX className="w-3 h-3" />,
  "aprovacao.pendente": <ClipboardCheck className="w-3 h-3" />,
};

function HttpStatusBadge({ status }: { status: number | null }) {
  if (status === null)
    return <span className="text-xs text-ink-mid/50 dark:text-ink-mid/40">—</span>;
  const ok = status >= 200 && status < 300;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold ${
        ok
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-danger/10 text-danger dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {status}
    </span>
  );
}

export default function WebhooksPage() {
  const activos = webhooks.filter((w) => w.estado === "Activo").length;
  const comErro = webhooks.filter((w) => w.httpStatus !== null && (w.httpStatus < 200 || w.httpStatus >= 300)).length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Webhooks
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
              <Sparkles className="w-3 h-3" />
              Novo
            </span>
          </div>
          <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Notificações automáticas para sistemas externos do Financ-BI Jennos
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Novo Webhook
        </button>
      </div>

      {/* Banner módulo novo */}
      <div className="flex items-start gap-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-4 py-3">
        <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-violet-700 dark:text-violet-300">
          <span className="font-semibold">Módulo em desenvolvimento</span> — re-tentativas automáticas, histórico de disparos e assinatura HMAC estarão disponíveis em breve.
        </p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Webhooks", valor: webhooks.length, cor: "text-ink dark:text-white" },
          { label: "Activos", valor: activos, cor: "text-live dark:text-green-400" },
          { label: "Inactivos", valor: webhooks.length - activos, cor: "text-ink-mid/70 dark:text-ink-mid/60" },
          { label: "Com Erro (último)", valor: comErro, cor: comErro > 0 ? "text-danger dark:text-red-400" : "text-live dark:text-green-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4"
          >
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.cor}`}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-ghost/40 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-ink-mid dark:text-gray-300">
            Webhooks Configurados ({webhooks.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface dark:bg-gray-700/50">
                {["URL Destino", "Evento", "Estado", "Última Execução", "HTTP Status", "Tentativas", "Acção"].map((col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-xs font-medium text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
              {webhooks.map((wh) => (
                <tr
                  key={wh.id}
                  className="hover:bg-surface dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-ink-mid/50 flex-shrink-0" />
                      <div>
                        <p className="font-mono text-xs text-ink-mid dark:text-gray-300 break-all max-w-xs">
                          {wh.urlDestino}
                        </p>
                        <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 mt-0.5">
                          {wh.descricaoEvento}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        eventoCor[wh.evento] ?? "bg-surface text-ink-mid"
                      }`}
                    >
                      {eventoIcone[wh.evento]}
                      {wh.evento}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {wh.estado === "Activo" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface text-ink-mid dark:bg-gray-700 dark:text-gray-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-ink-mid/70 dark:text-ink-mid/60 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-ink-mid/50" />
                      <span className="text-xs">{wh.ultimaExecucao}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <HttpStatusBadge status={wh.httpStatus} />
                  </td>
                  <td className="px-5 py-3.5">
                    {wh.tentativas > 1 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber dark:text-amber font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {wh.tentativas}x
                      </span>
                    ) : (
                      <span className="text-xs text-ink-mid/70 dark:text-ink-mid/60">
                        {wh.tentativas}x
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        wh.estado === "Activo"
                          ? "border-danger/30 dark:border-red-800 text-danger dark:text-red-400 hover:bg-danger/8 dark:hover:bg-red-900/20"
                          : "border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                    >
                      {wh.estado === "Activo" ? (
                        <>
                          <ToggleRight className="w-3.5 h-3.5" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3.5 h-3.5" />
                          Activar
                        </>
                      )}
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
