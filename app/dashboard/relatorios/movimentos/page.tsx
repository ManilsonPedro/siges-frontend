"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeftRight, FileDown, FileText, Printer, Trash2, TrendingUp, TrendingDown,
  Loader2, Calendar,
} from "lucide-react";
import {
  extratoService, fornecedorService, conceitoService, companyService,
} from "@/shared/services/financeiro.service";
import { formatCurrency, formatDate } from "@/shared/utils";

const ESTADOS_PAG = ["pendente", "pago", "pago_parcial", "pago_total", "cancelado", "devolvido"];

export default function ExtratoMovimentosPage() {
  const [filters, setFilters] = useState<{
    data_inicio?: string; data_fim?: string;
    fornecedor_id?: string; conceito_id?: string;
    tipo_movimento?: string; estado_pagamento?: string; fundo_tipo?: string;
  }>({});
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const { data: fornecedores = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: () => fornecedorService.list() });
  const { data: conceitos = [] } = useQuery({ queryKey: ["conceitos"], queryFn: () => conceitoService.list() });
  const { data: empresa } = useQuery({ queryKey: ["company-settings"], queryFn: companyService.get });

  const { data, isLoading } = useQuery({
    queryKey: ["extrato-movimentos", filters],
    queryFn: () => extratoService.movimentos(filters),
  });

  const movimentos = useMemo(
    () => (data?.movimentos || []).filter((m) => !excludedIds.has(m.id)),
    [data, excludedIds]
  );

  const totais = useMemo(() => {
    const entradas = movimentos.filter((m) => m.tipo_movimento === "entrada").reduce((s, m) => s + m.valor, 0);
    const saidas = movimentos.filter((m) => m.tipo_movimento === "saida").reduce((s, m) => s + m.valor, 0);
    return { entradas, saidas, saldo: entradas - saidas, count: movimentos.length };
  }, [movimentos]);

  async function handleExport(formato: "excel" | "pdf") {
    setExporting(true);
    try {
      const blob = await extratoService.exportMovimentos({
        ...filters,
        formato,
        movimentos_ids: movimentos.map((m) => m.id),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `extrato_movimentos_${new Date().toISOString().slice(0, 10)}.${formato === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao exportar");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center gap-3">
        <div className="p-2 rounded-lg bg-live-dim dark:bg-emerald-900/30">
          <ArrowLeftRight className="h-5 w-5 text-live" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Extrato de Movimentos</h1>
          <p className="text-ink-mid/70 text-sm">Lista completa com filtros · imprimir · exportar Excel/PDF</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="no-print bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-mid/70 mb-1 uppercase tracking-wide">Data início</label>
            <input type="date" value={filters.data_inicio || ""} onChange={(e) => setFilters((f) => ({ ...f, data_inicio: e.target.value || undefined }))}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-mid/70 mb-1 uppercase tracking-wide">Data fim</label>
            <input type="date" value={filters.data_fim || ""} onChange={(e) => setFilters((f) => ({ ...f, data_fim: e.target.value || undefined }))}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-mid/70 mb-1 uppercase tracking-wide">Fornecedor</label>
            <select value={filters.fornecedor_id || ""} onChange={(e) => setFilters((f) => ({ ...f, fornecedor_id: e.target.value || undefined }))}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel">
              <option value="">Todos</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-mid/70 mb-1 uppercase tracking-wide">Conceito</label>
            <select value={filters.conceito_id || ""} onChange={(e) => setFilters((f) => ({ ...f, conceito_id: e.target.value || undefined }))}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel">
              <option value="">Todos</option>
              {conceitos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-mid/70 mb-1 uppercase tracking-wide">Tipo</label>
            <select value={filters.tipo_movimento || ""} onChange={(e) => setFilters((f) => ({ ...f, tipo_movimento: e.target.value || undefined }))}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel">
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-mid/70 mb-1 uppercase tracking-wide">Estado</label>
            <select value={filters.estado_pagamento || ""} onChange={(e) => setFilters((f) => ({ ...f, estado_pagamento: e.target.value || undefined }))}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel">
              <option value="">Todos</option>
              {ESTADOS_PAG.map((e) => <option key={e} value={e}>{e.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-mid/70 mb-1 uppercase tracking-wide">Fundo</label>
            <select value={filters.fundo_tipo || ""} onChange={(e) => setFilters((f) => ({ ...f, fundo_tipo: e.target.value || undefined }))}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel">
              <option value="">Todos</option>
              <option value="BCS">BCS</option>
              <option value="BFA">BFA</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilters({}); setExcludedIds(new Set()); }}
              className="w-full text-xs text-ink-mid/70 border border-ink-ghost/80 dark:border-gray-600 rounded-lg py-2 hover:bg-surface dark:hover:bg-ink-ghost/20"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm">
            <Printer className="h-3.5 w-3.5" /> Imprimir
          </button>
          <button onClick={() => handleExport("excel")} disabled={exporting} className="flex items-center gap-1.5 bg-live hover:bg-green-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
            Exportar Excel
          </button>
          <button onClick={() => handleExport("pdf")} disabled={exporting} className="flex items-center gap-1.5 bg-danger hover:bg-red-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Relatório */}
      {isLoading ? (
        <div className="text-center text-ink-mid/50 py-12 bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 animate-pulse">A carregar...</div>
      ) : (
        <div className="printable-area relative bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
          {empresa?.logo_url && (
            <div aria-hidden="true" className="watermark pointer-events-none absolute inset-0 z-0" style={{
              backgroundImage: `url(${empresa.logo_url})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center 60%",
              backgroundSize: "60% auto",
              opacity: 0.06,
            }} />
          )}
          <div className="relative z-10">
            <div className="px-6 py-5 border-b border-ink-ghost/60 dark:border-ink-ghost/20 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {empresa?.logo_url && <img src={empresa.logo_url} alt="logo" className="w-16 h-16 object-contain rounded border border-ink-ghost/60" />}
                <div>
                  <h2 className="text-xl font-bold text-ink dark:text-white">{empresa?.nome || "EMPRESA"}</h2>
                  {empresa?.nif && <p className="text-xs text-ink-mid/70">NIF: {empresa.nif}</p>}
                  {empresa?.morada && <p className="text-xs text-ink-mid/70">{empresa.morada}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-mid/70 uppercase tracking-wide">Data emissão</p>
                <p className="text-sm font-medium">{new Date().toLocaleDateString("pt-PT")}</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
              <div className="flex items-center gap-2 mb-1">
                <ArrowLeftRight className="h-4 w-4 text-live" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-mid dark:text-gray-300">Extrato de Movimentos</h3>
              </div>
              <div className="text-xs text-ink-mid/70 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Período: {filters.data_inicio ? new Date(filters.data_inicio).toLocaleDateString("pt-PT") : "Início"} → {filters.data_fim ? new Date(filters.data_fim).toLocaleDateString("pt-PT") : "Hoje"}
                {totais.count > 0 && ` · ${totais.count} movimento(s)`}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface dark:bg-surface">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mid">#</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mid">Código</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mid">Data</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mid">Fornecedor</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mid">Conceito</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mid">Tipo</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mid">Fundo</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mid">Valor</th>
                    <th className="no-print"></th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-ink-mid/50 py-8">Sem movimentos para os filtros seleccionados.</td></tr>
                  ) : (
                    movimentos.map((m, idx) => (
                      <tr key={m.id} className="border-b border-ink-ghost/40 dark:border-ink-ghost/15">
                        <td className="px-3 py-2 text-ink-mid/70">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono text-xs text-ink-mid/70">{m.codigo || "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(m.data)}</td>
                        <td className="px-3 py-2">{m.fornecedor_nome || "—"}</td>
                        <td className="px-3 py-2">{m.conceito_nome || "—"}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${m.tipo_movimento === "entrada" ? "bg-live-dim text-live" : "bg-danger/10 text-danger"}`}>
                            {m.tipo_movimento === "entrada" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {m.tipo_movimento === "entrada" ? "Entrada" : "Saída"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.fundo_tipo === "BFA" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{m.fundo_tipo}</span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">{formatCurrency(m.valor)}</td>
                        <td className="px-3 py-2 no-print">
                          <button onClick={() => setExcludedIds((p) => new Set(p).add(m.id))} className="text-danger hover:text-red-700 p-1" title="Remover">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total geral */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-700 text-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wide">Entradas</p>
                  <p className="text-base font-bold text-emerald-300">{formatCurrency(totais.entradas)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wide">Saídas</p>
                  <p className="text-base font-bold text-red-300">{formatCurrency(totais.saidas)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wide">Saldo</p>
                  <p className={`text-base font-bold ${totais.saldo >= 0 ? "text-emerald-300" : "text-red-300"}`}>{formatCurrency(totais.saldo)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wide">Movimentos</p>
                  <p className="text-base font-bold">{totais.count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
