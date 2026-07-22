"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { armazemService, estoqueService, produtoService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, Plus, Minus, RotateCcw, Loader2, History, FileSpreadsheet } from "lucide-react";

type Tab = "historico" | "entrada" | "saida" | "transferencia";

const TIPO_LABEL: Record<string, string> = {
  entrada_compra: "Entrada (compra)",
  entrada_producao: "Entrada (produção)",
  entrada_ajuste: "Entrada (ajuste)",
  saida_venda: "Saída (venda)",
  saida_perda: "Saída (perda)",
  saida_ajuste: "Saída (ajuste)",
  transferencia: "Transferência",
};

export default function MovimentosPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("historico");

  const { data: armazens = [] } = useQuery({ queryKey: ["armazens"], queryFn: armazemService.list });
  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list() });
  const { data: movs = [], isLoading } = useQuery({
    queryKey: ["estoque", "movimentos"],
    queryFn: () => estoqueService.movimentos({ page_size: 100 }),
  });

  // forms (estado simples)
  const [entrada, setEntrada] = useState({ produto_id: "", armazem_id: "", quantidade: 0, custo_unitario: 0, tipo: "entrada_compra" as const, motivo: "" });
  const [saida, setSaida] = useState({ produto_id: "", armazem_id: "", quantidade: 0, tipo: "saida_perda" as const, motivo: "" });
  const [transf, setTransf] = useState({ produto_id: "", armazem_origem_id: "", armazem_destino_id: "", quantidade: 0, motivo: "" });

  const refresh = () => qc.invalidateQueries({ queryKey: ["estoque"] });

  const entradaMut = useMutation({
    mutationFn: () => estoqueService.entrada(entrada),
    onSuccess: () => { toast.success("Entrada registada"); refresh(); setTab("historico"); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const saidaMut = useMutation({
    mutationFn: () => estoqueService.saida(saida),
    onSuccess: () => { toast.success("Saída registada"); refresh(); setTab("historico"); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const transfMut = useMutation({
    mutationFn: () => estoqueService.transferencia(transf),
    onSuccess: () => { toast.success("Transferência registada"); refresh(); setTab("historico"); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const estornoMut = useMutation({
    mutationFn: (id: string) => estoqueService.estornar(id),
    onSuccess: () => { toast.success("Estornado"); refresh(); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const Tabs = (
    <div className="flex flex-wrap gap-1 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
      {[
        ["historico", History, "Histórico"],
        ["entrada", Plus, "Entrada"],
        ["saida", Minus, "Saída"],
        ["transferencia", ArrowLeftRight, "Transferência"],
      ].map(([k, Icon, label]: any) => (
        <button key={k} onClick={() => setTab(k)}
          className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 -mb-px transition
            ${tab === k ? "border-ink text-ink font-medium" : "border-transparent text-ink-mid/70 hover:text-gray-700"}`}>
          <Icon className="h-4 w-4" /> {label}
        </button>
      ))}
    </div>
  );

  const Select = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} required
      className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  const prodOpts = produtos.map((p) => ({ value: p.id, label: `${p.sku} — ${p.nome}` }));
  const armOpts = armazens.filter((a) => a.activo).map((a) => ({ value: a.id, label: `${a.codigo} — ${a.nome}` }));

  async function exportKardex() {
    try {
      const blob = await estoqueService.downloadKardex();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kardex_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error("Erro ao exportar: " + (e?.response?.data?.detail || e.message));
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-3"><History className="h-7 w-7 text-ink" /> Movimentos de Stock</h1>
        <button onClick={exportKardex}
          className="inline-flex items-center gap-2 px-4 py-2 bg-live hover:bg-green-700 text-white rounded-lg text-sm">
          <FileSpreadsheet className="h-4 w-4" /> Exportar Excel (Kardex)
        </button>
      </div>
      <div className="bg-panel dark:bg-panel rounded-xl shadow-sm">
        {Tabs}

        {tab === "historico" && (
          <div className="overflow-auto">
            {isLoading ? <div className="p-6 text-center">A carregar…</div> : (
              <table className="w-full text-sm">
                <thead className="bg-surface dark:bg-ink-ghost/20 text-left">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3 text-right">Qtd</th>
                    <th className="px-4 py-3">Origem → Destino</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3 text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                  {movs.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-ink-mid/70">Sem movimentos</td></tr>}
                  {movs.map((m) => {
                    const prod = produtos.find((p) => p.id === m.produto_id);
                    const ao = armazens.find((a) => a.id === m.armazem_origem_id);
                    const ad = armazens.find((a) => a.id === m.armazem_destino_id);
                    return (
                      <tr key={m.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                        <td className="px-4 py-2 text-xs whitespace-nowrap">{new Date(m.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-xs">
                          <span className={`px-2 py-1 rounded ${m.tipo.startsWith("entrada") ? "bg-green-100 text-green-700" : m.tipo.startsWith("saida") ? "bg-danger/10 text-danger" : "bg-blue-100 text-blue-700"}`}>
                            {TIPO_LABEL[m.tipo] || m.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-2">{prod?.nome || m.produto_id.slice(0, 8)}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m.quantidade}</td>
                        <td className="px-4 py-2 text-xs text-ink-mid">
                          {ao?.codigo || "—"} → {ad?.codigo || "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-ink-mid">{m.motivo || "—"}</td>
                        <td className="px-4 py-2 text-right">
                          {!m.estornado_de && (
                            <button onClick={() => confirm("Estornar movimento?") && estornoMut.mutate(m.id)} className="p-1 text-ink-mid/70 hover:text-amber" title="Estornar">
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "entrada" && (
          <form onSubmit={(e) => { e.preventDefault(); entradaMut.mutate(); }} className="p-6 grid gap-4 max-w-2xl">
            <Select value={entrada.produto_id} onChange={(v) => setEntrada({ ...entrada, produto_id: v })} options={prodOpts} placeholder="Escolha o produto" />
            <Select value={entrada.armazem_id} onChange={(v) => setEntrada({ ...entrada, armazem_id: v })} options={armOpts} placeholder="Armazém destino" />
            <select value={entrada.tipo} onChange={(e) => setEntrada({ ...entrada, tipo: e.target.value as any })} className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="entrada_compra">Compra</option>
              <option value="entrada_producao">Produção</option>
              <option value="entrada_ajuste">Ajuste</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="0.001" min="0.001" placeholder="Quantidade" value={entrada.quantidade || ""} onChange={(e) => setEntrada({ ...entrada, quantidade: Number(e.target.value) })} required className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
              <input type="number" step="0.01" min="0" placeholder="Custo unitário (opcional)" value={entrada.custo_unitario || ""} onChange={(e) => setEntrada({ ...entrada, custo_unitario: Number(e.target.value) })} className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            </div>
            <textarea placeholder="Motivo (obrigatório se ajuste)" value={entrada.motivo} onChange={(e) => setEntrada({ ...entrada, motivo: e.target.value })} className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            <button type="submit" disabled={entradaMut.isPending} className="bg-live text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {entradaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Registar entrada"}
            </button>
          </form>
        )}

        {tab === "saida" && (
          <form onSubmit={(e) => { e.preventDefault(); saidaMut.mutate(); }} className="p-6 grid gap-4 max-w-2xl">
            <Select value={saida.produto_id} onChange={(v) => setSaida({ ...saida, produto_id: v })} options={prodOpts} placeholder="Escolha o produto" />
            <Select value={saida.armazem_id} onChange={(v) => setSaida({ ...saida, armazem_id: v })} options={armOpts} placeholder="Armazém origem" />
            <select value={saida.tipo} onChange={(e) => setSaida({ ...saida, tipo: e.target.value as any })} className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="saida_perda">Perda / quebra</option>
              <option value="saida_ajuste">Ajuste</option>
            </select>
            <input type="number" step="0.001" min="0.001" placeholder="Quantidade" value={saida.quantidade || ""} onChange={(e) => setSaida({ ...saida, quantidade: Number(e.target.value) })} required className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            <textarea placeholder="Motivo (obrigatório se ajuste)" value={saida.motivo} onChange={(e) => setSaida({ ...saida, motivo: e.target.value })} className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            <button type="submit" disabled={saidaMut.isPending} className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
              {saidaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Registar saída"}
            </button>
          </form>
        )}

        {tab === "transferencia" && (
          <form onSubmit={(e) => { e.preventDefault(); transfMut.mutate(); }} className="p-6 grid gap-4 max-w-2xl">
            <Select value={transf.produto_id} onChange={(v) => setTransf({ ...transf, produto_id: v })} options={prodOpts} placeholder="Escolha o produto" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={transf.armazem_origem_id} onChange={(v) => setTransf({ ...transf, armazem_origem_id: v })} options={armOpts} placeholder="Origem" />
              <Select value={transf.armazem_destino_id} onChange={(v) => setTransf({ ...transf, armazem_destino_id: v })} options={armOpts} placeholder="Destino" />
            </div>
            <input type="number" step="0.001" min="0.001" placeholder="Quantidade" value={transf.quantidade || ""} onChange={(e) => setTransf({ ...transf, quantidade: Number(e.target.value) })} required className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            <textarea placeholder="Motivo / observações" value={transf.motivo} onChange={(e) => setTransf({ ...transf, motivo: e.target.value })} className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            <button type="submit" disabled={transfMut.isPending} className="bg-ink text-white px-4 py-2 rounded-lg hover:bg-ink/90 disabled:opacity-50">
              {transfMut.isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Registar transferência"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
