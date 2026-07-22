"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { caixaService, produtoService, clienteService } from "@/shared/services/financeiro.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ShoppingCart, CreditCard, Check, Loader2 } from "lucide-react";
import type { Venda, LinhaCreateDTO } from "@/shared/types";

export default function NovaVendaPage() {
  const router = useRouter();
  const { data: sessao } = useQuery({ queryKey: ["caixa", "sessao-activa"], queryFn: caixaService.sessaoActiva });
  const { data: produtos = [] } = useQuery({ queryKey: ["produtos"], queryFn: () => produtoService.list({ activo: true }) });
  const { data: clientes = [] } = useQuery({ queryKey: ["clientes"], queryFn: () => clienteService.list() });

  const [venda, setVenda] = useState<Venda | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [busca, setBusca] = useState("");
  const [pagForma, setPagForma] = useState<"numerario" | "tpa" | "transferencia" | "cheque">("numerario");
  const [pagValor, setPagValor] = useState(0);

  useEffect(() => {
    if (sessao && !venda) {
      // cria rascunho vazio ligado à sessão
      caixaService.criarVenda({ sessao_id: sessao.id, armazem_id: sessao.armazem_id, linhas: [] })
        .then(setVenda).catch((e) => toast.error(e?.response?.data?.detail || "Erro"));
    }
  }, [sessao]);

  const filtered = produtos.filter((p) => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const addMut = useMutation({
    mutationFn: (dto: LinhaCreateDTO) => caixaService.adicionarLinha(venda!.id, dto),
    onSuccess: setVenda,
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const removeMut = useMutation({
    mutationFn: (lid: string) => caixaService.removerLinha(venda!.id, lid),
    onSuccess: setVenda,
  });
  const pagarMut = useMutation({
    mutationFn: () => caixaService.pagar(venda!.id, { forma: pagForma, valor: pagValor }),
    onSuccess: (v) => { setVenda(v); setPagValor(0); toast.success("Pagamento adicionado"); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const concluirMut = useMutation({
    mutationFn: () => caixaService.concluir(venda!.id),
    onSuccess: (v) => {
      toast.success(`Venda concluída — ${v.numero_proforma}`);
      caixaService.downloadProformaPdf(v.id);
      router.push("/dashboard/caixa");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  if (!sessao) return <div className="p-6">Não há sessão de caixa aberta. <a href="/dashboard/caixa" className="text-ink underline">Abrir agora</a></div>;
  if (!venda) return <div className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const pago = venda.pagamentos.reduce((s, p) => s + Number(p.valor), 0);
  const falta = Number(venda.total_liquido) - pago;

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Catálogo */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-ink" /> Nova venda</h2>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto…"
            className="border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20 w-64" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.slice(0, 24).map((p) => (
            <button key={p.id} onClick={() => addMut.mutate({ produto_id: p.id, quantidade: 1 })}
              className="bg-panel dark:bg-panel rounded-xl p-4 shadow hover:shadow-md text-left hover:border-blue-300 border border-transparent">
              <div className="font-mono text-xs text-ink-mid/70">{p.sku}</div>
              <div className="font-semibold text-sm mt-1">{p.nome}</div>
              <div className="text-ink mt-2 font-bold">{p.preco_base} AOA / {p.unidade_medida}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Talão */}
      <div className="bg-panel dark:bg-panel rounded-xl shadow p-4 sticky top-4 self-start space-y-3">
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20 text-sm">
          <option value="">Consumidor final</option>
          {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>

        <div className="border-t border-b py-2 max-h-96 overflow-auto divide-y dark:divide-ink-ghost/15">
          {venda.linhas.length === 0 && <div className="text-center text-ink-mid/50 py-6 text-sm">Carrinho vazio</div>}
          {venda.linhas.map((ln) => (
            <div key={ln.id} className="py-2 flex items-center justify-between gap-2 text-sm">
              <div className="flex-1">
                <div className="font-medium">{ln.nome_snapshot}</div>
                <div className="text-xs text-ink-mid/70">{ln.quantidade} × {ln.preco_unitario} = <b>{ln.subtotal} AOA</b></div>
              </div>
              <button onClick={() => removeMut.mutate(ln.id)} className="text-ink-mid/50 hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="text-sm space-y-1">
          <div className="flex justify-between"><span>Bruto</span><span>{venda.total_bruto} AOA</span></div>
          <div className="flex justify-between text-ink-mid/70"><span>Desconto</span><span>-{venda.total_desconto}</span></div>
          <div className="flex justify-between text-ink-mid/70"><span>IVA</span><span>{venda.total_iva}</span></div>
          <div className="flex justify-between text-lg font-bold pt-1 border-t"><span>Total</span><span>{venda.total_liquido} AOA</span></div>
          <div className="flex justify-between text-live"><span>Pago</span><span>{pago.toFixed(2)}</span></div>
          <div className={`flex justify-between font-semibold ${falta > 0 ? "text-danger" : "text-live"}`}>
            <span>Falta</span><span>{Math.max(0, falta).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex gap-2">
            <select value={pagForma} onChange={(e) => setPagForma(e.target.value as any)} className="flex-1 border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="numerario">Numerário</option>
              <option value="tpa">TPA</option>
              <option value="transferencia">Transferência</option>
              <option value="cheque">Cheque</option>
            </select>
            <input type="number" placeholder="Valor" value={pagValor || ""} onChange={(e) => setPagValor(Number(e.target.value))}
              className="w-28 border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            <button onClick={() => pagValor > 0 && pagarMut.mutate()} className="bg-surface dark:bg-ink-ghost/20 text-ink dark:text-white px-3 rounded-lg text-sm">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => concluirMut.mutate()} disabled={concluirMut.isPending || venda.linhas.length === 0 || falta > 0}
            className="w-full bg-live hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {concluirMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
            Concluir venda
          </button>
        </div>
      </div>
    </div>
  );
}
