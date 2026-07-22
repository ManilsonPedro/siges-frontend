"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { movimentoService, fornecedorService, clienteService, conceitoService } from "@/shared/services/financeiro.service";
import {
  formatCurrency, formatDate, formatDateTime, estadoBadgeColor, tipoMovimentoLabel,
  estadoPagamentoLabel, estadoMovimentoLabel, estadoMovimentoBadge,
} from "@/shared/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, ChevronLeft, ChevronRight, Upload, FileDown, Eye, FileX, Clock, Wallet, Calendar } from "lucide-react";

const todayISO = () => new Date().toISOString().slice(0, 10);
import type { Movimento, CreateMovimentoDTO, MovimentoFilters, MovimentoHistorico } from "@/shared/types";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { BulkActionsBar } from "@/shared/ui/bulk-actions-bar";
import { SavedFiltersDropdown } from "@/shared/ui/saved-filters-dropdown";
import { PagamentosModal } from "@/shared/ui/pagamentos-modal";
import { MovimentoDetailsModal } from "@/shared/ui/movimento-details-modal";
import { QuickFilterChips } from "@/shared/ui/quick-filter-chips";
import { useBulkSelection } from "@/shared/hooks/use-bulk-selection";

const ESTADOS_ENTRADA = [
  { value: "pendente", label: "Pendente" },
  { value: "pago_parcial", label: "Pago Parcial" },
  { value: "pago_total", label: "Pago Total" },
];

const ESTADOS_SAIDA = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "cancelado", label: "Cancelado" },
  { value: "devolvido", label: "Devolvido" },
];

const schema = z.object({
  data: z.string().min(1, "Data obrigatória"),
  fornecedor_id: z.string().uuid().optional().or(z.literal("")),
  cliente_id: z.string().uuid().optional().or(z.literal("")),
  conceito_id: z.string().uuid("Conceito obrigatório"),
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  tipo_movimento: z.enum(["entrada", "saida"]),
  fundo_tipo: z.enum(["BCS", "BFA"]),
  estado_pagamento: z.string().optional(),
  fatura_proforma: z.string().optional(),
  fatura_recibo: z.string().optional(),
  observacoes: z.string().optional(),
}).refine(d => d.tipo_movimento !== "saida" || !!d.fornecedor_id, {
  message: "Fornecedor obrigatório para Saída", path: ["fornecedor_id"],
}).refine(d => d.tipo_movimento !== "entrada" || !!d.cliente_id, {
  message: "Cliente obrigatório para Entrada", path: ["cliente_id"],
});

type FormData = z.infer<typeof schema>;

function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`bg-panel dark:bg-panel rounded-xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-2xl"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 sticky top-0 bg-panel dark:bg-panel">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function MovimentosPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Movimento | null>(null);
  const [filters, setFilters] = useState<MovimentoFilters>({ page: 1, page_size: 10 });
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [deleteComprTarget, setDeleteComprTarget] = useState<string | null>(null);
  const [histId, setHistId] = useState<string | null>(null);
  const [pagamentosId, setPagamentosId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dataLocked, setDataLocked] = useState(true);
  const [tipoPicker, setTipoPicker] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["movimentos", filters],
    queryFn: () => movimentoService.list(filters),
  });
  const { data: fornecedores = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: fornecedorService.list });
  const { data: clientes = [] } = useQuery({ queryKey: ["clientes"], queryFn: clienteService.list });
  const { data: conceitos = [] } = useQuery({ queryKey: ["conceitos"], queryFn: conceitoService.list });
  const { data: historico = [], isLoading: loadingHist } = useQuery({
    queryKey: ["movimentos-historico", histId],
    queryFn: () => movimentoService.historico(histId!),
    enabled: !!histId,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { data: todayISO(), tipo_movimento: "saida", fundo_tipo: "BCS", estado_pagamento: "pendente" },
  });
  const valorWatch = watch("valor");
  const tipoWatch = watch("tipo_movimento");
  const estadoOptions = tipoWatch === "entrada" ? ESTADOS_ENTRADA : ESTADOS_SAIDA;

  const [duplicateDialog, setDuplicateDialog] = useState<{ dto: CreateMovimentoDTO; movimentos: Array<{ id: string; codigo: string | null; valor: number; data: string; fatura_proforma: string | null; fatura_recibo: string | null; match: string }> } | null>(null);

  const createMutation = useMutation({
    mutationFn: ({ dto, allowDuplicate }: { dto: CreateMovimentoDTO; allowDuplicate?: boolean }) => movimentoService.create(dto, allowDuplicate),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["movimentos"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["fundo"] }); toast.success("Movimento criado"); closeModal(); setDuplicateDialog(null); },
    onError: (e: unknown, variables) => {
      const err = e as { response?: { status?: number; data?: { detail?: string | { code?: string; message?: string; movimentos?: Array<{ id: string; codigo: string | null; valor: number; data: string; fatura_proforma: string | null; fatura_recibo: string | null; match: string }> } } } };
      const detail = err?.response?.data?.detail;
      // 409 com payload de duplicação
      if (err?.response?.status === 409 && typeof detail === "object" && detail?.code === "DUPLICATE_FATURA") {
        setDuplicateDialog({ dto: variables.dto, movimentos: detail.movimentos || [] });
        return;
      }
      toast.error(typeof detail === "string" ? detail : (detail?.message || "Erro ao criar movimento"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateMovimentoDTO> }) => movimentoService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["movimentos"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["fundo"] }); toast.success("Movimento actualizado"); closeModal(); },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao actualizar");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => movimentoService.uploadComprovativo(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["movimentos"] }); toast.success("Comprovativo enviado"); setUploadId(null); },
    onError: () => toast.error("Erro ao enviar comprovativo"),
  });

  const deleteComprMutation = useMutation({
    mutationFn: (id: string) => movimentoService.deleteComprovativo(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["movimentos"] }); toast.success("Comprovativo eliminado"); },
    onError: () => toast.error("Erro ao eliminar comprovativo"),
  });

  const handleExportExcel = async () => {
    try {
      toast.info("A gerar Excel...");
      const blob = await movimentoService.exportExcel(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `movimentos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Excel exportado");
    } catch {
      toast.error("Erro ao exportar Excel");
    }
  };

  const onSubmit = (d: FormData) => {
    const dto: CreateMovimentoDTO = {
      data: new Date(d.data).toISOString(),
      fornecedor_id: d.tipo_movimento === "saida" ? (d.fornecedor_id || undefined) : undefined,
      cliente_id: d.tipo_movimento === "entrada" ? (d.cliente_id || undefined) : undefined,
      conceito_id: d.conceito_id,
      valor: d.valor,
      tipo_movimento: d.tipo_movimento,
      fundo_tipo: d.fundo_tipo,
      estado_pagamento: d.estado_pagamento,
      fatura_proforma: d.fatura_proforma,
      fatura_recibo: d.fatura_recibo,
      observacoes: d.observacoes,
    };
    editing ? updateMutation.mutate({ id: editing.id, dto }) : createMutation.mutate({ dto });
  };

  const openEdit = (m: Movimento) => {
    setEditing(m);
    reset({
      data: m.data ? m.data.split("T")[0] : "",
      fornecedor_id: m.fornecedor_id || "",
      cliente_id: m.cliente_id || "",
      conceito_id: m.conceito_id,
      valor: m.valor,
      tipo_movimento: m.tipo_movimento,
      fundo_tipo: (m.fundo_tipo as "BCS" | "BFA") || "BCS",
      estado_pagamento: m.estado_pagamento,
      fatura_proforma: m.fatura_proforma || "",
      fatura_recibo: m.fatura_recibo || "",
      observacoes: m.observacoes || "",
    });
    setDataLocked(false);
    setShowForm(true);
  };

  const openNew = () => {
    setTipoPicker(true);
  };

  const escolherTipo = (tipo: "entrada" | "saida") => {
    setEditing(null);
    setDataLocked(true);
    reset({ data: todayISO(), tipo_movimento: tipo, fundo_tipo: "BCS", estado_pagamento: "pendente" });
    setTipoPicker(false);
    setShowForm(true);
  };

  const closeModal = () => { setShowForm(false); setEditing(null); setDataLocked(true); reset({ data: todayISO(), tipo_movimento: "saida", fundo_tipo: "BCS", estado_pagamento: "pendente" }); };
  const isMutating = createMutation.isPending || updateMutation.isPending;
  const items = data?.items || [];
  const bulk = useBulkSelection(items);
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const FormFields = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
          <div className="flex gap-2">
            <input
              {...register("data")}
              type="date"
              disabled={dataLocked}
              className={`flex-1 rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink ${dataLocked ? "opacity-70 cursor-not-allowed" : ""}`}
            />
            <button
              type="button"
              onClick={() => {
                if (dataLocked) {
                  setDataLocked(false);
                } else {
                  setValue("data", todayISO());
                  setDataLocked(true);
                }
              }}
              title={dataLocked ? "Alterar data" : "Voltar à data de hoje"}
              className="flex items-center gap-1 rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-surface dark:hover:bg-ink-ghost/20"
            >
              <Calendar className="h-3.5 w-3.5" />
              {dataLocked ? "Alterar" : "Hoje"}
            </button>
          </div>
          {errors.data && <p className="text-danger text-xs mt-1">{errors.data.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (AOA)</label>
          <input {...register("valor")} type="number" step="any" min="0" className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
          {valorWatch > 0 && <p className="text-xs text-ink mt-1 font-medium">{formatCurrency(valorWatch)}</p>}
          {errors.valor && <p className="text-danger text-xs mt-1">{errors.valor.message}</p>}
        </div>
      </div>
      {tipoWatch === "saida" ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fornecedor <span className="text-danger">*</span>
            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-danger/10 text-danger">SAÍDA</span>
          </label>
          <select {...register("fornecedor_id")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
            <option value="">Seleccionar fornecedor...</option>
            {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          {errors.fornecedor_id && <p className="text-danger text-xs mt-1">{errors.fornecedor_id.message}</p>}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cliente <span className="text-danger">*</span>
            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-live-dim text-live">ENTRADA</span>
          </label>
          <select {...register("cliente_id")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Seleccionar cliente...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {errors.cliente_id && <p className="text-danger text-xs mt-1">{errors.cliente_id.message}</p>}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conceito</label>
        <select {...register("conceito_id")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
          <option value="">Seleccionar conceito...</option>
          {conceitos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        {errors.conceito_id && <p className="text-danger text-xs mt-1">{errors.conceito_id.message}</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
          <select
            {...register("tipo_movimento")}
            onChange={e => {
              setValue("tipo_movimento", e.target.value as "entrada" | "saida");
              setValue("estado_pagamento", "pendente");
            }}
            disabled={!editing}
            title={!editing ? "Tipo escolhido no início. Edite o movimento para alterar." : ""}
            className={`w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink ${!editing ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <option value="saida">Saída</option>
            <option value="entrada">Entrada</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fundo</label>
          <select {...register("fundo_tipo")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
            <option value="BCS">BCS</option>
            <option value="BFA">BFA</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado Fatura</label>
          <select {...register("estado_pagamento")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
            {estadoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fatura Proforma</label>
          <input {...register("fatura_proforma")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fatura Recibo</label>
          <input {...register("fatura_recibo")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
        <textarea {...register("observacoes")} rows={2} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={isMutating} className="flex-1 flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
          {isMutating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {editing ? "Actualizar" : "Criar"}
        </button>
        <button type="button" onClick={closeModal} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-surface dark:hover:bg-ink-ghost/20">Cancelar</button>
      </div>
    </form>
  );

  const fornMap = Object.fromEntries(fornecedores.map(f => [f.id, f.nome]));
  const cliMap = Object.fromEntries(clientes.map(c => [c.id, c.nome]));
  const concMap = Object.fromEntries(conceitos.map(c => [c.id, c.nome]));

  const CAMPO_LABELS: Record<string, string> = {
    estado_pagamento: "Estado Fatura",
    estado_movimento: "Estado Mov.",
    valor: "Valor",
    tipo_movimento: "Tipo",
    fundo_tipo: "Fundo",
    fornecedor_id: "Fornecedor",
    conceito_id: "Conceito",
    fatura_proforma: "Fat. Proforma",
    fatura_recibo: "Fat. Recibo",
    observacoes: "Observações",
    codigo: "Código",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Movimentos Financeiros</h1>
          <p className="text-ink-mid/70 text-sm">{total} movimento(s)</p>
        </div>
        <div className="flex gap-2">
          <SavedFiltersDropdown
            route="movimentos"
            currentParams={filters as unknown as Record<string, unknown>}
            onApply={(p) => setFilters({ ...(p as MovimentoFilters), page: 1 })}
          />
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-live hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <FileDown className="h-4 w-4" /> Exportar Excel
          </button>
          <button onClick={openNew} className="flex items-center gap-2 bg-ink hover:bg-ink/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="h-4 w-4" /> Novo Movimento
          </button>
        </div>
      </div>

      <QuickFilterChips current={filters} onApply={setFilters} />

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select onChange={e => setFilters(f => ({ ...f, fornecedor_id: e.target.value || undefined, page: 1 }))} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
            <option value="">Todos os fornecedores</option>
            {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          <select onChange={e => setFilters(f => ({ ...f, conceito_id: e.target.value || undefined, page: 1 }))} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
            <option value="">Todos os conceitos</option>
            {conceitos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select onChange={e => setFilters(f => ({ ...f, tipo_movimento: e.target.value || undefined, page: 1 }))} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <select onChange={e => setFilters(f => ({ ...f, estado_movimento: e.target.value || undefined, page: 1 }))} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
            <option value="">Todos os estados mov.</option>
            <option value="criado">Criado</option>
            <option value="pendente">Pendente</option>
            <option value="fechado">Fechado</option>
          </select>
          <select onChange={e => setFilters(f => ({ ...f, estado_pagamento: e.target.value || undefined, page: 1 }))} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink">
            <option value="">Todos os estados fat.</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="pago_parcial">Pago Parcial</option>
            <option value="pago_total">Pago Total</option>
            <option value="cancelado">Cancelado</option>
            <option value="devolvido">Devolvido</option>
          </select>
          <input type="date" onChange={e => setFilters(f => ({ ...f, data_inicio: e.target.value || undefined, page: 1 }))} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
          <input type="date" onChange={e => setFilters(f => ({ ...f, data_fim: e.target.value || undefined, page: 1 }))} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink" />
        </div>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-ink-mid/50">Nenhum movimento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-ink-ghost/20">
                  <th className="px-3 py-3 w-8" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={bulk.allSelected}
                      onChange={bulk.toggleAll}
                      className="rounded border-ink-ghost/80"
                    />
                  </th>
                  {["Código", "Data", "Cliente / Fornecedor", "Conceito", "Valor", "Tipo", "Fundo", "Est. Fatura", "Est. Mov."].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-mid/70 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(m => (
                  <tr key={m.id}
                    onClick={() => setDetailId(m.id)}
                    className={`border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-ink-ghost/20 cursor-pointer transition-colors ${bulk.isSelected(m.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={bulk.isSelected(m.id)}
                        onChange={() => bulk.toggle(m.id)}
                        className="rounded border-ink-ghost/80"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-ink-mid/70 whitespace-nowrap">{m.codigo || "—"}</td>
                    <td className="px-4 py-3 text-ink-mid dark:text-gray-400 whitespace-nowrap">{formatDate(m.data)}</td>
                    <td className="px-4 py-3 font-medium text-ink dark:text-white">
                      {m.tipo_movimento === "entrada"
                        ? (m.cliente_id ? cliMap[m.cliente_id] || "—" : "—")
                        : (m.fornecedor_id ? fornMap[m.fornecedor_id] || "—" : "—")}
                    </td>
                    <td className="px-4 py-3 text-ink-mid dark:text-gray-400">{concMap[m.conceito_id] || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-ink dark:text-white whitespace-nowrap">{formatCurrency(m.valor)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadgeColor(m.tipo_movimento)}`}>{tipoMovimentoLabel(m.tipo_movimento)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${m.fundo_tipo === "BFA" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{m.fundo_tipo || "BCS"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadgeColor(m.estado_pagamento)}`}>{estadoPagamentoLabel(m.estado_pagamento)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoMovimentoBadge(m.estado_movimento)}`}>{estadoMovimentoLabel(m.estado_movimento)}</span>
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
          <p className="text-sm text-ink-mid/70">Página {filters.page} de {totalPages} ({total} registos)</p>
          <div className="flex gap-2">
            <button disabled={(filters.page || 1) <= 1} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))} className="p-2 rounded-lg border border-ink-ghost/80 disabled:opacity-40 hover:bg-surface">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled={(filters.page || 1) >= totalPages} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))} className="p-2 rounded-lg border border-ink-ghost/80 disabled:opacity-40 hover:bg-surface">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {tipoPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setTipoPicker(false)}>
          <div className="w-full max-w-md bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink dark:text-white mb-1">Tipo de movimento</h3>
            <p className="text-sm text-ink-mid/70 mb-5">Que tipo de movimento pretende registar?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => escolherTipo("entrada")}
                className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <div className="p-3 rounded-full bg-live-dim text-live">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="font-semibold text-live">Entrada</span>
                <span className="text-[11px] text-ink-mid/70 text-center">Cliente · receita · venda</span>
              </button>
              <button
                onClick={() => escolherTipo("saida")}
                className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-red-200 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="p-3 rounded-full bg-danger/10 text-red-700">
                  <Plus className="h-6 w-6 rotate-45" />
                </div>
                <span className="font-semibold text-red-700">Saída</span>
                <span className="text-[11px] text-ink-mid/70 text-center">Fornecedor · custo · compra</span>
              </button>
            </div>
            <button onClick={() => setTipoPicker(false)} className="mt-4 w-full text-sm text-ink-mid/70 hover:text-ink-mid py-2">Cancelar</button>
          </div>
        </div>
      )}

      <Modal open={showForm || !!editing} onClose={closeModal} title={editing ? `Editar Movimento${editing.codigo ? ` — ${editing.codigo}` : ""}` : `Novo Movimento — ${tipoWatch === "entrada" ? "Entrada" : "Saída"}`}>
        {FormFields()}
      </Modal>

      <Modal open={!!uploadId} onClose={() => setUploadId(null)} title="Carregar Comprovativo">
        <div className="space-y-4">
          <p className="text-sm text-ink-mid dark:text-gray-400">Seleccione o ficheiro do comprovativo de pagamento (PDF, JPG, PNG, GIF, WebP, BMP, TIFF, SVG — máx. 10 MB)</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif,.svg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && uploadId) uploadMutation.mutate({ id: uploadId, file });
            }}
            className="block w-full text-sm text-ink-mid/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploadMutation.isPending && <div className="flex items-center gap-2 text-sm text-ink"><Loader2 className="h-4 w-4 animate-spin" />A enviar...</div>}
        </div>
      </Modal>

      <Modal open={!!histId} onClose={() => setHistId(null)} title="Histórico de Alterações" wide>
        {loadingHist ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-ink" /></div>
        ) : historico.length === 0 ? (
          <p className="text-sm text-ink-mid/70 text-center py-6">Sem histórico de alterações.</p>
        ) : (
          <div className="space-y-2">
            {(historico as MovimentoHistorico[]).map(h => (
              <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface dark:bg-ink-ghost/20 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{CAMPO_LABELS[h.campo] || h.campo}</span>
                    {h.valor_anterior != null && (
                      <>
                        <span className="text-xs bg-danger/10 text-danger px-1.5 py-0.5 rounded line-through">{h.valor_anterior}</span>
                        <span className="text-ink-mid/50">→</span>
                      </>
                    )}
                    {h.valor_novo != null && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{h.valor_novo}</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-mid/50 mt-1">{h.user_name} · {formatDateTime(h.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteComprTarget}
        title="Eliminar Comprovativo"
        message="Tem a certeza que pretende eliminar o comprovativo anexado?"
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteComprTarget) { deleteComprMutation.mutate(deleteComprTarget); setDeleteComprTarget(null); } }}
        onCancel={() => setDeleteComprTarget(null)}
      />

      <BulkActionsBar selectedIds={bulk.selectedIds} onClear={bulk.clear} />
      <PagamentosModal movimentoId={pagamentosId} onClose={() => setPagamentosId(null)} />
      <MovimentoDetailsModal movimentoId={detailId} onClose={() => setDetailId(null)} />

      {duplicateDialog && (
        <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDuplicateDialog(null)}>
          <div className="w-full max-w-lg bg-panel dark:bg-panel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber/15 dark:bg-amber/10 flex-shrink-0">
                <FileX className="h-5 w-5 text-amber" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink dark:text-white">Fatura duplicada</h3>
                <p className="text-sm text-ink-mid/70 mt-0.5">Já existe um movimento com esta fatura. Deseja associar mesmo assim?</p>
              </div>
            </div>

            <div className="border border-amber/30 dark:border-amber/30 rounded-lg bg-amber/8 dark:bg-amber/10 p-3 mb-4 max-h-56 overflow-y-auto">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber dark:text-amber-300 mb-2">Movimentos existentes:</p>
              <ul className="space-y-2">
                {duplicateDialog.movimentos.map((m) => (
                  <li key={m.id} className="text-sm bg-panel dark:bg-panel rounded p-2 border border-amber/20 dark:border-amber-900">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-ink-mid/70">{m.codigo || m.id.slice(0, 8)}</span>
                      <span className="font-semibold text-ink dark:text-white">{formatCurrency(m.valor)}</span>
                    </div>
                    <p className="text-xs text-ink-mid/70 mt-0.5">
                      {m.match === "proforma" ? "Proforma" : "Recibo"}: <span className="font-mono">{m.match === "proforma" ? m.fatura_proforma : m.fatura_recibo}</span>
                      {m.data && ` · ${m.data.slice(0, 10)}`}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDuplicateDialog(null)}
                className="px-4 py-2 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-surface dark:hover:bg-ink-ghost/20"
              >
                Cancelar
              </button>
              <button
                onClick={() => createMutation.mutate({ dto: duplicateDialog.dto, allowDuplicate: true })}
                disabled={createMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Sim, associar à fatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
