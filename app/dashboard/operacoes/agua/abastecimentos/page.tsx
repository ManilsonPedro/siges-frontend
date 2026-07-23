"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesAguaService, operacoesEstacaoService } from "@/shared/services/operacoes.service";
import { fornecedorService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Droplets, Plus, X, Loader2, Paperclip, FileDown } from "lucide-react";
import Link from "next/link";
import { AnexosUploader } from "@/shared/ui/anexos-uploader";

const TIPOS_DOCUMENTO_GERAR = [
  { value: "proforma", label: "Proforma" },
  { value: "fatura", label: "Fatura" },
  { value: "fatura_recibo", label: "Fatura-Recibo" },
  { value: "recibo", label: "Recibo" },
  { value: "ordem_recepcao", label: "Ordem de Receção" },
];

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const ESTADO_LABEL: Record<string, string> = {
  registado: "Registado", aprovado: "Aprovado", documentado: "Documentado", pago: "Pago", concluido: "Concluído",
};
const ESTADO_COLOR: Record<string, string> = {
  registado: "bg-ink/10 text-ink-mid", aprovado: "bg-amber-100 text-amber-700",
  documentado: "bg-indigo-100 text-indigo-700", pago: "bg-live-dim text-live", concluido: "bg-live-dim text-live",
};
const ESTADOS_ORDEM = ["registado", "aprovado", "documentado", "pago", "concluido"];

export default function AbastecimentosAguaPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState(false);
  const [docsId, setDocsId] = useState<string | null>(null);

  const [filtros, setFiltros] = useState({
    tanque_agua_id: "", fornecedor_id: "", filial_id: "", estado: "",
    data_inicio: "", data_fim: "",
  });

  const { data: abastecimentos = [], isLoading } = useQuery({
    queryKey: ["agua-abastecimentos", filtros],
    queryFn: () => operacoesAguaService.listAbastecimentos({
      tanque_agua_id: filtros.tanque_agua_id || undefined,
      fornecedor_id: filtros.fornecedor_id || undefined,
      filial_id: filtros.filial_id || undefined,
      estado: filtros.estado || undefined,
      data_inicio: filtros.data_inicio || undefined,
      data_fim: filtros.data_fim || undefined,
    }),
  });
  const { data: tanques = [] } = useQuery({ queryKey: ["agua-tanques"], queryFn: operacoesAguaService.listTanques });
  const { data: fornecedores = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: fornecedorService.list });
  const { data: filiais = [] } = useQuery({ queryKey: ["filiais"], queryFn: operacoesEstacaoService.listFiliais });

  const [form, setForm] = useState({
    tanque_agua_id: "", fornecedor_id: "", filial_id: "",
    quantidade_litros: 0, valor_por_litro: 0, metodo_pagamento: "", observacoes: "",
  });
  const [novoFornecedorForm, setNovoFornecedorForm] = useState({ nome: "", nif: "", telefone: "", tipo_pessoa: "empresa" });

  const createFornecedorMut = useMutation({
    mutationFn: () => fornecedorService.create({ ...novoFornecedorForm, estado: "ativo" } as any),
    onSuccess: (f) => {
      toast.success("Fornecedor criado");
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
      setForm((s) => ({ ...s, fornecedor_id: f.id }));
      setNovoFornecedor(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao criar fornecedor"),
  });

  const createMut = useMutation({
    mutationFn: () => operacoesAguaService.createAbastecimento({
      tanque_agua_id: form.tanque_agua_id, fornecedor_id: form.fornecedor_id,
      filial_id: form.filial_id || undefined,
      quantidade_litros: form.quantidade_litros, valor_por_litro: form.valor_por_litro,
      metodo_pagamento: form.metodo_pagamento || undefined, observacoes: form.observacoes || undefined,
    }),
    onSuccess: () => {
      toast.success("Abastecimento registado");
      qc.invalidateQueries({ queryKey: ["agua-abastecimentos"] });
      qc.invalidateQueries({ queryKey: ["agua-tanques"] });
      setShowForm(false);
      setForm({ tanque_agua_id: "", fornecedor_id: "", filial_id: "", quantidade_litros: 0, valor_por_litro: 0, metodo_pagamento: "", observacoes: "" });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const estadoMut = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => operacoesAguaService.atualizarEstadoAbastecimento(id, estado),
    onSuccess: () => { toast.success("Estado actualizado"); qc.invalidateQueries({ queryKey: ["agua-abastecimentos"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const gerarDocMut = useMutation({
    mutationFn: ({ id, tipo }: { id: string; tipo: string }) => operacoesAguaService.gerarDocumentoAbastecimento(id, tipo),
    onSuccess: () => {
      toast.success("Documento gerado");
      qc.invalidateQueries({ queryKey: ["agua-abastecimentos"] });
      qc.invalidateQueries({ queryKey: ["anexos", "abastecimento_agua", docsId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao gerar documento"),
  });

  const custoTotal = form.quantidade_litros * form.valor_por_litro;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="h-7 w-7 text-ink" />
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-white">Abastecimentos de Água</h1>
            <p className="text-sm text-ink-mid/70">
              <Link href="/dashboard/operacoes/agua" className="hover:underline">← Gestão da Água</Link>
            </p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo abastecimento
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <select value={filtros.tanque_agua_id} onChange={(e) => setFiltros({ ...filtros, tanque_agua_id: e.target.value })}
          className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
          <option value="">Todos os tanques</option>
          {tanques.map((t) => <option key={t.id} value={t.id}>{t.codigo}</option>)}
        </select>
        <select value={filtros.fornecedor_id} onChange={(e) => setFiltros({ ...filtros, fornecedor_id: e.target.value })}
          className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
          <option value="">Todos os fornecedores</option>
          {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        {filiais.length > 0 && (
          <select value={filtros.filial_id} onChange={(e) => setFiltros({ ...filtros, filial_id: e.target.value })}
            className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
            <option value="">Todas as filiais</option>
            {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        )}
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
          <option value="">Todos os estados</option>
          {ESTADOS_ORDEM.map((e) => <option key={e} value={e}>{ESTADO_LABEL[e]}</option>)}
        </select>
        <input type="date" value={filtros.data_inicio} onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
          className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        <input type="date" value={filtros.data_fim} onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
          className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
      </div>

      {abastecimentos.length > 0 && (
        <p className="text-sm text-ink-mid/70">
          {abastecimentos.length} abastecimento(s) · Total: {abastecimentos.reduce((s, a) => s + a.quantidade_litros, 0).toLocaleString("pt-AO")} L ·{" "}
          {abastecimentos.reduce((s, a) => s + a.custo_total, 0).toLocaleString("pt-AO")} Kz
        </p>
      )}

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Nº</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Tanque</th>
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3 text-right">Quantidade</th>
              <th className="px-4 py-3 text-right">Custo Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Documentos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={8} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && abastecimentos.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-ink-mid/70">Nenhum abastecimento registado</td></tr>}
            {abastecimentos.map((a) => {
              const tanque = tanques.find((t) => t.id === a.tanque_agua_id);
              const fornecedor = fornecedores.find((f) => f.id === a.fornecedor_id);
              const proximoEstado = ESTADOS_ORDEM[ESTADOS_ORDEM.indexOf(a.estado) + 1];
              return (
                <tr key={a.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                  <td className="px-4 py-3 font-mono text-xs">{a.numero || "—"}</td>
                  <td className="px-4 py-3 text-ink-mid">{new Date(a.data).toLocaleDateString("pt-AO")}</td>
                  <td className="px-4 py-3">{tanque?.codigo || "—"}</td>
                  <td className="px-4 py-3">{fornecedor?.nome || "—"}</td>
                  <td className="px-4 py-3 text-right">{a.quantidade_litros.toLocaleString("pt-AO")} L</td>
                  <td className="px-4 py-3 text-right font-semibold">{a.custo_total.toLocaleString("pt-AO")} Kz</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_COLOR[a.estado]}`}>{ESTADO_LABEL[a.estado]}</span>
                      {proximoEstado && (
                        <button
                          onClick={() => estadoMut.mutate({ id: a.id, estado: proximoEstado })}
                          disabled={estadoMut.isPending}
                          className="text-xs text-ink hover:underline disabled:opacity-50"
                        >
                          → {ESTADO_LABEL[proximoEstado]}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDocsId(a.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface dark:hover:bg-ink-ghost/20">
                      <Paperclip className="h-3.5 w-3.5" /> Documentos
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo abastecimento de água">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tanque *</label>
            <select value={form.tanque_agua_id} onChange={(e) => setForm({ ...form, tanque_agua_id: e.target.value })} required
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>
              {tanques.map((t) => <option key={t.id} value={t.id}>{t.codigo} — {t.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fornecedor *</label>
            {!novoFornecedor ? (
              <div className="flex gap-2">
                <select value={form.fornecedor_id} onChange={(e) => setForm({ ...form, fornecedor_id: e.target.value })} required
                  className="flex-1 border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                  <option value="">Seleccionar…</option>
                  {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
                <button type="button" onClick={() => setNovoFornecedor(true)} className="px-3 py-2 border rounded-lg text-sm whitespace-nowrap">
                  + Novo
                </button>
              </div>
            ) : (
              <div className="space-y-2 border rounded-lg p-3 dark:border-ink-ghost/20">
                <input placeholder="Nome *" value={novoFornecedorForm.nome} onChange={(e) => setNovoFornecedorForm({ ...novoFornecedorForm, nome: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                <input placeholder="NIF *" value={novoFornecedorForm.nif} onChange={(e) => setNovoFornecedorForm({ ...novoFornecedorForm, nif: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                <input placeholder="Telefone" value={novoFornecedorForm.telefone} onChange={(e) => setNovoFornecedorForm({ ...novoFornecedorForm, telefone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                <select value={novoFornecedorForm.tipo_pessoa} onChange={(e) => setNovoFornecedorForm({ ...novoFornecedorForm, tipo_pessoa: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                  <option value="empresa">Empresa</option>
                  <option value="singular">Pessoa Singular</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setNovoFornecedor(false)} className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button>
                  <button type="button" onClick={() => createFornecedorMut.mutate()} disabled={!novoFornecedorForm.nome || !novoFornecedorForm.nif || createFornecedorMut.isPending}
                    className="px-3 py-1.5 text-sm bg-ink text-white rounded-lg disabled:opacity-50">
                    {createFornecedorMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Criar fornecedor"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {filiais.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Filial</label>
              <select value={form.filial_id} onChange={(e) => setForm({ ...form, filial_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="">— Sem filial —</option>
                {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1">Quantidade (L) *</label>
              <input type="number" min={0.01} step="0.01" value={form.quantidade_litros || ""} required
                onChange={(e) => setForm({ ...form, quantidade_litros: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
            <div>
              <label className="block text-xs mb-1">Valor por Litro (Kz) *</label>
              <input type="number" min={0} step="0.0001" value={form.valor_por_litro || ""} required
                onChange={(e) => setForm({ ...form, valor_por_litro: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
          </div>
          {custoTotal > 0 && <p className="text-sm text-ink-mid">Custo total: <strong>{custoTotal.toLocaleString("pt-AO")} Kz</strong></p>}

          <div>
            <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
            <input value={form.metodo_pagamento} onChange={(e) => setForm({ ...form, metodo_pagamento: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" placeholder="Transferência, numerário…" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending || !form.tanque_agua_id || !form.fornecedor_id}
              className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registar"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!docsId} onClose={() => setDocsId(null)} title="Documentos do abastecimento">
        {docsId && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-ink-mid/70 mb-2">Gerar documento automaticamente</p>
              <div className="flex flex-wrap gap-2">
                {TIPOS_DOCUMENTO_GERAR.map((t) => (
                  <button key={t.value}
                    onClick={() => gerarDocMut.mutate({ id: docsId, tipo: t.value })}
                    disabled={gerarDocMut.isPending}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border rounded-lg hover:bg-surface dark:hover:bg-ink-ghost/20 disabled:opacity-50">
                    <FileDown className="h-3.5 w-3.5" /> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <AnexosUploader entityType="abastecimento_agua" entityId={docsId} />
          </div>
        )}
      </Modal>
    </div>
  );
}
