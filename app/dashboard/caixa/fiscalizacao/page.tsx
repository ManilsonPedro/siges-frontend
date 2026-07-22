"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caixaService } from "@/shared/services/financeiro.service";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, CheckCircle, Loader2 } from "lucide-react";
import { ProformaPdfModal } from "@/shared/ui/proforma-pdf-modal";

export default function FiscalizacaoPage() {
  const qc = useQueryClient();
  const { data: vendas = [], isLoading } = useQuery({
    queryKey: ["caixa", "fiscalizacao"],
    queryFn: () => caixaService.listVendas({ pendente_primavera: true, page_size: 200 }),
  });

  const [refs, setRefs] = useState<Record<string, string>>({});
  const [pdfVenda, setPdfVenda] = useState<{ id: string; numero: string } | null>(null);

  const marcarMut = useMutation({
    mutationFn: ({ id, ref }: { id: string; ref: string }) => caixaService.marcarFiscalizada(id, ref),
    onSuccess: () => { toast.success("Marcada como fiscalizada"); qc.invalidateQueries({ queryKey: ["caixa"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Fila de Fiscalização Primavera</h1>
      <p className="text-sm text-ink-mid dark:text-gray-400">
        Vendas concluídas que ainda não foram lançadas no Primavera ERP. Após digitar a factura no Primavera,
        cole aqui o nº oficial para fechar o ciclo.
      </p>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-auto">
        {isLoading ? <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-amber/8 dark:bg-amber/10 text-left">
              <tr>
                <th className="px-4 py-3">Proforma</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Nº Factura Primavera</th>
                <th className="px-4 py-3 text-right">Acção</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {vendas.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Tudo em dia! 🎉</td></tr>}
              {vendas.map((v) => (
                <tr key={v.id} className="hover:bg-surface dark:hover:bg-ink-ghost/20">
                  <td className="px-4 py-2 font-mono">
                    <button
                      onClick={() => setPdfVenda({ id: v.id, numero: v.numero_proforma! })}
                      className="inline-flex items-center gap-1 text-ink hover:underline">
                      <FileText className="h-3 w-3" /> {v.numero_proforma}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-xs">{new Date(v.data).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-semibold">{v.total_liquido} AOA</td>
                  <td className="px-4 py-2">
                    <input value={refs[v.id] || ""} onChange={(e) => setRefs({ ...refs, [v.id]: e.target.value })}
                      placeholder="ex.: FA 2026/123"
                      className="border rounded-lg px-2 py-1 text-sm dark:bg-surface dark:bg-ink-ghost/20 dark:border-gray-700 w-44" />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => refs[v.id] && marcarMut.mutate({ id: v.id, ref: refs[v.id] })}
                      disabled={!refs[v.id] || marcarMut.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-live hover:bg-green-700 text-white text-xs rounded-lg disabled:opacity-50">
                      <CheckCircle className="h-3 w-3" /> Marcar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProformaPdfModal
        vendaId={pdfVenda?.id ?? null}
        numeroProforma={pdfVenda?.numero}
        onClose={() => setPdfVenda(null)}
      />
    </div>
  );
}
