"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caixaService, devolucaoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { Undo2, Loader2, X } from "lucide-react";
import type { Venda, DevolucaoLinhaInDTO } from "@/shared/types";

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

export default function DevolucoesPage() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [devolvendo, setDevolvendo] = useState<Venda | null>(null);
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});
  const [motivos, setMotivos] = useState<Record<string, "normal" | "danificado">>({});
  const [formaDevolucao, setFormaDevolucao] = useState<"numerario" | "credito_cliente" | "troca">("numerario");

  const { data: vendas = [], isLoading } = useQuery({
    queryKey: ["caixa-vendas", "concluida"],
    queryFn: () => caixaService.listVendas({ estado: "concluida" }),
  });
  const { data: devolucoes = [] } = useQuery({ queryKey: ["devolucoes"], queryFn: () => devolucaoService.list() });

  const devolverMut = useMutation({
    mutationFn: () => {
      const linhas: DevolucaoLinhaInDTO[] = devolvendo!.linhas
        .map((l) => ({ produto_id: l.produto_id, quantidade: parseFloat(quantidades[l.id] || "0"), motivo: motivos[l.id] || "normal" }))
        .filter((l) => l.quantidade > 0);
      if (linhas.length === 0) throw new Error("Indique pelo menos uma quantidade a devolver");
      return devolucaoService.create({ venda_id: devolvendo!.id, linhas, forma_devolucao: formaDevolucao });
    },
    onSuccess: () => {
      toast.success("Devolução processada — stock actualizado");
      qc.invalidateQueries({ queryKey: ["devolucoes"] });
      qc.invalidateQueries({ queryKey: ["estoque"] });
      setDevolvendo(null); setQuantidades({}); setMotivos({});
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || e?.message || "Erro"),
  });

  const vendasFiltradas = vendas.filter((v) =>
    !busca || v.numero_proforma?.toLowerCase().includes(busca.toLowerCase()) ||
    v.linhas.some((l) => l.nome_snapshot.toLowerCase().includes(busca.toLowerCase()))
  );

  function openDevolver(v: Venda) {
    setDevolvendo(v);
    setQuantidades({});
    setMotivos({});
    setFormaDevolucao("numerario");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Undo2 className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Devoluções</h1>
      </div>

      <input placeholder="Buscar por nº proforma ou produto…" value={busca} onChange={(e) => setBusca(e.target.value)}
        className="w-full max-w-md px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15 font-semibold">Vendas concluídas</div>
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Proforma</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && vendasFiltradas.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhuma venda encontrada</td></tr>}
            {vendasFiltradas.map((v) => (
              <tr key={v.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-3 font-mono text-sm">{v.numero_proforma}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(v.data).toLocaleDateString("pt-PT")}</td>
                <td className="px-4 py-3 text-sm tabular-nums">{v.total_liquido.toLocaleString("pt-AO")} Kz</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openDevolver(v)} className="text-xs px-3 py-1.5 bg-ink text-white rounded-lg hover:bg-ink/90">
                    Processar devolução
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15 font-semibold">Histórico de devoluções</div>
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20">
            <tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Valor devolvido</th>
              <th className="px-4 py-3">Forma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {devolucoes.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-ink-mid/70">Sem devoluções registadas</td></tr>}
            {devolucoes.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 text-sm text-ink-mid">{new Date(d.data).toLocaleString("pt-PT")}</td>
                <td className="px-4 py-3 text-sm tabular-nums">{d.valor_devolvido.toLocaleString("pt-AO")} Kz</td>
                <td className="px-4 py-3 text-sm">{d.forma_devolucao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!devolvendo} onClose={() => setDevolvendo(null)} title={devolvendo ? `Devolução — ${devolvendo.numero_proforma}` : ""}>
        {devolvendo && (
          <form onSubmit={(e) => { e.preventDefault(); devolverMut.mutate(); }} className="space-y-4">
            <div className="space-y-3">
              {devolvendo.linhas.map((l) => (
                <div key={l.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 pb-3 last:border-0">
                  <p className="text-sm font-medium">{l.nome_snapshot} <span className="text-ink-mid/70">(vendido: {l.quantidade})</span></p>
                  <div className="flex gap-2 mt-2">
                    <input type="number" step="0.001" min="0" max={l.quantidade} placeholder="Qtd. a devolver"
                      value={quantidades[l.id] || ""} onChange={(e) => setQuantidades({ ...quantidades, [l.id]: e.target.value })}
                      className="w-32 border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
                    <select value={motivos[l.id] || "normal"} onChange={(e) => setMotivos({ ...motivos, [l.id]: e.target.value as any })}
                      className="border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                      <option value="normal">Normal (volta ao stock)</option>
                      <option value="danificado">Danificado (não volta ao stock)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Forma de devolução</label>
              <select value={formaDevolucao} onChange={(e) => setFormaDevolucao(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="numerario">Numerário</option>
                <option value="credito_cliente">Crédito ao cliente</option>
                <option value="troca">Troca</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDevolvendo(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={devolverMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
                {devolverMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar devolução"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
