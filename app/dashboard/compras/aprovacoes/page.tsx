"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requisicaoService, produtoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Loader2, X } from "lucide-react";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AprovacoesPage() {
  const qc = useQueryClient();
  const [rejeitando, setRejeitando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list() });
  const { data: pendentes = [], isLoading } = useQuery({
    queryKey: ["requisicoes", "submetida"],
    queryFn: () => requisicaoService.list("submetida"),
  });

  const aprovarMut = useMutation({
    mutationFn: (id: string) => requisicaoService.aprovar(id),
    onSuccess: () => { toast.success("Requisição aprovada"); qc.invalidateQueries({ queryKey: ["requisicoes"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const rejeitarMut = useMutation({
    mutationFn: () => requisicaoService.rejeitar(rejeitando!, motivo),
    onSuccess: () => {
      toast.success("Requisição rejeitada");
      qc.invalidateQueries({ queryKey: ["requisicoes"] });
      setRejeitando(null); setMotivo("");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  function produtoNome(id?: string | null) {
    if (!id) return "—";
    const p = produtos.find((x) => x.id === id);
    return p ? `${p.nome} (${p.sku})` : id;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Aprovações de Compra</h1>
        <span className="text-sm text-ink-mid/70">({pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""})</span>
      </div>

      <div className="space-y-3">
        {isLoading && <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>}
        {!isLoading && pendentes.length === 0 && (
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-8 text-center text-ink-mid/70">
            Nenhuma requisição pendente de aprovação
          </div>
        )}
        {pendentes.map((r) => (
          <div key={r.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-ink dark:text-white">{r.departamento || "Sem departamento"}</p>
              <p className="text-sm text-ink-mid mt-1">
                {r.linhas.map((l) => `${produtoNome(l.produto_id)} × ${l.quantidade}`).join(", ")}
              </p>
              {r.justificativa && <p className="text-xs text-ink-mid/70 mt-1 italic">{r.justificativa}</p>}
              <p className="text-xs text-ink-mid/50 mt-2">{new Date(r.data).toLocaleDateString("pt-PT")}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => aprovarMut.mutate(r.id)} disabled={aprovarMut.isPending}
                className="inline-flex items-center gap-1 px-3 py-2 bg-live text-white rounded-lg text-sm hover:bg-live/90 disabled:opacity-50">
                <CheckCircle className="h-4 w-4" /> Aprovar
              </button>
              <button onClick={() => setRejeitando(r.id)}
                className="inline-flex items-center gap-1 px-3 py-2 border border-danger text-danger rounded-lg text-sm hover:bg-danger/10">
                <XCircle className="h-4 w-4" /> Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!rejeitando} onClose={() => setRejeitando(null)} title="Rejeitar requisição">
        <form onSubmit={(e) => { e.preventDefault(); rejeitarMut.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Motivo *</label>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setRejeitando(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={rejeitarMut.isPending} className="px-4 py-2 bg-danger text-white rounded-lg disabled:opacity-50">
              {rejeitarMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rejeitar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
