"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Plus, Trash2, Wallet, AlertCircle } from "lucide-react";
import { pagamentosService } from "@/shared/services/financeiro.service";
import { formatCurrency, formatDateTime } from "@/shared/utils";

interface Props {
  movimentoId: string | null;
  onClose: () => void;
}

export function PagamentosModal({ movimentoId, onClose }: Props) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [valor, setValor] = useState("");
  const [fundoTipo, setFundoTipo] = useState<"BCS" | "BFA">("BCS");
  const [observacao, setObservacao] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["pagamentos", movimentoId],
    queryFn: () => pagamentosService.list(movimentoId!),
    enabled: !!movimentoId,
  });

  const addMutation = useMutation({
    mutationFn: () => pagamentosService.add(movimentoId!, {
      valor: parseFloat(valor),
      fundo_tipo: fundoTipo,
      observacao: observacao || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagamentos", movimentoId] });
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      qc.invalidateQueries({ queryKey: ["fundo"] });
      toast.success("Pagamento registado");
      setShowForm(false);
      setValor("");
      setObservacao("");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => toast.error(e?.response?.data?.detail || "Erro ao registar"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => pagamentosService.remove(movimentoId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagamentos", movimentoId] });
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      toast.success("Pagamento eliminado");
    },
  });

  if (!movimentoId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pagamentos Parciais</h3>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">A carregar...</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
              <div>
                <p className="text-xs text-gray-500">Valor do movimento</p>
                <p className="text-base font-bold">{formatCurrency(data?.valor_movimento || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Já pago</p>
                <p className="text-base font-bold text-green-600">{formatCurrency(data?.total_pago || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Em dívida</p>
                <p className="text-base font-bold text-red-600">{formatCurrency(data?.saldo_em_divida || 0)}</p>
              </div>
            </div>

            {(data?.saldo_em_divida || 0) > 0 && !showForm && (
              <div className="px-6 pt-4">
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm">
                  <Plus className="h-4 w-4" /> Registar pagamento
                </button>
              </div>
            )}

            {showForm && (
              <div className="px-6 py-4 border-y border-gray-100 dark:border-gray-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (AOA)</label>
                    <input type="number" step="any" min="0" max={data?.saldo_em_divida} value={valor} onChange={(e) => setValor(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fundo</label>
                    <select value={fundoTipo} onChange={(e) => setFundoTipo(e.target.value as "BCS" | "BFA")}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="BCS">BCS</option>
                      <option value="BFA">BFA</option>
                    </select>
                  </div>
                </div>
                <input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Observação (opcional)"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                <div className="flex gap-2">
                  <button onClick={() => addMutation.mutate()} disabled={!valor || addMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
                    Guardar
                  </button>
                  <button onClick={() => { setShowForm(false); setValor(""); setObservacao(""); }}
                    className="px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {data?.pagamentos.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  Nenhum pagamento parcial registado.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Data</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Utilizador</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Fundo</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.pagamentos.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-500 whitespace-nowrap">{formatDateTime(p.data)}</td>
                        <td className="py-2 font-medium">{p.created_by_name || "—"}</td>
                        <td className="py-2">
                          <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${p.fundo_tipo === "BFA" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{p.fundo_tipo}</span>
                        </td>
                        <td className="py-2 text-right font-semibold text-green-600">{formatCurrency(p.valor)}</td>
                        <td className="py-2 text-right">
                          <button onClick={() => { if (confirm("Eliminar este pagamento?")) removeMutation.mutate(p.id); }}
                            className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
