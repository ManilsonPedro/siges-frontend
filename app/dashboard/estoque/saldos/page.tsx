"use client";
import { useQuery } from "@tanstack/react-query";
import { armazemService, estoqueService, produtoService } from "@/shared/services/financeiro.service";
import { useState, useMemo } from "react";
import { Boxes, AlertTriangle } from "lucide-react";

export default function SaldosPage() {
  const [armazemId, setArmazemId] = useState<string>("");
  const [soAlertas, setSoAlertas] = useState(false);
  const [busca, setBusca] = useState("");

  const { data: armazens = [] } = useQuery({ queryKey: ["armazens"], queryFn: armazemService.list });
  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list() });
  const { data: saldos = [], isLoading } = useQuery({
    queryKey: ["estoque", "saldos", armazemId, soAlertas],
    queryFn: () => estoqueService.saldos({
      armazem_id: armazemId || undefined,
      abaixo_minimo: soAlertas || undefined,
    }),
  });

  // Matriz produto × armazém
  const matriz = useMemo(() => {
    const armazensOrdenados = [...armazens].filter((a) => a.activo);
    const linhas = produtos.map((p) => {
      const cells = armazensOrdenados.map((a) => {
        const s = saldos.find((x) => x.produto_id === p.id && x.armazem_id === a.id);
        return s;
      });
      return { produto: p, cells };
    });
    const q = busca.trim().toLowerCase();
    return {
      armazens: armazensOrdenados,
      linhas: q
        ? linhas.filter(({ produto }) =>
            produto.nome.toLowerCase().includes(q) || produto.sku.toLowerCase().includes(q))
        : linhas,
    };
  }, [armazens, produtos, saldos, busca]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Boxes className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold">Saldos de Stock</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center bg-panel dark:bg-panel p-4 rounded-xl shadow">
        <input placeholder="Buscar produto (nome ou SKU)…" value={busca} onChange={(e) => setBusca(e.target.value)}
          className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20 flex-1 min-w-[200px]" />
        <select value={armazemId} onChange={(e) => setArmazemId(e.target.value)} className="px-3 py-2 border rounded-lg dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
          <option value="">Todos os armazéns</option>
          {armazens.map((a) => <option key={a.id} value={a.id}>{a.codigo} — {a.nome}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={soAlertas} onChange={(e) => setSoAlertas(e.target.checked)} />
          <AlertTriangle className="h-4 w-4 text-amber" /> Só abaixo do mínimo
        </label>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-auto">
        {isLoading ? (
          <div className="p-8 text-center">A carregar…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface dark:bg-ink-ghost/20 text-left">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Produto</th>
                {matriz.armazens.map((a) => (
                  <th key={a.id} className="px-4 py-3 text-right">{a.codigo}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {matriz.linhas.length === 0 && <tr><td colSpan={matriz.armazens.length + 2} className="p-6 text-center text-ink-mid/70">Sem dados</td></tr>}
              {matriz.linhas.map(({ produto, cells }) => (
                <tr key={produto.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                  <td className="px-4 py-2 font-mono text-xs">{produto.sku}</td>
                  <td className="px-4 py-2">{produto.nome}</td>
                  {cells.map((s, i) => (
                    <td key={i} className={`px-4 py-2 text-right tabular-nums ${s?.abaixo_minimo ? "text-danger font-semibold" : ""}`}>
                      {s ? s.qtd_actual : "—"}
                      {s && s.qtd_reservada > 0 && <span className="text-xs text-ink-mid/50 ml-1">(-{s.qtd_reservada})</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
