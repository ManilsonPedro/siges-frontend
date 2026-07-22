"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { relatoriosService } from "@/shared/services/financeiro.service";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { AuditEntry } from "@/shared/types";

const ACOES = ["criado", "atualizado", "eliminado", "cancelado", "anexo_upload", "anexo_eliminado", "mudar_estado", "login", "logout"];
const ENTIDADES = ["movimento", "fornecedor", "conceito", "fundo", "user", "anexo"];

const FIELD_LABELS: Record<string, string> = {
  id: "ID",
  codigo: "Código",
  data: "Data",
  fornecedor_id: "Fornecedor (ID)",
  fornecedor_nome: "Fornecedor",
  conceito_id: "Conceito (ID)",
  conceito_nome: "Conceito",
  valor: "Valor",
  tipo_movimento: "Tipo",
  estado_pagamento: "Estado Fatura",
  estado_movimento: "Estado Mov.",
  fatura_proforma: "Fatura Proforma",
  fatura_recibo: "Fatura Recibo",
  observacoes: "Observações",
  fundo_tipo: "Fundo",
  created_at: "Criado em",
  created_by: "Criado por",
  closed_at: "Fechado em",
  closed_by: "Fechado por",
  deleted_at: "Eliminado em",
  file_name: "Ficheiro",
  titulo: "Título",
  tipo_fatura: "Tipo de Fatura",
  motivo: "Motivo",
  delete_reason: "Motivo da eliminação",
  texto: "Texto",
  novo_estado: "Novo estado",
  ip_address: "IP",
};

const HIDDEN_FIELDS = new Set(["company_id", "updated_at", "id", "fornecedor_id", "conceito_id", "movimento_id", "entidade_id"]);

function formatFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (key === "data" || key.endsWith("_at")) {
    const d = new Date(String(value));
    if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-PT") + " " + d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  }
  if (key === "valor") return Number(value).toLocaleString("pt-PT", { minimumFractionDigits: 2 }) + " AOA";
  if (typeof value === "object") return JSON.stringify(value);
  const s = String(value);
  return s.length > 60 ? s.slice(0, 57) + "…" : s;
}

function acaoBadge(acao: string) {
  const map: Record<string, string> = {
    criado: "bg-green-100 text-green-700",
    atualizado: "bg-blue-100 text-blue-700",
    eliminado: "bg-red-100 text-red-700",
    cancelado: "bg-amber-100 text-amber-700",
    anexo_upload: "bg-indigo-100 text-indigo-700",
    anexo_eliminado: "bg-rose-100 text-rose-700",
    mudar_estado: "bg-cyan-100 text-cyan-700",
    login: "bg-purple-100 text-purple-700",
    logout: "bg-surface text-ink-mid",
  };
  return map[acao] ?? "bg-surface text-ink-mid";
}

function acaoLabel(acao: string) {
  const map: Record<string, string> = {
    criado: "Criado",
    atualizado: "Atualizado",
    eliminado: "Eliminado",
    cancelado: "Cancelado",
    anexo_upload: "Upload de anexo",
    anexo_eliminado: "Anexo eliminado",
    mudar_estado: "Mudou estado",
    login: "Login",
    logout: "Logout",
  };
  return map[acao] ?? acao;
}

function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT") + " " + d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

export default function AuditoriaPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    entidade?: string;
    acao?: string;
    data_inicio?: string;
    data_fim?: string;
  }>({});
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["auditoria", page, filters],
    queryFn: () => relatoriosService.auditoria({ page, page_size: 20, ...filters }),
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const applyFilter = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value || undefined }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Histórico de Auditoria</h1>
        <p className="text-ink-mid/70 text-sm">{total} registo(s)</p>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            onChange={(e) => applyFilter("entidade", e.target.value)}
            className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
          >
            <option value="">Todas as entidades</option>
            {ENTIDADES.map((e) => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
          <select
            onChange={(e) => applyFilter("acao", e.target.value)}
            className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
          >
            <option value="">Todas as acções</option>
            {ACOES.map((a) => (
              <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
          <input
            type="date"
            onChange={(e) => applyFilter("data_inicio", e.target.value)}
            className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
          />
          <input
            type="date"
            onChange={(e) => applyFilter("data_fim", e.target.value)}
            className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-ink-mid/50">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
            Nenhum registo de auditoria encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-gray-800/50">
                  {["Data/Hora", "Utilizador", "Acção", "Entidade", "IP", "Detalhes"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-mid/70 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3 text-ink-mid dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDateTime(entry.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink dark:text-white text-xs">{entry.user_name}</p>
                      <p className="text-ink-mid/50 text-xs">{entry.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${acaoBadge(entry.acao)}`}>
                        {acaoLabel(entry.acao)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-mid dark:text-gray-400 text-xs">
                      <span className="font-medium">{entry.entidade}</span>
                      {entry.entidade_id && (
                        <p className="text-ink-mid/50 font-mono text-[10px] truncate max-w-[120px]">{entry.entidade_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-mid/50 text-xs font-mono">{entry.ip_address || "—"}</td>
                    <td className="px-4 py-3">
                      {(entry.dados_anteriores || entry.dados_novos) && (
                        <button
                          onClick={() => setSelected(entry)}
                          className="text-ink hover:text-ink/80 text-xs underline"
                        >
                          Ver dados
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-mid/70">Página {page} de {totalPages} ({total} registos)</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg border border-ink-ghost/80 disabled:opacity-40 hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-ink-ghost/80 disabled:opacity-40 hover:bg-surface"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selected && <AuditDetailModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AuditDetailModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const ant = (entry.dados_anteriores ?? {}) as Record<string, unknown>;
  const nov = (entry.dados_novos ?? {}) as Record<string, unknown>;
  const allKeys = Array.from(new Set([...Object.keys(ant), ...Object.keys(nov)]))
    .filter((k) => !HIDDEN_FIELDS.has(k));
  // Reordenar para campos mais úteis no topo
  const PRIORITY = ["codigo", "data", "valor", "tipo_movimento", "estado_pagamento", "estado_movimento", "fornecedor_nome", "conceito_nome", "fatura_proforma", "fatura_recibo", "fundo_tipo", "file_name", "titulo", "tipo_fatura", "motivo", "delete_reason", "novo_estado"];
  allKeys.sort((a, b) => {
    const ia = PRIORITY.indexOf(a); const ib = PRIORITY.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b);
  });

  const isCreate = entry.acao === "criado" || entry.acao === "anexo_upload";
  const isDelete = entry.acao === "eliminado" || entry.acao === "anexo_eliminado";
  const isUpdate = !isCreate && !isDelete && (entry.dados_anteriores || entry.dados_novos);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 sticky top-0 bg-panel dark:bg-panel z-10">
          <div>
            <h3 className="font-semibold text-ink dark:text-white">{acaoLabel(entry.acao)} · {entry.entidade}</h3>
            <p className="text-xs text-ink-mid/70 mt-0.5">
              {entry.user_name} · {formatDateTime(entry.created_at)}
              {entry.ip_address && ` · IP ${entry.ip_address}`}
            </p>
          </div>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid text-lg">✕</button>
        </div>
        <div className="p-6">
          {allKeys.length === 0 ? (
            <p className="text-sm text-ink-mid/70 text-center py-6">Sem dados adicionais.</p>
          ) : (
            <div className="rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-mid/70 uppercase">Campo</th>
                    {isUpdate && <th className="text-left px-3 py-2 text-xs font-semibold text-ink-mid/70 uppercase w-1/3">Antes</th>}
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-mid/70 uppercase w-1/3">
                      {isUpdate ? "Depois" : isDelete ? "Valor eliminado" : "Valor"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allKeys.map((k) => {
                    const vAnt = ant[k];
                    const vNov = nov[k];
                    const changed = isUpdate && JSON.stringify(vAnt) !== JSON.stringify(vNov);
                    return (
                      <tr key={k} className={`border-t border-ink-ghost/40 dark:border-ink-ghost/15 ${changed ? "bg-amber-50/40 dark:bg-amber-900/10" : ""}`}>
                        <td className="px-3 py-2 text-ink-mid dark:text-gray-300 font-medium">{FIELD_LABELS[k] || k}</td>
                        {isUpdate && (
                          <td className={`px-3 py-2 text-xs font-mono ${changed ? "text-danger line-through" : "text-ink-mid/70"}`}>
                            {formatFieldValue(k, vAnt)}
                          </td>
                        )}
                        <td className={`px-3 py-2 text-xs font-mono ${isUpdate && changed ? "text-green-700 font-semibold" : "text-gray-700 dark:text-gray-200"}`}>
                          {formatFieldValue(k, isUpdate || isCreate ? vNov : vAnt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
