"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restauracaoBaseService } from "@/shared/services/restauracao.service";
import { armazemService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Plus, X, Loader2, Trash2 } from "lucide-react";
import type { Comanda } from "@/shared/types";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20 sticky top-0 bg-panel">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const ESTADO_COLOR: Record<string, string> = {
  aberta: "bg-amber-100 text-amber-700", fechada: "bg-ink/10 text-ink", paga: "bg-live-dim text-live", cancelada: "bg-danger/10 text-danger",
};

export default function ComandasPage() {
  const qc = useQueryClient();
  const [showNova, setShowNova] = useState(false);
  const [novaMesaId, setNovaMesaId] = useState("");
  const [detalhe, setDetalhe] = useState<Comanda | null>(null);
  const [itemId, setItemId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [armazemFechar, setArmazemFechar] = useState("");

  const { data: mesas = [] } = useQuery({ queryKey: ["mesas"], queryFn: restauracaoBaseService.listMesas });
  const { data: itens = [] } = useQuery({ queryKey: ["itens-menu"], queryFn: () => restauracaoBaseService.listItensMenu() });
  const { data: armazens = [] } = useQuery({ queryKey: ["armazens"], queryFn: armazemService.list });
  const { data: comandas = [], isLoading } = useQuery({ queryKey: ["comandas"], queryFn: () => restauracaoBaseService.listComandas() });

  const createMut = useMutation({
    mutationFn: () => restauracaoBaseService.createComanda({ mesa_id: novaMesaId || undefined }),
    onSuccess: () => { toast.success("Comanda aberta"); qc.invalidateQueries({ queryKey: ["comandas"] }); qc.invalidateQueries({ queryKey: ["mesas"] }); setShowNova(false); },
  });
  const addLinhaMut = useMutation({
    mutationFn: () => restauracaoBaseService.adicionarLinha(detalhe!.id, { item_id: itemId, quantidade }),
    onSuccess: (updated) => { setDetalhe(updated); qc.invalidateQueries({ queryKey: ["comandas"] }); setItemId(""); setQuantidade(1); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const cancelarLinhaMut = useMutation({
    mutationFn: (linhaId: string) => restauracaoBaseService.cancelarLinha(detalhe!.id, linhaId),
    onSuccess: (updated) => { setDetalhe(updated); qc.invalidateQueries({ queryKey: ["comandas"] }); },
  });
  const fecharMut = useMutation({
    mutationFn: () => restauracaoBaseService.fecharComanda(detalhe!.id, armazemFechar),
    onSuccess: () => { toast.success("Comanda fechada — venda gerada"); qc.invalidateQueries({ queryKey: ["comandas"] }); qc.invalidateQueries({ queryKey: ["mesas"] }); setDetalhe(null); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  function mesaNumero(id?: string | null) { return mesas.find((m) => m.id === id)?.numero || "Balcão"; }
  function itemNome(id: string) { return itens.find((i) => i.id === id)?.nome || id; }

  const total = detalhe ? detalhe.linhas.filter((l) => l.estado !== "cancelado").reduce((s, l) => s + l.preco_snapshot * l.quantidade, 0) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Comandas</h1>
        </div>
        <button onClick={() => { setShowNova(true); setNovaMesaId(""); }} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Abrir comanda
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && comandas.length === 0 && <p className="col-span-3 text-center text-ink-mid/70 py-8">Nenhuma comanda</p>}
        {comandas.map((c) => (
          <div key={c.id} onClick={() => { setDetalhe(c); setArmazemFechar(armazens[0]?.id || ""); }} className="bg-panel dark:bg-panel rounded-xl shadow p-4 cursor-pointer hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Mesa {mesaNumero(c.mesa_id)}</span>
              <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[c.estado]}`}>{c.estado}</span>
            </div>
            <p className="text-sm text-ink-mid">{c.linhas.length} linha(s)</p>
          </div>
        ))}
      </div>

      <Modal open={showNova} onClose={() => setShowNova(false)} title="Abrir comanda">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Mesa (opcional)</label>
            <select value={novaMesaId} onChange={(e) => setNovaMesaId(e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Balcão / Take-away</option>{mesas.filter((m) => m.estado === "livre").map((m) => <option key={m.id} value={m.id}>Mesa {m.numero}</option>)}
            </select></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowNova(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Abrir"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detalhe} onClose={() => setDetalhe(null)} title={detalhe ? `Comanda — Mesa ${mesaNumero(detalhe.mesa_id)}` : ""}>
        {detalhe && (
          <div className="space-y-4">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                {detalhe.linhas.map((l) => (
                  <tr key={l.id} className={l.estado === "cancelado" ? "opacity-40 line-through" : ""}>
                    <td className="py-2">{l.nome_snapshot} × {l.quantidade}</td>
                    <td className="py-2 text-right tabular-nums">{(l.preco_snapshot * l.quantidade).toLocaleString("pt-AO")} Kz</td>
                    <td className="py-2 text-right">
                      {detalhe.estado === "aberta" && l.estado !== "cancelado" && (
                        <button onClick={() => cancelarLinhaMut.mutate(l.id)} className="p-1 text-ink-mid/70 hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-right font-semibold">Total: {total.toLocaleString("pt-AO")} Kz</p>

            {detalhe.estado === "aberta" && (
              <>
                <div className="flex gap-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15 pt-4">
                  <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                    <option value="">Item…</option>{itens.map((i) => <option key={i.id} value={i.id}>{i.nome} ({i.preco} Kz)</option>)}
                  </select>
                  <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} className="w-20 border rounded-lg px-2 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                  <button onClick={() => itemId && addLinhaMut.mutate()} disabled={!itemId || addLinhaMut.isPending} className="px-3 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
                    {addLinhaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
                  <select value={armazemFechar} onChange={(e) => setArmazemFechar(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                    {armazens.map((a) => <option key={a.id} value={a.id}>{a.codigo} — {a.nome}</option>)}
                  </select>
                  <button onClick={() => fecharMut.mutate()} disabled={fecharMut.isPending || detalhe.linhas.filter((l) => l.estado !== "cancelado").length === 0}
                    className="px-4 py-2 bg-live text-white rounded-lg disabled:opacity-50">
                    {fecharMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fechar comanda"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
