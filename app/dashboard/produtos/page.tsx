"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produtoService } from "@/shared/services/financeiro.service";
import { formatDate } from "@/shared/utils";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Search, Tag, FolderPlus, Check } from "lucide-react";
import type { Produto, CreateProdutoDTO } from "@/shared/types";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { usePermissions } from "@/shared/hooks/use-permissions";

const UNIDADES = ["L", "kg", "m3", "un", "cx"] as const;

const schema = z.object({
  sku: z.string().min(1, "SKU obrigatório").max(50),
  nome: z.string().min(1, "Nome obrigatório"),
  marca: z.string().optional(),
  categoria_id: z.string().optional(),
  unidade_medida: z.enum(UNIDADES),
  preco_base: z.coerce.number().min(0, "Preço deve ser ≥ 0"),
  iva_pct: z.coerce.number().min(0).max(100),
  descricao: z.string().optional(),
  activo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 sticky top-0 bg-panel dark:bg-panel">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function ProdutosPage() {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const podeEditar = has("produtos.editar");

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "ativos" | "inativos">("ativos");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Produto | null>(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: () => produtoService.list(),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["produtos", "categorias"],
    queryFn: produtoService.listCategorias,
  });

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (filtroActivo === "ativos" && !p.activo) return false;
      if (filtroActivo === "inativos" && p.activo) return false;
      if (filtroCategoria && p.categoria_id !== filtroCategoria) return false;
      if (q && !(
        p.nome.toLowerCase().includes(q)
        || p.sku.toLowerCase().includes(q)
        || (p.marca?.toLowerCase().includes(q) ?? false)
      )) return false;
      return true;
    });
  }, [produtos, busca, filtroCategoria, filtroActivo]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { unidade_medida: "un", preco_base: 0, iva_pct: 14, activo: true },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateProdutoDTO) => produtoService.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["produtos"] }); toast.success("Produto criado"); closeModal(); },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao criar produto");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateProdutoDTO> }) => produtoService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["produtos"] }); toast.success("Produto actualizado"); closeModal(); },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao actualizar produto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => produtoService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["produtos"] }); toast.success("Produto eliminado"); },
    onError: () => toast.error("Erro ao eliminar produto"),
  });

  const createCategoriaMutation = useMutation({
    mutationFn: (nome: string) => produtoService.createCategoria({ nome }),
    onSuccess: (nova) => {
      qc.invalidateQueries({ queryKey: ["produtos", "categorias"] });
      toast.success(`Categoria "${nova.nome}" criada`);
      // Auto-selecciona a categoria recém-criada no form
      setValue("categoria_id", nova.id, { shouldDirty: true });
      setShowCategoriaForm(false);
      setNovaCategoriaNome("");
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao criar categoria");
    },
  });

  const onSubmit = (data: FormData) => {
    const dto: CreateProdutoDTO = {
      sku: data.sku,
      nome: data.nome,
      marca: data.marca || undefined,
      categoria_id: data.categoria_id || null,
      unidade_medida: data.unidade_medida,
      preco_base: data.preco_base,
      iva_pct: data.iva_pct,
      descricao: data.descricao || undefined,
      activo: data.activo,
    };
    if (editing) updateMutation.mutate({ id: editing.id, dto });
    else createMutation.mutate(dto);
  };

  const openEdit = (p: Produto) => {
    setEditing(p);
    reset({
      sku: p.sku, nome: p.nome,
      marca: p.marca || "",
      categoria_id: p.categoria_id || "",
      unidade_medida: p.unidade_medida,
      preco_base: Number(p.preco_base),
      iva_pct: Number(p.iva_pct),
      descricao: p.descricao || "",
      activo: p.activo,
    });
  };

  const closeModal = () => {
    setShowForm(false);
    setEditing(null);
    setShowCategoriaForm(false);
    setNovaCategoriaNome("");
    reset({ unidade_medida: "un", preco_base: 0, iva_pct: 14, activo: true });
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;
  const categoriaNome = (id?: string | null) => categorias.find((c) => c.id === id)?.nome || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Produtos</h1>
          <p className="text-ink-mid/70 text-sm">
            {produtos.length} produto(s) · marca KITOKA — Aquasan Angola
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-live hover:bg-live/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mid/50" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, SKU ou marca…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-ink-ghost/20 text-sm text-ink dark:text-white"
          />
        </div>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white">
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select value={filtroActivo} onChange={(e) => setFiltroActivo(e.target.value as "todos" | "ativos" | "inativos")} className="rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white">
          <option value="ativos">Apenas activos</option>
          <option value="inativos">Apenas inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50">A carregar…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-ink-mid/50">Nenhum produto encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-gray-800/50">
                  {["SKU", "Nome", "Marca", "Categoria", "Unid.", "Preço base", "IVA %", "Estado", "Acções"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 hover:bg-surface dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-ink dark:text-white">{p.nome}</td>
                    <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/60">
                      {p.marca === "KITOKA" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-live-dim text-live">
                          <Tag className="h-3 w-3" /> KITOKA
                        </span>
                      ) : (p.marca || "—")}
                    </td>
                    <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/60">{categoriaNome(p.categoria_id)}</td>
                    <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/60">{p.unidade_medida}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{Number(p.preco_base).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz</td>
                    <td className="px-4 py-3 text-ink-mid dark:text-ink-mid/60">{Number(p.iva_pct).toFixed(2)}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.activo ? "bg-live/10 text-live" : "bg-surface text-ink-mid"}`}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {podeEditar && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="text-live hover:text-live/80 p-1 rounded" title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(p)} className="text-danger hover:text-danger/80 p-1 rounded" title="Eliminar">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm || !!editing} onClose={closeModal} title={editing ? "Editar Produto" : "Novo Produto"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU *</label>
              <input {...register("sku")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white" placeholder="KTK-HIPO-12-L" />
              {errors.sku && <p className="text-danger text-xs mt-1">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
              <input {...register("marca")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white" placeholder="KITOKA" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
            <input {...register("nome")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white" />
            {errors.nome && <p className="text-danger text-xs mt-1">{errors.nome.message}</p>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade</label>
              <select {...register("unidade_medida")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white">
                {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço base (Kz)</label>
              <input type="number" step="0.01" {...register("preco_base")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white" />
              {errors.preco_base && <p className="text-danger text-xs mt-1">{errors.preco_base.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IVA %</label>
              <input type="number" step="0.01" {...register("iva_pct")} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              {showCategoriaForm ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    type="text"
                    value={novaCategoriaNome}
                    onChange={(e) => setNovaCategoriaNome(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (novaCategoriaNome.trim()) createCategoriaMutation.mutate(novaCategoriaNome.trim());
                      } else if (e.key === "Escape") {
                        setShowCategoriaForm(false); setNovaCategoriaNome("");
                      }
                    }}
                    placeholder="Nome da categoria…"
                    className="flex-1 min-w-0 rounded-lg border border-emerald-400 dark:border-emerald-500 px-2 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => novaCategoriaNome.trim() && createCategoriaMutation.mutate(novaCategoriaNome.trim())}
                    disabled={!novaCategoriaNome.trim() || createCategoriaMutation.isPending}
                    className="px-2 bg-live hover:bg-live/90 disabled:opacity-50 text-white rounded-lg"
                    title="Guardar categoria"
                  >
                    {createCategoriaMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCategoriaForm(false); setNovaCategoriaNome(""); }}
                    className="px-2 bg-ink-ghost/30 dark:bg-ink-ghost/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                    title="Cancelar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <select {...register("categoria_id")} className="flex-1 min-w-0 rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white">
                    <option value="">(sem categoria)</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoriaForm(true)}
                    className="px-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    title="Nova categoria"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea {...register("descricao")} rows={3} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" {...register("activo")} className="rounded" />
            Produto activo
          </label>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isMutating} className="flex-1 flex items-center justify-center gap-2 bg-live hover:bg-live/90 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
              {isMutating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editing ? "Actualizar" : "Criar"}
            </button>
            <button type="button" onClick={closeModal} className="flex-1 border border-ink-ghost/80 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-surface dark:hover:bg-ink-ghost/20">Cancelar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Produto"
        message={`Tem a certeza que pretende eliminar o produto "${deleteTarget?.nome}" (SKU ${deleteTarget?.sku})? Será movido para a lixeira.`}
        confirmLabel="Eliminar"
        onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
