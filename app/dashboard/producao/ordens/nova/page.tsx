"use client";

import { useState } from "react";
import {
  FlaskConical,
  CalendarDays,
  ClipboardList,
  Warehouse,
  User,
  Save,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Factory,
  Beaker,
  Droplets,
  Layers,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Produto {
  id: string;
  nome: string;
  unidade: string;
  capacidade_tanque_l: number;
  concentracao_pct: number;
}

interface MateriaPrima {
  id: string;
  nome: string;
  unidade: string;
  consumo_por_litro: number;
}

interface LinhaMateria {
  materia_id: string;
  nome: string;
  unidade: string;
  quantidade: number;
}

// ─── Dados mock ───────────────────────────────────────────────────────────────

const PRODUTOS: Produto[] = [
  {
    id: "HIPO-5L",
    nome: "Hipoclorito de Sódio Multiuso 5L",
    unidade: "L",
    capacidade_tanque_l: 5000,
    concentracao_pct: 4,
  },
  {
    id: "HIPO-20L",
    nome: "Hipoclorito de Sódio Multiuso 20L",
    unidade: "L",
    capacidade_tanque_l: 10000,
    concentracao_pct: 4,
  },
  {
    id: "LIXIVIA-1L",
    nome: "Lixívia Multiuso 1L",
    unidade: "L",
    capacidade_tanque_l: 3000,
    concentracao_pct: 3.5,
  },
  {
    id: "LIXIVIA-5L",
    nome: "Lixívia Multiuso 5L",
    unidade: "L",
    capacidade_tanque_l: 5000,
    concentracao_pct: 3.5,
  },
  {
    id: "LIXIVIA-20L",
    nome: "Lixívia Multiuso 20L",
    unidade: "L",
    capacidade_tanque_l: 10000,
    concentracao_pct: 3.5,
  },
  {
    id: "CLORO-GAS",
    nome: "Cloro Gasoso — Cilindro 45 kg",
    unidade: "kg",
    capacidade_tanque_l: 0,
    concentracao_pct: 100,
  },
];

const MATERIAS_PRIMAS: MateriaPrima[] = [
  { id: "CLORO-LIQ", nome: "Cloro Líquido (NaOCl 10%)", unidade: "L", consumo_por_litro: 0.4 },
  { id: "SODA-CAUST", nome: "Soda Cáustica (NaOH)", unidade: "kg", consumo_por_litro: 0.02 },
  { id: "AGUA-DESM", nome: "Água Desmineralizada", unidade: "L", consumo_por_litro: 0.6 },
  { id: "ESTAB-CLORO", nome: "Estabilizante de Cloro", unidade: "kg", consumo_por_litro: 0.005 },
  { id: "PERF-CITRICO", nome: "Perfume Cítrico (para lixívia)", unidade: "mL", consumo_por_litro: 3 },
];

const LINHAS_PRODUCAO: string[] = [
  "Linha A — Hipoclorito (Luanda)",
  "Linha B — Lixívia (Luanda)",
  "Linha C — Multiusos (Viana)",
  "Linha D — Exportação (Porto de Luanda)",
];

const ARMAZENS: string[] = [
  "Armazém Central — Luanda",
  "Armazém Norte — Malanje",
  "Armazém Sul — Benguela",
  "Armazém Exportação",
];

const RESPONSAVEIS: string[] = [
  "Beatriz Venâncio",
  "António Moisés",
  "Carlota Nzinga",
  "Domingos Ferreira",
  "Esperança Luvualu",
  "Francisco Bumba",
  "Graça Kapinga",
];

const PRIORIDADES: { value: string; label: string; cor: string }[] = [
  { value: "normal", label: "Normal", cor: "bg-surface text-gray-700 dark:bg-ink-ghost/20 dark:text-gray-300" },
  { value: "alta", label: "Alta", cor: "bg-amber/15 text-amber dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "urgente", label: "Urgente", cor: "bg-danger/10 text-danger dark:bg-red-900/40 dark:text-red-300" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gerarNumeroOrdem(): string {
  const now = new Date();
  const ano = now.getFullYear().toString().slice(2);
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `OP-${ano}${mes}${dia}-${seq}`;
}

function calcularLinhasMateria(produtoId: string, qtd: number): LinhaMateria[] {
  const produto = PRODUTOS.find((p) => p.id === produtoId);
  if (!produto || qtd <= 0) return [];

  const isLixivia = produtoId.startsWith("LIXIVIA");
  const materias: string[] = isLixivia
    ? ["CLORO-LIQ", "SODA-CAUST", "AGUA-DESM", "ESTAB-CLORO", "PERF-CITRICO"]
    : ["CLORO-LIQ", "SODA-CAUST", "AGUA-DESM", "ESTAB-CLORO"];

  return materias.map((mid) => {
    const mp = MATERIAS_PRIMAS.find((m) => m.id === mid)!;
    return {
      materia_id: mid,
      nome: mp.nome,
      unidade: mp.unidade,
      quantidade: Math.round(qtd * mp.consumo_por_litro * 100) / 100,
    };
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function NovaOrdemProducaoPage() {
  const numeroOrdem = useState<string>(() => gerarNumeroOrdem())[0];

  const [produto, setProduto] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("2026-06-19");
  const [dataFim, setDataFim] = useState<string>("2026-06-19");
  const [quantidade, setQuantidade] = useState<string>("");
  const [linha, setLinha] = useState<string>("");
  const [armazem, setArmazem] = useState<string>("");
  const [responsavel, setResponsavel] = useState<string>("");
  const [prioridade, setPrioridade] = useState<string>("normal");
  const [observacoes, setObservacoes] = useState<string>("");
  const [guardado, setGuardado] = useState<boolean>(false);
  const [erro, setErro] = useState<string>("");

  const produtoObj = PRODUTOS.find((p) => p.id === produto) ?? null;
  const qtdNum = parseFloat(quantidade) || 0;
  const linhasMateria = calcularLinhasMateria(produto, qtdNum);
  const prioridadeObj = PRIORIDADES.find((p) => p.value === prioridade) ?? PRIORIDADES[0];

  function handleGuardar(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!produto || !quantidade || !linha || !armazem || !responsavel) {
      setErro("Preencha todos os campos obrigatórios marcados com *.");
      return;
    }
    if (qtdNum <= 0) {
      setErro("A quantidade produzida deve ser superior a zero.");
      return;
    }
    setErro("");
    setGuardado(true);
  }

  function handleNovo(): void {
    setProduto("");
    setQuantidade("");
    setLinha("");
    setArmazem("");
    setResponsavel("");
    setPrioridade("normal");
    setObservacoes("");
    setGuardado(false);
    setErro("");
  }

  // ── KPIs rápidos ────────────────────────────────────────────────────────────
  const kpis: { label: string; valor: string; sub: string; cor: string; icone: React.ReactNode }[] = [
    {
      label: "Ordens em Aberto",
      valor: "12",
      sub: "Hoje",
      cor: "text-ink dark:text-blue-400",
      icone: <ClipboardList className="h-5 w-5" />,
    },
    {
      label: "Volume Planeado",
      valor: "47 800 L",
      sub: "Este mês",
      cor: "text-live dark:text-emerald-400",
      icone: <Droplets className="h-5 w-5" />,
    },
    {
      label: "Linhas Activas",
      valor: "3 / 4",
      sub: "Capacidade",
      cor: "text-violet-600 dark:text-violet-400",
      icone: <Factory className="h-5 w-5" />,
    },
    {
      label: "Eficiência Média",
      valor: "92 %",
      sub: "Últimos 30 dias",
      cor: "text-amber dark:text-amber-400",
      icone: <Beaker className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <Factory className="h-7 w-7 text-live" />
            Nova Ordem de Produção
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Crie uma ordem de produção de hipoclorito ou lixívia multiuso para a linha de produção.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Módulo em desenvolvimento
        </span>
      </div>

      {/* ── Banner ────────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — as ordens criadas ainda não são enviadas para o Primavera ERP / gateway de produção.
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4 shadow-sm"
          >
            <div className={`flex items-center gap-2 ${k.cor} mb-1`}>
              {k.icone}
              <span className="text-xs font-medium">{k.label}</span>
            </div>
            <p className="text-2xl font-bold text-ink dark:text-gray-100">{k.valor}</p>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Formulário ────────────────────────────────────────────────────── */}
      <form onSubmit={handleGuardar} className="space-y-5">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-6 shadow-sm space-y-5">

          {/* Número da Ordem (auto-gerado) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número da Ordem{" "}
              <span className="text-ink-mid/50 text-xs">(auto-gerado)</span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
              <input
                type="text"
                readOnly
                value={numeroOrdem}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/60 dark:border-gray-700 bg-surface dark:bg-gray-800/60 text-ink-mid/70 dark:text-ink-mid/60 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Produto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Produto <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
              <select
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="">Seleccionar produto...</option>
                {PRODUTOS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
            </div>
            {produtoObj && (
              <p className="mt-1 text-xs text-ink-mid/70 dark:text-ink-mid/60">
                Concentração: {produtoObj.concentracao_pct}% — Capacidade do tanque:{" "}
                {produtoObj.capacidade_tanque_l > 0
                  ? `${produtoObj.capacidade_tanque_l.toLocaleString("pt-AO")} L`
                  : "N/A"}
              </p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantidade a Produzir{produtoObj ? ` (${produtoObj.unidade})` : ""}{" "}
              <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="0.1"
                placeholder="Ex: 5000"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {produtoObj && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-mid/70 dark:text-ink-mid/60">
                  {produtoObj.unidade}
                </span>
              )}
            </div>
          </div>

          {/* Linha de Produção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Linha de Produção <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Factory className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
              <select
                value={linha}
                onChange={(e) => setLinha(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="">Seleccionar linha...</option>
                {LINHAS_PRODUCAO.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Início <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Conclusão Prevista <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Armazém Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Armazém Destino <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
              <select
                value={armazem}
                onChange={(e) => setArmazem(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="">Seleccionar armazém...</option>
                {ARMAZENS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
            </div>
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Responsável de Produção <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
              <select
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="">Seleccionar responsável...</option>
                {RESPONSAVEIS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridade
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRIORIDADES.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setPrioridade(p.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    prioridade === p.value
                      ? `${p.cor} border-current ring-2 ring-offset-1 ring-current`
                      : "border-ink-ghost/60 dark:border-gray-700 text-ink-mid/70 dark:text-ink-mid/60 hover:border-gray-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              rows={3}
              placeholder="Notas adicionais sobre a ordem de produção..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* ── Necessidade de Matérias-Primas ──────────────────────────────── */}
        {linhasMateria.length > 0 && (
          <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15 flex items-center gap-2">
              <Beaker className="h-5 w-5 text-live" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Necessidade Estimada de Matérias-Primas
              </h2>
              <span className="ml-auto text-xs text-ink-mid/50">para {qtdNum.toLocaleString("pt-AO")} {produtoObj?.unidade}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface dark:bg-gray-800/50 text-xs uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                    <th className="px-5 py-3 text-left font-medium">Matéria-Prima</th>
                    <th className="px-5 py-3 text-right font-medium">Quantidade</th>
                    <th className="px-5 py-3 text-right font-medium">Unidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                  {linhasMateria.map((lm) => (
                    <tr
                      key={lm.materia_id}
                      className="hover:bg-surface dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-800 dark:text-gray-200">{lm.nome}</td>
                      <td className="px-5 py-3 text-right font-mono text-ink dark:text-gray-100 font-semibold">
                        {lm.quantidade.toLocaleString("pt-AO", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3 text-right text-ink-mid/70 dark:text-ink-mid/60">{lm.unidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-surface dark:bg-gray-800/30 text-xs text-ink-mid/50 dark:text-gray-500">
              Valores calculados automaticamente com base na fórmula padrão da empresa — sujeitos a confirmação laboratorial.
            </div>
          </div>
        )}

        {/* ── Feedback ──────────────────────────────────────────────────── */}
        {erro && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/8 dark:bg-red-900/20 border border-danger/30 dark:border-red-800 px-4 py-3 text-sm text-danger dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erro}
          </div>
        )}
        {guardado && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-4 space-y-1">
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Ordem <strong>{numeroOrdem}</strong> criada com sucesso.
            </div>
            <p className="text-xs text-live dark:text-live pl-6">
              Produto: {produtoObj?.nome} — {qtdNum.toLocaleString("pt-AO")} {produtoObj?.unidade} — Prioridade:{" "}
              {prioridadeObj.label} — Responsável: {responsavel}
            </p>
          </div>
        )}

        {/* ── Acções ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          {!guardado ? (
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-live hover:bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Save className="h-4 w-4" />
              Criar Ordem de Produção
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNovo}
              className="flex items-center gap-2 rounded-lg bg-surface dark:bg-ink-ghost/20 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <ClipboardList className="h-4 w-4" />
              Nova Ordem
            </button>
          )}
          <a
            href="/dashboard/producao"
            className="flex items-center gap-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
