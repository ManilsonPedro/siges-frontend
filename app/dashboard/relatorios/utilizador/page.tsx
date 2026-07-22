"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { produtividadeService, usersStatsService } from "@/shared/services/financeiro.service";
import { formatCurrency, formatDateTime } from "@/shared/utils";
import { Users, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RelatorioPorUserPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const [di, setDi] = useState(monthStart);
  const [df, setDf] = useState(today);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const { data: prod = [], isLoading } = useQuery({
    queryKey: ["produtividade-users", di, df],
    queryFn: () => produtividadeService.porUser(di + "T00:00:00", df + "T23:59:59"),
  });
  const { data: users = [] } = useQuery({ queryKey: ["users-listagem"], queryFn: usersStatsService.listagem });

  const filtered = useMemo(() => selectedUser ? prod.filter(p => p.user_id === selectedUser) : prod, [prod, selectedUser]);
  const totais = useMemo(() => ({
    criados: filtered.reduce((s, u) => s + u.movimentos_criados, 0),
    entradas: filtered.reduce((s, u) => s + u.total_entradas, 0),
    saidas: filtered.reduce((s, u) => s + u.total_saidas, 0),
    fechados: filtered.reduce((s, u) => s + u.movimentos_fechados, 0),
  }), [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/relatorios" className="text-xs text-ink-mid/70 hover:underline inline-flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Relatórios
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-white">Relatório por Utilizador</h1>
            <p className="text-ink-mid/70 text-sm">Produtividade · movimentos por utilizador no período</p>
          </div>
        </div>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 print:hidden">
          <div>
            <label className="block text-xs font-medium mb-1">Data início</label>
            <input type="date" value={di} onChange={(e) => setDi(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Data fim</label>
            <input type="date" value={df} onChange={(e) => setDf(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Utilizador</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white">
              <option value="">Todos os utilizadores</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Printer className="h-4 w-4" /> Imprimir
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Movimentos criados", value: totais.criados, color: "bg-indigo-100 text-indigo-700" },
          { label: "Movimentos fechados", value: totais.fechados, color: "bg-emerald-100 text-emerald-700" },
          { label: "Total Entradas (AOA)", value: formatCurrency(totais.entradas), color: "bg-green-100 text-green-700" },
          { label: "Total Saídas (AOA)", value: formatCurrency(totais.saidas), color: "bg-red-100 text-red-700" },
        ].map((c) => (
          <div key={c.label} className={`rounded-lg p-3 ${c.color}`}>
            <p className="text-[10px] uppercase font-semibold tracking-wide opacity-80">{c.label}</p>
            <p className="text-lg font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-mid/50">A carregar...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-ink-mid/50">Sem dados no período seleccionado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface dark:bg-gray-800/50">
              <tr>
                {["Utilizador", "Email", "Criados", "Fechados", "Total Entradas", "Total Saídas", "Último login"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-ink-mid/70 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const userInfo = users.find(x => x.id === u.user_id);
                return (
                  <tr key={u.user_id} className="border-t border-ink-ghost/40 dark:border-ink-ghost/15">
                    <td className="px-4 py-2 font-medium text-ink dark:text-white">{u.user_name}</td>
                    <td className="px-4 py-2 text-xs text-ink-mid/70">{u.email}</td>
                    <td className="px-4 py-2 font-semibold">{u.movimentos_criados}</td>
                    <td className="px-4 py-2 font-semibold text-live">{u.movimentos_fechados}</td>
                    <td className="px-4 py-2 text-live">{formatCurrency(u.total_entradas)}</td>
                    <td className="px-4 py-2 text-danger">{formatCurrency(u.total_saidas)}</td>
                    <td className="px-4 py-2 text-xs text-ink-mid/70">{userInfo?.last_login_at ? formatDateTime(userInfo.last_login_at) : "Nunca"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
