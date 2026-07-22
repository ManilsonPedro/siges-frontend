"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caixaService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { ProformaPdfModal } from "@/shared/ui/proforma-pdf-modal";

export default function VendasPage() {
  const qc = useQueryClient();
  const [estado, setEstado] = useState<string>("");
  const [pdfVenda, setPdfVenda] = useState<{ id: string; numero: string } | null>(null);

  const { data: vendas = [], isLoading } = useQuery({
    queryKey: ["caixa", "vendas", estado],
    queryFn: () => caixaService.listVendas({ estado: estado || undefined, page_size: 100 }),
  });

  const anularMut = useMutation({
    mutationFn: (id: string) => caixaService.anular(id),
    onSuccess: () => { toast.success("Venda anulada"); qc.invalidateQueries({ queryKey: ["caixa"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Histórico de Vendas</h1>
      <div className="flex gap-2">
        {["", "rascunho", "concluida", "anulada"].map((e) => (
          <button key={e} onClick={() => setEstado(e)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${estado === e ? "bg-ink text-white border-ink" : "bg-panel dark:bg-panel"}`}>
            {e || "Todos"}
          </button>
        ))}
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface dark:bg-surface text-left">
            <tr>
              <th className="px-4 py-3">Nº Proforma</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Primavera</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={6} className="p-6 text-center">A carregar…</td></tr>}
            {!isLoading && vendas.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-ink-mid/70">Sem vendas</td></tr>}
            {vendas.map((v) => (
              <tr key={v.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                <td className="px-4 py-2 font-mono">{v.numero_proforma || "—"}</td>
                <td className="px-4 py-2">{new Date(v.data).toLocaleString()}</td>
                <td className="px-4 py-2 text-right font-semibold">{v.total_liquido} AOA</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-1 rounded ${v.estado === "concluida" ? "bg-live-dim text-live" : v.estado === "anulada" ? "bg-danger/10 text-danger" : "bg-surface text-ink-mid"}`}>{v.estado}</span>
                </td>
                <td className="px-4 py-2 text-xs">
                  {v.ref_primavera ? <span className="text-live">✓ {v.ref_primavera}</span> : v.estado === "concluida" ? <span className="text-amber">Pendente</span> : "—"}
                </td>
                <td className="px-4 py-2 text-right space-x-1">
                  {v.numero_proforma && (
                    <button
                      onClick={() => setPdfVenda({ id: v.id, numero: v.numero_proforma! })}
                      className="inline-block p-1.5 text-ink-mid/70 hover:text-ink"
                      title="Ver Proforma PDF">
                      <FileText className="h-4 w-4" />
                    </button>
                  )}
                  <Link href={`/dashboard/caixa/vendas/${v.id}`} className="inline-block p-1.5 text-ink-mid/70 hover:text-ink" title="Ver">
                    <Eye className="h-4 w-4" />
                  </Link>
                  {v.estado === "concluida" && (
                    <button onClick={() => confirm("Anular venda?") && anularMut.mutate(v.id)} className="p-1.5 text-ink-mid/70 hover:text-danger" title="Anular">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProformaPdfModal
        vendaId={pdfVenda?.id ?? null}
        numeroProforma={pdfVenda?.numero}
        onClose={() => setPdfVenda(null)}
      />
    </div>
  );
}
