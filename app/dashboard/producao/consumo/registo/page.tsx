"use client";

import { useState } from "react";
import {
  FlaskConical,
  CalendarDays,
  ClipboardList,
  User,
  Save,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  PackageSearch,
  Activity,
  TrendingDown,
  BarChart3,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MateriaPrima {
  id: string;
  nome: string;
  unidade: string;
  stockActual: number; // litros / kg
}

interface LinhaConsumo {
  id: string;
  materiaPrimaId: string;
  qtdPrevista: number;
  qtdReal: number;
}

interface OrdemProducao {
  id: string;
  produto: string;
  qtdOrdenada: number;
  unidade: string;
  dataInicio: string;
  operador: string;
}

// ─── Dados mock ───────────────────────────────────────────────────────────────

const MATERIAS_PRIMAS: MateriaPrima[] = [
  { id: "MP-001", nome: "Hipoclorito de Sódio 12%", unidade: "L", stockActual: 18500 },
  { id: "MP-002", nome: "Cloro Gasoso 99%", unidade: "kg", stockActual: 4200 },
  { id: "MP-003", nome: "Soda Cáustica NaOH 50%", unidade: "kg", stockActual: 9800 },
  { id: "MP-004", nome: "Surfactante Aniónico", unidade: "kg", stockActual: 1250 },
  { id: "MP-005", nome: "Água Desmineralizada", unidade: "L", stockActual: 35000 },
  { id: "MP-006", nome: "Corante Azul (lixívia)", unidade: "kg", stockActual: 320 },
  { id: "MP-007", nome: "Embalagem PEAD 1L", unidade: "un", stockActual: 8400 },
  { id: "MP-008", nome: "Embalagem PEAD 5L", unidade: "un", stockActual: 3200 },
  { id: "MP-009", nome: "Embalagem PEAD 20L", unidade: "un", stockActual: 1100 },
  { id: "MP-010", nome: "Tampa Roscada 28mm", unidade: "un", stockActual: 12000 },
];

const ORDENS_ABERTAS: OrdemProducao[] = [
  {
    id: "OP-2026-0641",
    produto: "Lixívia Multiuso 5L",
    qtdOrdenada: 800,
    unidade: "un",
    dataInicio: "2026-06-19",
    operador: "Beatriz Venâncio",
  },
  {
    id: "OP-2026-0638",
    produto: "Lixívia Multiuso 1L",
    qtdOrdenada: 2000,
    unidade: "un",
    dataInicio: "2026-06-18",
    operador: "António Moisés",
  },
  {
    id: "OP-2026-0635",
    produto: "Hipoclorito de Sódio 20L",
    qtdOrdenada: 450,
    unidade: "un",
    dataInicio: "2026-06-17",
    operador: "Carlota Nzinga",
  },
  {
    id: "OP-2026-0630",
    produto: "Hipoclorito de Sódio 5L",
    qtdOrdenada: 1200,
    unidade: "un",
    dataInicio: "2026-06-16",
    operador: "Domingos Ferreira",
  },
  {
    id: "OP-2026-0625",
    produto: "Lixívia Multiuso 20L",
    qtdOrdenada: 300,
    unidade: "un",
    dataInicio: "2026-06-15",
    operador: "Esperança Luvualu",
  },
];

const OPERADORES: string[] = [
  "Beatriz Venâncio",
  "António Moisés",
  "Carlota Nzinga",
  "Domingos Ferreira",
  "Esperança Luvualu",
  "Francisco Mbala",
  "Graça Kapuanga",
];

// KPIs resumo do mês
const KPI_MES = {
  registosJunho: 47,
  qtdTotalL: 38200,
  qtdTotalKg: 6840,
  ordemPendentes: 5,
};

// ─── Componente auxiliar ──────────────────────────────────────────────────────

function gerarIdLinha(): string {
  return Math.random().toString(36).slice(2, 9);
}

function linhaVazia(): LinhaConsumo {
  return { id: gerarIdLinha(), materiaPrimaId: "", qtdPrevista: 0, qtdReal: 0 };
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RegistoConsumoPage() {
  const [ordemId, setOrdemId] = useState<string>("");
  const [dataRegisto, setDataRegisto] = useState<string>("2026-06-19");
  const [operador, setOperador] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  const [linhas, setLinhas] = useState<LinhaConsumo[]>([linhaVazia()]);
  const [guardado, setGuardado] = useState<boolean>(false);
  const [erro, setErro] = useState<string>("");

  const ordemSel = ORDENS_ABERTAS.find((o) => o.id === ordemId) ?? null;

  // Pré-preenche operador quando a OP é seleccionada
  function handleOrdemChange(id: string): void {
    setOrdemId(id);
    const op = ORDENS_ABERTAS.find((o) => o.id === id);
    if (op) setOperador(op.operador);
    setGuardado(false);
    setErro("");
  }

  function handleAddLinha(): void {
    setLinhas((prev) => [...prev, linhaVazia()]);
  }

  function handleRemoveLinha(id: string): void {
    setLinhas((prev) => prev.filter((l) => l.id !== id));
  }

  function handleLinhaChange<K extends keyof LinhaConsumo>(
    id: string,
    field: K,
    value: LinhaConsumo[K]
  ): void {
    setLinhas((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  }

  function handleGuardar(e: React.FormEvent): void {
    e.preventDefault();
    if (!ordemId) { setErro("Seleccione uma Ordem de Produção."); return; }
    if (!operador) { setErro("Indique o operador responsável."); return; }
    if (linhas.length === 0) { setErro("Adicione pelo menos uma linha de consumo."); return; }
    const incompleta = linhas.find((l) => !l.materiaPrimaId || l.qtdReal <= 0);
    if (incompleta) { setErro("Preencha a matéria-prima e quantidade real em todas as linhas."); return; }
    setErro("");
    setGuardado(true);
  }

  function handleNovo(): void {
    setOrdemId("");
    setDataRegisto("2026-06-19");
    setOperador("");
    setObservacoes("");
    setLinhas([linhaVazia()]);
    setGuardado(false);
    setErro("");
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-live" />
            Registo de Consumo
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Registe o consumo de matérias-primas para ordens de produção em curso.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Módulo em desenvolvimento
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — os registos ainda não actualizam automaticamente o stock no Primavera ERP.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Registos — Jun</p>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">{KPI_MES.registosJunho}</p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-emerald-500" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total Consumido (L)</p>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">
            {KPI_MES.qtdTotalL.toLocaleString("pt-AO")} L
          </p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Total Consumido (kg)</p>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">
            {KPI_MES.qtdTotalKg.toLocaleString("pt-AO")} kg
          </p>
        </div>
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="h-4 w-4 text-violet-500" />
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">OP em Aberto</p>
          </div>
          <p className="text-2xl font-bold text-ink dark:text-gray-100">{KPI_MES.ordemPendentes}</p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleGuardar} className="space-y-5">

        {/* Cabeçalho do registo */}
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold text-ink-mid dark:text-gray-300 uppercase tracking-wide">
            Dados da Ordem
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Ordem de Produção */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink-mid dark:text-gray-300 mb-1">
                Ordem de Produção <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
                <select
                  value={ordemId}
                  onChange={(e) => handleOrdemChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                >
                  <option value="">Seleccionar ordem em aberto...</option>
                  {ORDENS_ABERTAS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.produto} ({o.qtdOrdenada} {o.unidade}) — {o.dataInicio}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
              </div>
              {ordemSel && (
                <div className="mt-2 rounded-lg bg-live-dim dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs text-live dark:text-emerald-300 flex flex-wrap gap-4">
                  <span><strong>Produto:</strong> {ordemSel.produto}</span>
                  <span><strong>Qtd Ordenada:</strong> {ordemSel.qtdOrdenada} {ordemSel.unidade}</span>
                  <span><strong>Operador previsto:</strong> {ordemSel.operador}</span>
                </div>
              )}
            </div>

            {/* Data do Registo */}
            <div>
              <label className="block text-sm font-medium text-ink-mid dark:text-gray-300 mb-1">
                Data do Registo <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
                <input
                  type="date"
                  value={dataRegisto}
                  onChange={(e) => setDataRegisto(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Operador */}
            <div>
              <label className="block text-sm font-medium text-ink-mid dark:text-gray-300 mb-1">
                Operador Responsável <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
                <select
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                >
                  <option value="">Seleccionar operador...</option>
                  {OPERADORES.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Linhas de consumo */}
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
            <h2 className="text-sm font-semibold text-ink-mid dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
              <PackageSearch className="h-4 w-4" />
              Matérias-Primas Consumidas
            </h2>
            <button
              type="button"
              onClick={handleAddLinha}
              className="inline-flex items-center gap-1.5 rounded-lg bg-live-dim dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-semibold text-live dark:text-emerald-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar linha
            </button>
          </div>

          {/* Cabeçalho da tabela */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-surface dark:bg-gray-800/50 text-xs text-ink-mid/70 dark:text-ink-mid/60">
                  <th className="px-4 py-3 text-left font-medium w-56">Matéria-Prima</th>
                  <th className="px-4 py-3 text-center font-medium w-16">Un.</th>
                  <th className="px-4 py-3 text-right font-medium w-36">Qtd Prevista</th>
                  <th className="px-4 py-3 text-right font-medium w-36">Qtd Real</th>
                  <th className="px-4 py-3 text-center font-medium w-20">Desvio</th>
                  <th className="px-4 py-3 text-center font-medium w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                {linhas.map((linha) => {
                  const mp = MATERIAS_PRIMAS.find((m) => m.id === linha.materiaPrimaId);
                  const desvio =
                    linha.qtdPrevista > 0
                      ? (((linha.qtdReal - linha.qtdPrevista) / linha.qtdPrevista) * 100).toFixed(1)
                      : "—";
                  const desvioNum =
                    linha.qtdPrevista > 0
                      ? ((linha.qtdReal - linha.qtdPrevista) / linha.qtdPrevista) * 100
                      : null;

                  return (
                    <tr key={linha.id} className="hover:bg-surface dark:hover:bg-gray-800/20 transition-colors">
                      {/* Matéria-Prima */}
                      <td className="px-4 py-2.5">
                        <div className="relative">
                          <select
                            value={linha.materiaPrimaId}
                            onChange={(e) =>
                              handleLinhaChange(linha.id, "materiaPrimaId", e.target.value)
                            }
                            className="w-full pr-6 py-1.5 rounded-md border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                          >
                            <option value="">Seleccionar...</option>
                            {MATERIAS_PRIMAS.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nome}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-ink-mid/50 pointer-events-none" />
                        </div>
                        {mp && (
                          <p className="mt-0.5 text-xs text-ink-mid/50 dark:text-gray-500">
                            Stock: {mp.stockActual.toLocaleString("pt-AO")} {mp.unidade}
                          </p>
                        )}
                      </td>

                      {/* Unidade */}
                      <td className="px-4 py-2.5 text-center text-xs text-ink-mid/70 dark:text-ink-mid/60">
                        {mp ? mp.unidade : "—"}
                      </td>

                      {/* Qtd Prevista */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={linha.qtdPrevista || ""}
                          onChange={(e) =>
                            handleLinhaChange(linha.id, "qtdPrevista", parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full text-right px-2 py-1.5 rounded-md border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Qtd Real */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={linha.qtdReal || ""}
                          onChange={(e) =>
                            handleLinhaChange(linha.id, "qtdReal", parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full text-right px-2 py-1.5 rounded-md border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Desvio */}
                      <td className="px-4 py-2.5 text-center">
                        {desvioNum !== null ? (
                          <span
                            className={`text-xs font-semibold ${
                              desvioNum > 2
                                ? "text-danger dark:text-red-400"
                                : desvioNum < -2
                                ? "text-live dark:text-emerald-400"
                                : "text-ink-mid/70 dark:text-ink-mid/60"
                            }`}
                          >
                            {desvioNum >= 0 ? "+" : ""}
                            {desvio}%
                          </span>
                        ) : (
                          <span className="text-xs text-ink-mid/50">—</span>
                        )}
                      </td>

                      {/* Remover */}
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLinha(linha.id)}
                          disabled={linhas.length === 1}
                          className="p-1 rounded text-ink-mid/50 hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observações */}
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-6 shadow-sm">
          <label className="block text-sm font-medium text-ink-mid dark:text-gray-300 mb-2">
            Observações
          </label>
          <textarea
            rows={3}
            placeholder="Notas sobre o consumo, condições de produção, anomalias detectadas..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        {/* Feedback */}
        {erro && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/8 dark:bg-red-900/20 border border-danger/30 dark:border-red-800 px-4 py-3 text-sm text-danger dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erro}
          </div>
        )}
        {guardado && (
          <div className="flex items-center gap-2 rounded-lg bg-live-dim dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-live dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Registo de consumo para <strong>{ordemId}</strong> guardado com sucesso em {dataRegisto}.
          </div>
        )}

        {/* Acções */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-live hover:bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Save className="h-4 w-4" />
            Guardar Registo
          </button>
          {guardado && (
            <button
              type="button"
              onClick={handleNovo}
              className="inline-flex items-center gap-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 hover:bg-surface dark:hover:bg-ink-ghost/20 px-5 py-2.5 text-sm font-medium text-ink-mid dark:text-gray-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Novo Registo
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
