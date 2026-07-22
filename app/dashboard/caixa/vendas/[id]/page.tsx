"use client";
import { useQuery } from "@tanstack/react-query";
import { caixaService } from "@/shared/services/financeiro.service";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { ProformaPdfModal } from "@/shared/ui/proforma-pdf-modal";

export default function VendaDetailPage() {
  const params = useParams<{ id: string }>();
  const [showPdf, setShowPdf] = useState(false);

  const { data: v, isLoading } = useQuery({
    queryKey: ["caixa", "venda", params.id],
    queryFn: () => caixaService.getVenda(params.id),
  });

  if (isLoading || !v) return <div className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Venda {v.numero_proforma || v.id.slice(0, 8)}</h1>
        {v.numero_proforma && (
          <button
            onClick={() => setShowPdf(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
            <FileText className="h-4 w-4" /> Proforma PDF
          </button>
        )}
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-6 grid grid-cols-2 gap-4 text-sm">
        <div><b>Data:</b> {new Date(v.data).toLocaleString()}</div>
        <div><b>Estado:</b> {v.estado}</div>
        <div><b>Total:</b> {v.total_liquido} AOA</div>
        <div><b>IVA:</b> {v.total_iva} AOA</div>
        <div><b>Correlation:</b> <span className="font-mono text-xs">{v.correlation_id}</span></div>
        <div><b>Primavera:</b> {v.ref_primavera || <span className="text-amber">pendente</span>}</div>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface dark:bg-surface text-left">
            <tr><th className="px-4 py-2">SKU</th><th className="px-4 py-2">Produto</th>
                <th className="px-4 py-2 text-right">Qtd</th><th className="px-4 py-2 text-right">Preço</th>
                <th className="px-4 py-2 text-right">IVA</th><th className="px-4 py-2 text-right">Desc</th>
                <th className="px-4 py-2 text-right">Subtotal</th></tr>
          </thead>
          <tbody className="divide-y dark:divide-ink-ghost/15">
            {v.linhas.map((ln) => (
              <tr key={ln.id}>
                <td className="px-4 py-2 font-mono text-xs">{ln.sku_snapshot}</td>
                <td className="px-4 py-2">{ln.nome_snapshot}</td>
                <td className="px-4 py-2 text-right">{ln.quantidade}</td>
                <td className="px-4 py-2 text-right">{ln.preco_unitario}</td>
                <td className="px-4 py-2 text-right">{ln.iva_pct}%</td>
                <td className="px-4 py-2 text-right">{ln.desconto_pct}%</td>
                <td className="px-4 py-2 text-right font-semibold">{ln.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Pagamentos</h3>
        {v.pagamentos.length === 0 ? <p className="text-ink-mid/70 text-sm">Sem pagamentos.</p> : (
          <ul className="text-sm space-y-1">
            {v.pagamentos.map((p) => (
              <li key={p.id}>{p.forma}: <b>{p.valor} AOA</b> {p.ref_externa && <span className="text-ink-mid/70">({p.ref_externa})</span>}</li>
            ))}
          </ul>
        )}
      </div>

      <ProformaPdfModal
        vendaId={showPdf ? v.id : null}
        numeroProforma={v.numero_proforma ?? undefined}
        onClose={() => setShowPdf(false)}
      />
    </div>
  );
}
