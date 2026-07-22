"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aprovacoesService } from "@/shared/services/financeiro2.service";
import { useState } from "react";
import { toast } from "sonner";
import { ClipboardCheck, CheckCircle2, XCircle, Loader2, X } from "lucide-react";

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

export default function AprovacoesFinanceirasPage() {
  const qc = useQueryClient();
  const [rejeitando, setRejeitando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

  const { data: pendentes = [], isLoading } = useQuery({ queryKey: ["aprovacoes", "pendente"], queryFn: () => aprovacoesService.list("pendente") });

  const aprovarMut = useMutation({
    mutationFn: (id: string) => aprovacoesService.aprovar(id),
    onSuccess: () => { toast.success("Aprovado"); qc.invalidateQueries({ queryKey: ["aprovacoes"] }); },
  });
  const rejeitarMut = useMutation({
    mutationFn: () => aprovacoesService.rejeitar(rejeitando!, motivo),
    onSuccess: () => { toast.success("Rejeitado"); qc.invalidateQueries({ queryKey: ["aprovacoes"] }); setRejeitando(null); setMotivo(""); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Aprovações Financeiras</h1>
      </div>

      <div className="space-y-3">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && pendentes.length === 0 && <p className="text-center text-ink-mid/70 py-8">Nenhuma aprovação pendente</p>}
        {pendentes.map((a) => (
          <div key={a.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Movimento {a.movimento_id.slice(0, 8)}</p>
              <p className="text-sm text-ink-mid">{a.valor.toLocaleString("pt-AO")} Kz</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => aprovarMut.mutate(a.id)} className="inline-flex items-center gap-1 px-3 py-2 bg-live text-white rounded-lg text-sm hover:bg-live/90">
                <CheckCircle2 className="h-4 w-4" /> Aprovar
              </button>
              <button onClick={() => setRejeitando(a.id)} className="inline-flex items-center gap-1 px-3 py-2 border border-danger text-danger rounded-lg text-sm hover:bg-danger/10">
                <XCircle className="h-4 w-4" /> Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!rejeitando} onClose={() => setRejeitando(null)} title="Rejeitar aprovação">
        <form onSubmit={(e) => { e.preventDefault(); rejeitarMut.mutate(); }} className="space-y-4">
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setRejeitando(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={rejeitarMut.isPending} className="px-4 py-2 bg-danger text-white rounded-lg disabled:opacity-50">{rejeitarMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rejeitar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
