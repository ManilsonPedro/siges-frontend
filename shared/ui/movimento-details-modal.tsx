"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  X, FileText, MessageSquare, History, Paperclip, Building2, User as UserIcon,
  Calendar, Clock, CheckCircle2, Edit3, Trash2, Upload, Eye, Send, AlertTriangle,
  TrendingUp, TrendingDown, Wallet,
} from "lucide-react";
import { movimentoDetailService, type MovimentoFullDetail } from "@/shared/services/financeiro.service";
import { formatCurrency, formatDateTime } from "@/shared/utils";
import { FilePreview } from "@/shared/ui/file-preview";
import { useAuthStore } from "@/shared/store/auth.store";
import { usePermissions } from "@/shared/hooks/use-permissions";

interface Props {
  movimentoId: string | null;
  onClose: () => void;
}

type Tab = "detalhes" | "comentarios" | "historico" | "anexos";

const ESTADO_BADGE_COLOR: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  pago: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  pago_total: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  pago_parcial: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  cancelado: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  devolvido: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

export function MovimentoDetailsModal({ movimentoId, onClose }: Props) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const { has } = usePermissions();
  // Quem não pode editar movimentos vê a UI em modo restrito (igual ao antigo "assistente").
  const isAssistente = !has("movimentos.editar");
  const [tab, setTab] = useState<Tab>("detalhes");
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; mime: string | null } | null>(null);
  const [showStateModal, setShowStateModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["movimento-full", movimentoId],
    queryFn: () => movimentoDetailService.full(movimentoId!),
    enabled: !!movimentoId,
  });

  useEffect(() => {
    if (movimentoId) setTab("detalhes");
  }, [movimentoId]);

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["movimento-full", movimentoId] });
    qc.invalidateQueries({ queryKey: ["movimentos"] });
    qc.invalidateQueries({ queryKey: ["fundo"] });
  }

  if (!movimentoId) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-4xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading || !data ? (
            <div className="p-12 text-center text-gray-400 animate-pulse">A carregar detalhes...</div>
          ) : (
            <>
              {/* HEADER */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-500">{data.codigo || "Sem código"}</span>
                      {data.tipo_movimento === "entrada" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          <TrendingUp className="h-3 w-3" /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          <TrendingDown className="h-3 w-3" /> Saída
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${data.fundo_tipo === "BFA" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {data.fundo_tipo}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_BADGE_COLOR[data.estado_pagamento] || "bg-gray-100 text-gray-700"}`}>
                        {data.estado_pagamento.replace("_", " ")}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.valor)}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {data.tipo_movimento === "entrada"
                        ? (data.cliente?.nome || "Cliente desconhecido")
                        : (data.fornecedor?.nome || "Fornecedor desconhecido")
                      } · {data.conceito?.nome || "Conceito desconhecido"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isAssistente && (
                      <button
                        onClick={() => setShowStateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        Mudar estado
                      </button>
                    )}
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 gap-1">
                {([
                  { id: "detalhes", label: "Detalhes", icon: FileText, count: null },
                  { id: "comentarios", label: "Comentários", icon: MessageSquare, count: data.comentarios.length },
                  { id: "historico", label: "Histórico", icon: History, count: data.historico.length + data.pagamentos.length },
                  { id: "anexos", label: "Anexos", icon: Paperclip, count: data.anexos.length },
                ] as Array<{ id: Tab; label: string; icon: typeof FileText; count: number | null }>).map(({ id, label, icon: Icon, count }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
                      tab === id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {count !== null && count > 0 && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* CONTENT */}
              <div className="flex-1 overflow-y-auto p-6">
                {tab === "detalhes" && <DetalhesTab data={data} />}
                {tab === "comentarios" && <ComentariosTab data={data} userId={userId} onChange={invalidate} />}
                {tab === "historico" && <HistoricoTab data={data} />}
                {tab === "anexos" && (
                  <AnexosTab
                    data={data}
                    isAssistente={isAssistente}
                    onPreview={(a) => setPreviewFile({ url: a.file_url, name: a.file_name, mime: a.mime_type })}
                    onChange={invalidate}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <FilePreview
        url={previewFile?.url ?? null}
        name={previewFile?.name}
        mimeType={previewFile?.mime}
        onClose={() => setPreviewFile(null)}
      />

      {showStateModal && data && (
        <MudarEstadoModal
          movimentoId={data.id}
          currentEstado={data.estado_pagamento}
          tipoMovimento={data.tipo_movimento}
          onClose={() => setShowStateModal(false)}
          onSaved={() => { invalidate(); setShowStateModal(false); }}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 1 — Detalhes
// ─────────────────────────────────────────────────────────────────────
function DetalhesTab({ data }: { data: MovimentoFullDetail }) {
  return (
    <div className="space-y-6">
      {/* Linha de KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Data" value={formatDateTime(data.data)?.slice(0, 16) || "—"} icon={Calendar} />
        <Kpi label="Estado Movimento" value={data.estado_movimento} icon={CheckCircle2} />
        <Kpi label="Tempo Tratamento" value={data.tempo_tratamento || "Em curso"} icon={Clock} />
        <Kpi label="Fundo" value={data.fundo_tipo} icon={Wallet} />
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cliente (entrada) ou Fornecedor (saída) */}
        {data.tipo_movimento === "entrada" && data.cliente ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Cliente</h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">ENTRADA</span>
            </div>
            <dl className="space-y-1.5 text-sm">
              <Row label="Nome" value={data.cliente.nome} />
              <Row label="NIF" value={data.cliente.nif} />
              {data.cliente.telefone && <Row label="Telefone" value={data.cliente.telefone} />}
              {data.cliente.email && <Row label="Email" value={data.cliente.email} />}
              {data.cliente.endereco && <Row label="Morada" value={data.cliente.endereco} />}
              <Row label="Estado" value={data.cliente.estado} />
            </dl>
          </div>
        ) : data.fornecedor ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Fornecedor</h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700">SAÍDA</span>
            </div>
            <dl className="space-y-1.5 text-sm">
              <Row label="Nome" value={data.fornecedor.nome} />
              <Row label="NIF" value={data.fornecedor.nif} />
              {data.fornecedor.telefone && <Row label="Telefone" value={data.fornecedor.telefone} />}
              {data.fornecedor.email && <Row label="Email" value={data.fornecedor.email} />}
              {data.fornecedor.endereco && <Row label="Morada" value={data.fornecedor.endereco} />}
              <Row label="Estado" value={data.fornecedor.estado} />
            </dl>
          </div>
        ) : null}

        {/* Conceito + Facturação */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Conceito & Facturação</h3>
          </div>
          <dl className="space-y-1.5 text-sm">
            {data.conceito && <Row label="Conceito" value={data.conceito.nome} />}
            {data.conceito?.descricao && <Row label="Descrição" value={data.conceito.descricao} />}
            {data.fatura_proforma && <Row label="Fatura Proforma" value={data.fatura_proforma} />}
            {data.fatura_recibo && <Row label="Fatura Recibo" value={data.fatura_recibo} />}
          </dl>
        </div>
      </div>

      {/* Auditoria */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserIcon className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Auditoria</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {data.created_by && (
            <div>
              <p className="text-xs text-gray-500">Criado por</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.created_by.nome}</p>
              <p className="text-xs text-gray-500">{formatDateTime(data.created_at)}</p>
            </div>
          )}
          {data.closed_by && data.closed_at && (
            <div>
              <p className="text-xs text-gray-500">Fechado por</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.closed_by.nome}</p>
              <p className="text-xs text-gray-500">
                {formatDateTime(data.closed_at)}
                {data.tempo_tratamento && <span className="ml-2 text-blue-600">· {data.tempo_tratamento}</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {data.observacoes && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Observações</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.observacoes}</p>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Calendar }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500 flex-shrink-0">{label}:</dt>
      <dd className="font-medium text-gray-900 dark:text-white text-right truncate">{value}</dd>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 2 — Comentários
// ─────────────────────────────────────────────────────────────────────
function ComentariosTab({ data, userId, onChange }: { data: MovimentoFullDetail; userId?: string; onChange: () => void }) {
  const [novo, setNovo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const addMutation = useMutation({
    mutationFn: () => movimentoDetailService.addComentario(data.id, novo),
    onSuccess: () => { setNovo(""); toast.success("Comentário adicionado"); onChange(); },
  });
  const editMutation = useMutation({
    mutationFn: ({ cid, texto }: { cid: string; texto: string }) => movimentoDetailService.editComentario(data.id, cid, texto),
    onSuccess: () => { setEditId(null); toast.success("Comentário actualizado"); onChange(); },
    onError: () => toast.error("Erro ao editar"),
  });
  const delMutation = useMutation({
    mutationFn: (cid: string) => movimentoDetailService.deleteComentario(data.id, cid),
    onSuccess: () => { toast.success("Comentário eliminado"); onChange(); },
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <textarea
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={2}
          className="w-full bg-transparent text-sm focus:outline-none resize-none text-gray-900 dark:text-white placeholder:text-gray-500"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">Pode editar/eliminar nos primeiros 15 minutos.</p>
          <button
            onClick={() => addMutation.mutate()}
            disabled={!novo.trim() || addMutation.isPending}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            <Send className="h-3.5 w-3.5" /> Publicar
          </button>
        </div>
      </div>

      {data.comentarios.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">
          <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          Sem comentários ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {data.comentarios.map((c) => (
            <div key={c.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    {c.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.user_name}</p>
                    <p className="text-[10px] text-gray-500">
                      {formatDateTime(c.created_at)}
                      {c.edited_at && <span className="ml-1 italic">(editado)</span>}
                    </p>
                  </div>
                </div>
                {(c.is_editable || c.is_owner) && (
                  <div className="flex items-center gap-1">
                    {c.is_editable && (
                      <button
                        onClick={() => { setEditId(c.id); setEditText(c.texto); }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      ><Edit3 className="h-3 w-3" /></button>
                    )}
                    <button
                      onClick={() => { if (confirm("Eliminar comentário?")) delMutation.mutate(c.id); }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    ><Trash2 className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
              {editId === c.id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-900"
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => editMutation.mutate({ cid: c.id, texto: editText })}
                      disabled={!editText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                    >Guardar</button>
                    <button onClick={() => setEditId(null)} className="text-xs px-3 py-1 text-gray-500">Cancelar</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap ml-9">{c.texto}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 3 — Histórico (timeline combinada)
// ─────────────────────────────────────────────────────────────────────
function HistoricoTab({ data }: { data: MovimentoFullDetail }) {
  type Evento =
    | { kind: "criado"; ts: string; user: string; estado_pag: string; estado_mov: string }
    | { kind: "alterado"; ts: string; user: string; estado_pag: string; estado_mov: string }
    | { kind: "upload"; ts: string; user: string; file_name: string }
    | { kind: "anexo_eliminado"; ts: string; user: string; file_name: string; motivo: string }
    | { kind: "pagamento"; ts: string; user: string; valor: string };

  const codigo = data.codigo || `Mov-${data.id.slice(0, 6).toUpperCase()}`;

  // Agrupar histórico por (user + timestamp ao segundo) → uma "alteração"
  const groups = new Map<string, { ts: string; user: string; estado_pag?: string; estado_mov?: string; isCreate: boolean }>();
  for (const h of data.historico) {
    const ts = (h.created_at || "").slice(0, 19); // segundo
    const key = `${ts}__${h.user_name || ""}`;
    let g = groups.get(key);
    if (!g) {
      g = { ts: h.created_at, user: h.user_name || "—", isCreate: false };
      groups.set(key, g);
    }
    if (h.campo === "estado_pagamento") {
      g.estado_pag = h.valor_novo || undefined;
      if (h.valor_anterior == null) g.isCreate = true;
    } else if (h.campo === "estado_movimento") {
      g.estado_mov = h.valor_novo || undefined;
      if (h.valor_anterior == null) g.isCreate = true;
    }
  }

  const eventos: Evento[] = [];

  // Eventos derivados do histórico
  for (const g of Array.from(groups.values())) {
    eventos.push({
      kind: g.isCreate ? "criado" : "alterado",
      ts: g.ts,
      user: g.user,
      estado_pag: g.estado_pag || data.estado_pagamento,
      estado_mov: g.estado_mov || data.estado_movimento,
    });
  }

  // Fallback: se não há "criado" no histórico, sintetiza a partir dos metadados do movimento
  if (!eventos.some((e) => e.kind === "criado") && data.created_by) {
    eventos.push({
      kind: "criado",
      ts: data.created_at,
      user: data.created_by.nome,
      estado_pag: data.estado_pagamento,
      estado_mov: data.estado_movimento,
    });
  }

  // Uploads + eliminações de anexos
  for (const a of data.anexos) {
    eventos.push({
      kind: "upload",
      ts: a.uploaded_at,
      user: a.uploaded_by_name || "—",
      file_name: a.file_name,
    });
    if (a.deleted_at) {
      eventos.push({
        kind: "anexo_eliminado",
        ts: a.deleted_at,
        user: a.deleted_by_name || "—",
        file_name: a.file_name,
        motivo: a.delete_reason || "",
      });
    }
  }

  // Pagamentos parciais
  for (const p of data.pagamentos) {
    eventos.push({
      kind: "pagamento",
      ts: p.created_at,
      user: p.user_name || "—",
      valor: `${p.valor.toLocaleString()} Kz · ${p.fundo_tipo}`,
    });
  }

  eventos.sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));

  if (eventos.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-8">
        <History className="h-10 w-10 mx-auto mb-2 text-gray-300" />
        Sem histórico registado.
      </div>
    );
  }

  const KIND_COLOR: Record<Evento["kind"], string> = {
    criado: "bg-blue-500",
    alterado: "bg-amber-500",
    upload: "bg-purple-500",
    anexo_eliminado: "bg-red-500",
    pagamento: "bg-green-500",
  };
  const KIND_LABEL: Record<Evento["kind"], string> = {
    criado: "Criado",
    alterado: "Alterado",
    upload: "Upload",
    anexo_eliminado: "Anexo eliminado",
    pagamento: "Pagamento parcial",
  };

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />
      {eventos.map((e, i) => (
        <div key={`${e.kind}-${i}-${e.ts}`} className="relative pb-5">
          <div className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full ${KIND_COLOR[e.kind]}`} />
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 ml-2">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{KIND_LABEL[e.kind]}</span>
              <span className="text-xs text-gray-400">{formatDateTime(e.ts)}</span>
            </div>
            {(e.kind === "criado" || e.kind === "alterado") && (
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-mono text-xs text-gray-500">{codigo}</span>
                  {" · "}
                  {e.kind === "criado" ? "Criado por: " : "Alterado por: "}
                  <span className="font-medium">{e.user}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE_COLOR[e.estado_pag] || "bg-gray-100 text-gray-700"}`}>
                    Fatura: {e.estado_pag.replace("_", " ")}
                  </span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 capitalize">
                    Mov.: {e.estado_mov}
                  </span>
                </div>
              </div>
            )}
            {e.kind === "upload" && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{e.file_name}</span> — por <span className="font-medium">{e.user}</span>
              </p>
            )}
            {e.kind === "anexo_eliminado" && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p><span className="font-medium line-through text-gray-500">{e.file_name}</span> — eliminado por <span className="font-medium">{e.user}</span></p>
                {e.motivo && <p className="text-xs italic text-gray-500 mt-1">Motivo: "{e.motivo}"</p>}
              </div>
            )}
            {e.kind === "pagamento" && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{e.user}</span> registou <span className="font-semibold text-green-700">{e.valor}</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 4 — Anexos
// ─────────────────────────────────────────────────────────────────────
function AnexosTab({ data, isAssistente, onPreview, onChange }: {
  data: MovimentoFullDetail;
  isAssistente: boolean;
  onPreview: (a: MovimentoFullDetail["anexos"][0]) => void;
  onChange: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<File[]>([]);
  const [titulo, setTitulo] = useState("");
  const [tipoFatura, setTipoFatura] = useState<"proforma" | "recibo">("recibo");
  const [deleteTarget, setDeleteTarget] = useState<MovimentoFullDetail["anexos"][0] | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState("");

  const uploadMutation = useMutation({
    mutationFn: ({ file, titulo, tipo }: { file: File; titulo: string; tipo: "proforma" | "recibo" }) =>
      movimentoDetailService.uploadAnexo(data.id, file, titulo, tipo),
    onSuccess: () => { toast.success("Anexo carregado"); onChange(); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro no upload"),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ aid, motivo }: { aid: string; motivo: string }) =>
      movimentoDetailService.deleteAnexo(data.id, aid, motivo),
    onSuccess: () => { toast.success("Anexo eliminado"); setDeleteTarget(null); setDeleteMotivo(""); onChange(); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro ao eliminar"),
  });

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPending(Array.from(files));
    setTitulo("");
  }

  function confirmarUpload() {
    const t = titulo.trim().toUpperCase();
    if (!/^(FR|FP)[0-9A-Z\-/]+$/.test(t)) {
      toast.error("Título obrigatório: FRxxxx ou FPxxxx");
      return;
    }
    pending.forEach((file, i) => {
      // Se houver vários ficheiros, sufixar com -1, -2...
      const tit = pending.length > 1 ? `${t}-${i + 1}` : t;
      uploadMutation.mutate({ file, titulo: tit, tipo: tipoFatura });
    });
    setPending([]);
    setTitulo("");
  }

  // Auto-detectar tipo a partir do prefixo do título (FR → recibo, FP → proforma)
  const autoTipo = titulo.toUpperCase().startsWith("FR")
    ? "recibo"
    : titulo.toUpperCase().startsWith("FP")
    ? "proforma"
    : null;

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setPending([])}>
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Título do ficheiro</h3>
            <p className="text-xs text-gray-500 mb-3">Obrigatório · formato FRxxxx ou FPxxxx</p>
            <div className="mb-3 max-h-24 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-2 space-y-1">
              {pending.map((f, i) => <div key={i}>• {f.name}</div>)}
            </div>
            <input
              autoFocus
              value={titulo}
              onChange={(e) => {
                const v = e.target.value.toUpperCase();
                setTitulo(v);
                if (v.startsWith("FR")) setTipoFatura("recibo");
                else if (v.startsWith("FP")) setTipoFatura("proforma");
              }}
              onKeyDown={(e) => { if (e.key === "Enter") confirmarUpload(); }}
              placeholder="Ex: FR1234 ou FP5678"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono uppercase"
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">Tipo de Fatura</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: "proforma", label: "Fatura Proforma", color: "amber" },
                { v: "recibo", label: "Fatura Recibo", color: "emerald" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setTipoFatura(o.v)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    tipoFatura === o.v
                      ? o.color === "amber"
                        ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30"
                        : "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {autoTipo && autoTipo !== tipoFatura && (
              <p className="text-[11px] text-amber-600 mt-1.5">⚠ O prefixo do título sugere "{autoTipo === "recibo" ? "Recibo" : "Proforma"}"</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={confirmarUpload}
                disabled={!titulo.trim() || uploadMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm"
              >
                Confirmar upload
              </button>
              <button
                onClick={() => { setPending([]); setTitulo(""); }}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.docx,.doc"
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          Arraste ficheiros para aqui ou{" "}
          <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 hover:underline font-medium">
            seleccione
          </button>
        </p>
        <p className="text-xs text-gray-400">PDF, imagens, Excel, Word · máx 10 MB cada</p>
      </div>

      {data.anexos.filter((a) => !a.deleted_at).length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-4">Sem anexos.</div>
      ) : (
        <div className="space-y-2">
          {data.anexos.filter((a) => !a.deleted_at).map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.file_name}</p>
                  {a.tipo_fatura && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${a.tipo_fatura === "recibo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {a.tipo_fatura === "recibo" ? "RECIBO" : "PROFORMA"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {a.uploaded_by_name || "—"}
                  {a.size_bytes && ` · ${(a.size_bytes / 1024).toFixed(1)} KB`}
                  {` · ${formatDateTime(a.uploaded_at)}`}
                </p>
              </div>
              <button
                onClick={() => onPreview(a)}
                className="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                title="Pré-visualizar"
              >
                <Eye className="h-4 w-4" />
              </button>
              {!isAssistente && !a._legacy && (
                <button
                  onClick={() => { setDeleteTarget(a); setDeleteMotivo(""); }}
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eliminar anexo</h3>
                <p className="text-xs text-gray-500 mt-0.5 break-all">{deleteTarget.file_name}</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              autoFocus
              value={deleteMotivo}
              onChange={(e) => setDeleteMotivo(e.target.value)}
              rows={3}
              placeholder="Ex: ficheiro errado · substituído pela versão correcta"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">O ficheiro será marcado como eliminado mas mantido no histórico (mínimo 3 caracteres).</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => deleteMutation.mutate({ aid: deleteTarget.id, motivo: deleteMotivo.trim() })}
                disabled={deleteMotivo.trim().length < 3 || deleteMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm"
              >
                Confirmar eliminação
              </button>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteMotivo(""); }}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-modal — Mudar Estado
// ─────────────────────────────────────────────────────────────────────
function MudarEstadoModal({ movimentoId, currentEstado, tipoMovimento, onClose, onSaved }: {
  movimentoId: string; currentEstado: string; tipoMovimento: string;
  onClose: () => void; onSaved: () => void;
}) {
  const estados = tipoMovimento === "entrada"
    ? ["pendente", "pago_parcial", "pago_total"]
    : ["pendente", "pago", "cancelado", "devolvido"];

  const [novo, setNovo] = useState(estados.find((e) => e !== currentEstado) || estados[0]);
  const [motivo, setMotivo] = useState("");
  const [comentario, setComentario] = useState("");

  const requerMotivo = ["cancelado", "devolvido"].includes(novo);

  const mutation = useMutation({
    mutationFn: () => movimentoDetailService.mudarEstado(movimentoId, novo, motivo || undefined, comentario || undefined),
    onSuccess: () => { toast.success("Estado actualizado"); onSaved(); },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="fixed inset-0 z-[55] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mudar estado</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Novo estado</label>
            <select value={novo} onChange={(e) => setNovo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white capitalize">
              {estados.filter((e) => e !== currentEstado).map((e) => (
                <option key={e} value={e}>{e.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          {requerMotivo && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 flex items-start gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 dark:text-amber-300">Motivo obrigatório para este estado.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motivo {requerMotivo && <span className="text-red-500">*</span>}
            </label>
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Fornecedor cancelou ordem"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentário (opcional)</label>
            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)}
              rows={2}
              placeholder="Informação adicional..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>

          <button onClick={() => mutation.mutate()}
            disabled={mutation.isPending || (requerMotivo && !motivo.trim())}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm">
            {mutation.isPending ? "A guardar..." : "Confirmar mudança"}
          </button>
        </div>
      </div>
    </div>
  );
}
