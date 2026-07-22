"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contasPagarService } from "@/shared/services/financeiro2.service";
import { fornecedorService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { TrendingDown, Plus, X, Loader2 } from "lucide-react";

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

const ESTADO_COLOR: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700", parcial: "bg-ink/10 text-ink",
  pago: "bg-live-dim text-live", atrasado: "bg-danger/10 text-danger", cancelado: "bg-surface text-ink-mid",
};

export default function ContasPagarPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fornecedor_id: "", valor: 0, data_vencimento: "" });

  const { data: fornecedores = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: fornecedorService.list });
  const { data: contas = [], isLoading } = useQuery({ queryKey: ["contas-pagar"], queryFn: () => contasPagarService.list() });

  const createMut = useMutation({
    mutationFn: () => contasPagarService.create({ ...form, data_vencimento: new Date(form.data_vencimento).toISOString() }),
    onSuccess: () => { toast.success("Conta a pagar criada"); qc.invalidateQueries({ queryKey: ["contas-pagar"] }); setShowForm(false); },
  });
  const pagarMut = useMutation({
    mutationFn: (vars: { id: string; valor: number }) => contasPagarService.registarPagamento(vars.id, vars.valor),
    onSuccess: () => { toast.success("Pagamento registado"); qc.invalidateQueries({ queryKey: ["contas-pagar"] }); },
  });

  function fornecedorNome(id: string) { return fornecedores.find((f) => f.id === id)?.nome || id; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingDown className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Contas a Pagar</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova conta
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Fornecedor</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Vencimento</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && contas.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhuma conta a pagar</td></tr>}
            {contas.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-sm">{fornecedorNome(c.fornecedor_id)}</td>
                <td className="px-4 py-3 text-sm tabular-nums">{c.valor.toLocaleString("pt-AO")} Kz</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(c.data_vencimento).toLocaleDateString("pt-PT")}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[c.estado]}`}>{c.estado}</span></td>
                <td className="px-4 py-3 text-right">
                  {(c.estado === "pendente" || c.estado === "parcial") && (
                    <button onClick={() => pagarMut.mutate({ id: c.id, valor: c.valor })} className="text-xs px-2 py-1 border rounded-lg hover:bg-surface">Registar pagamento</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova conta a pagar">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Fornecedor *</label>
            <select value={form.fornecedor_id} onChange={(e) => setForm({ ...form, fornecedor_id: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>{fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Valor (Kz) *</label><input type="number" min={0} value={form.valor} onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Vencimento *</label><input type="date" value={form.data_vencimento} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
