"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventarioService, armazemService, produtoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Loader2, Plus, PlayCircle, CheckCircle2, X } from "lucide-react";
import type { Inventario, InventarioLinha } from "@/shared/types";

const ESTADO_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  em_curso: "Em Curso",
  concluido: "Concluído",
};
const ESTADO_COLOR: Record<string, string> = {
  rascunho: "bg-surface text-ink-mid",
  em_curso: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  concluido: "bg-live-dim text-live",
};

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 sticky top-0 bg-panel">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function InventariosPage() {
  const qc = useQueryClient();
  const [armazemFiltro, setArmazemFiltro] = useState("");
  const [showNovo, setShowNovo] = useState(false);
  const [novoArmazemId, setNovoArmazemId] = useState("");
  const [detalhe, setDetalhe] = useState<Inventario | null>(null);
  const [contagens, setContagens] = useState<Record<string, string>>({});

  const { data: armazens = [] } = useQuery({ queryKey: ["armazens"], queryFn: armazemService.list });
  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list() });
  const { data: inventarios = [], isLoading } = useQuery({
    queryKey: ["inventarios", armazemFiltro],
    queryFn: () => inventarioService.list({ armazem_id: armazemFiltro || undefined }),
  });

  const { data: linhas = [] } = useQuery({
    queryKey: ["inventario-linhas", detalhe?.id],
    queryFn: () => inventarioService.linhas(detalhe!.id),
    enabled: !!detalhe,
  });

  const createMut = useMutation({
    mutationFn: (armazem_id: string) => inventarioService.create(armazem_id),
    onSuccess: () => {
      toast.success("Inventário criado (rascunho)");
      qc.invalidateQueries({ queryKey: ["inventarios"] });
      setShowNovo(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const iniciarMut = useMutation({
    mutationFn: (id: string) => inventarioService.iniciar(id),
    onSuccess: () => {
      toast.success("Inventário iniciado — snapshot do sistema gerado");
      qc.invalidateQueries({ queryKey: ["inventarios"] });
      qc.invalidateQueries({ queryKey: ["inventario-linhas"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const contarMut = useMutation({
    mutationFn: (vars: { id: string; produto_id: string; quantidade_contada: number }) =>
      inventarioService.registarContagem(vars.id, { produto_id: vars.produto_id, quantidade_contada: vars.quantidade_contada }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventario-linhas", detalhe?.id] }),
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const concluirMut = useMutation({
    mutationFn: (id: string) => inventarioService.concluir(id),
    onSuccess: () => {
      toast.success("Inventário concluído — ajustes de stock aplicados");
      qc.invalidateQueries({ queryKey: ["inventarios"] });
      setDetalhe(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  function produtoNome(id: string) {
    const p = produtos.find((x) => x.id === id);
    return p ? `${p.nome} (${p.sku})` : id;
  }
  function armazemNome(id: string) {
    const a = armazens.find((x) => x.id === id);
    return a ? `${a.codigo} — ${a.nome}` : id;
  }

  const todasContadas = linhas.length > 0 && linhas.every((l) => l.quantidade_contada !== null && l.quantidade_contada !== undefined);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Inventários</h1>
        </div>
        <button onClick={() => { setShowNovo(true); setNovoArmazemId(armazens[0]?.id || ""); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo inventário
        </button>
      </div>

      <div className="flex gap-3">
        <select value={armazemFiltro} onChange={(e) => setArmazemFiltro(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
          <option value="">Todos os armazéns</option>
          {armazens.map((a) => <option key={a.id} value={a.id}>{a.codigo} — {a.nome}</option>)}
        </select>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Armazém</th>
              <th className="px-4 py-3">Início</th>
              <th className="px-4 py-3">Fim</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && inventarios.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhum inventário</td></tr>}
            {inventarios.map((inv) => (
              <tr key={inv.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 text-sm">{armazemNome(inv.armazem_id)}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{inv.data_inicio ? new Date(inv.data_inicio).toLocaleString("pt-PT") : "—"}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{inv.data_fim ? new Date(inv.data_fim).toLocaleString("pt-PT") : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[inv.estado]}`}>{ESTADO_LABEL[inv.estado]}</span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {inv.estado === "rascunho" && (
                    <button onClick={() => iniciarMut.mutate(inv.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      <PlayCircle className="h-3.5 w-3.5" /> Iniciar
                    </button>
                  )}
                  {inv.estado === "em_curso" && (
                    <button onClick={() => { setDetalhe(inv); setContagens({}); }} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      Contar itens
                    </button>
                  )}
                  {inv.estado === "concluido" && (
                    <button onClick={() => setDetalhe(inv)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      Ver detalhe
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showNovo} onClose={() => setShowNovo(false)} title="Novo inventário">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Armazém *</label>
            <select value={novoArmazemId} onChange={(e) => setNovoArmazemId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              {armazens.map((a) => <option key={a.id} value={a.id}>{a.codigo} — {a.nome}</option>)}
            </select>
          </div>
          <p className="text-xs text-ink-mid/70">
            Ao iniciar, o sistema regista o saldo actual (snapshot) de cada produto neste armazém.
            A contagem física é depois comparada com esse snapshot, gerando ajustes automáticos de stock.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowNovo(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button onClick={() => novoArmazemId && createMut.mutate(novoArmazemId)} disabled={!novoArmazemId || createMut.isPending}
              className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detalhe} onClose={() => setDetalhe(null)} title={detalhe ? `Contagem — ${armazemNome(detalhe.armazem_id)}` : ""}>
        {detalhe && (
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-ink-mid/70">
                  <th className="py-2">Produto</th>
                  <th className="py-2 text-right">Sistema</th>
                  <th className="py-2 text-right">Contado</th>
                  <th className="py-2 text-right">Divergência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                {linhas.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2">{produtoNome(l.produto_id)}</td>
                    <td className="py-2 text-right tabular-nums">{l.quantidade_sistema}</td>
                    <td className="py-2 text-right">
                      {detalhe.estado === "em_curso" ? (
                        <input
                          type="number" step="0.001" min="0"
                          value={contagens[l.produto_id] ?? (l.quantidade_contada ?? "")}
                          onChange={(e) => setContagens({ ...contagens, [l.produto_id]: e.target.value })}
                          onBlur={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) contarMut.mutate({ id: detalhe.id, produto_id: l.produto_id, quantidade_contada: v });
                          }}
                          className="w-24 text-right border rounded px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20"
                        />
                      ) : (
                        <span className="tabular-nums">{l.quantidade_contada ?? "—"}</span>
                      )}
                    </td>
                    <td className={`py-2 text-right tabular-nums ${l.divergencia && l.divergencia !== 0 ? "font-semibold text-amber-600" : ""}`}>
                      {l.divergencia !== null && l.divergencia !== undefined ? l.divergencia : "—"}
                    </td>
                  </tr>
                ))}
                {linhas.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-ink-mid/70">Sem produtos com saldo neste armazém</td></tr>
                )}
              </tbody>
            </table>

            {detalhe.estado === "em_curso" && (
              <div className="flex justify-end gap-2 pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
                <button
                  onClick={() => concluirMut.mutate(detalhe.id)}
                  disabled={!todasContadas || concluirMut.isPending}
                  title={!todasContadas ? "Conte todos os produtos antes de concluir" : ""}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-live text-white rounded-lg disabled:opacity-50"
                >
                  {concluirMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Concluir inventário
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
