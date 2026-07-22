"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { armazemService, caixaService } from "@/shared/services/financeiro.service";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { LockOpen, Lock, ShoppingCart, ListOrdered, Loader2, FileText } from "lucide-react";

export default function CaixaPage() {
  const qc = useQueryClient();
  const { data: sessao, isLoading } = useQuery({
    queryKey: ["caixa", "sessao-activa"],
    queryFn: caixaService.sessaoActiva,
  });
  const { data: armazens = [] } = useQuery({ queryKey: ["armazens"], queryFn: armazemService.list });

  const [armazemId, setArmazemId] = useState("");
  const [fundoInicial, setFundoInicial] = useState(0);
  const [fundoContado, setFundoContado] = useState(0);

  const abrirMut = useMutation({
    mutationFn: () => caixaService.abrirSessao({ armazem_id: armazemId, fundo_inicial: fundoInicial }),
    onSuccess: () => { toast.success("Sessão aberta"); qc.invalidateQueries({ queryKey: ["caixa"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const fecharMut = useMutation({
    mutationFn: () => caixaService.fecharSessao(sessao!.id, { fundo_contado: fundoContado }),
    onSuccess: (s) => {
      toast.success(`Sessão fechada — diferença: ${s.diferenca}`);
      qc.invalidateQueries({ queryKey: ["caixa"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  if (isLoading) return <div className="p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Caixa · Vendas</h1>

      {!sessao && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow p-6 max-w-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><LockOpen className="h-5 w-5 text-live" /> Abrir sessão</h2>
          <div className="space-y-3">
            <select value={armazemId} onChange={(e) => setArmazemId(e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Escolha o armazém</option>
              {armazens.filter((a) => a.activo).map((a) => <option key={a.id} value={a.id}>{a.codigo} — {a.nome}</option>)}
            </select>
            <input type="number" placeholder="Fundo inicial (AOA)" value={fundoInicial || ""} onChange={(e) => setFundoInicial(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
            <button onClick={() => armazemId ? abrirMut.mutate() : toast.error("Escolha armazém")} disabled={abrirMut.isPending}
              className="w-full bg-live text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {abrirMut.isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Abrir sessão"}
            </button>
          </div>
        </div>
      )}

      {sessao && (
        <>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Sessão activa desde</p>
                <p className="text-xl font-bold">{new Date(sessao.abertura_em).toLocaleString()}</p>
                <p className="text-sm mt-2 opacity-90">Fundo inicial: <b>{sessao.fundo_inicial} AOA</b></p>
              </div>
              <Lock className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/caixa/venda/nova"
              className="bg-ink hover:bg-ink/90 text-white rounded-xl p-6 flex flex-col items-start gap-3 shadow">
              <ShoppingCart className="h-8 w-8" />
              <span className="font-semibold">Nova venda</span>
              <span className="text-sm opacity-90">Abrir POS</span>
            </Link>
            <Link href="/dashboard/caixa/vendas"
              className="bg-panel dark:bg-panel rounded-xl p-6 shadow flex flex-col items-start gap-3 hover:shadow-md">
              <ListOrdered className="h-8 w-8 text-ink" />
              <span className="font-semibold">Histórico de vendas</span>
              <span className="text-sm text-ink-mid">Ver, anular, reimprimir proforma</span>
            </Link>
            <Link href="/dashboard/caixa/fiscalizacao"
              className="bg-panel dark:bg-panel rounded-xl p-6 shadow flex flex-col items-start gap-3 hover:shadow-md">
              <FileText className="h-8 w-8 text-amber" />
              <span className="font-semibold">Fila Primavera</span>
              <span className="text-sm text-ink-mid">Vendas por marcar como fiscalizadas</span>
            </Link>
          </div>

          <div className="bg-panel dark:bg-panel rounded-xl shadow p-6 max-w-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Lock className="h-5 w-5 text-amber" /> Fechar sessão</h3>
            <div className="space-y-3">
              <input type="number" placeholder="Fundo contado (AOA)" value={fundoContado || ""} onChange={(e) => setFundoContado(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
              <button onClick={() => confirm("Fechar sessão?") && fecharMut.mutate()} disabled={fecharMut.isPending}
                className="w-full bg-amber text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50">
                {fecharMut.isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Fechar sessão"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
