"use client";

import { useState } from "react";
import {
  FlaskConical,
  CalendarDays,
  Layers,
  Warehouse,
  User,
  Save,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const PRODUTOS = [
  { id: "HIPO-5L", nome: "Hipoclorito de Sódio 5L", unidade: "L" },
  { id: "HIPO-20L", nome: "Hipoclorito de Sódio 20L", unidade: "L" },
  { id: "KITOKA-1L", nome: "Lixívia KITOKA 1L", unidade: "L" },
  { id: "KITOKA-5L", nome: "Lixívia KITOKA 5L", unidade: "L" },
  { id: "KITOKA-20L", nome: "Lixívia KITOKA 20L", unidade: "L" },
];

const ARMAZENS = [
  "Armazém Central – Luanda",
  "Armazém Norte – Malanje",
  "Armazém Sul – Benguela",
  "Armazém Exportação",
];

const RESPONSAVEIS = [
  "Beatriz Venâncio",
  "António Moisés",
  "Carlota Nzinga",
  "Domingos Ferreira",
  "Esperança Luvualu",
];

function gerarNumeroLote(produtoId: string): string {
  const now = new Date();
  const ano = now.getFullYear().toString().slice(2);
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  const seq = Math.floor(Math.random() * 900) + 100;
  const prefix = produtoId.startsWith("KITOKA") ? "KTK" : "HIP";
  return `${prefix}-${ano}${mes}${dia}-${seq}`;
}

export default function NovoLoteProducaoPage() {
  const [produto, setProduto] = useState("");
  const [dataProducao, setDataProducao] = useState("2026-06-18");
  const [quantidade, setQuantidade] = useState("");
  const [armazem, setArmazem] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [erro, setErro] = useState("");

  const produtoObj = PRODUTOS.find((p) => p.id === produto);
  const numeroLote = produto ? gerarNumeroLote(produto) : "—";

  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!produto || !quantidade || !armazem || !responsavel) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    setErro("");
    setGuardado(true);
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-gray-100 flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-live" />
            Novo Lote de Produção
          </h1>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Registe um novo lote fabricado na linha de produção da Aquasan Angola.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Módulo em desenvolvimento
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-700 dark:text-violet-300">
        Módulo em desenvolvimento — os dados registados ainda não são enviados para o Primavera ERP.
      </div>

      {/* Formulário */}
      <form onSubmit={handleGuardar} className="space-y-5">
        <div className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-6 shadow-sm space-y-5">

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
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
            </div>
          </div>

          {/* Número de Lote (auto-gerado) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número de Lote <span className="text-ink-mid/50 text-xs">(auto-gerado)</span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
              <input
                type="text"
                readOnly
                value={numeroLote}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20 bg-surface dark:bg-gray-800/60 text-ink-mid/70 dark:text-ink-mid/60 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Data de Produção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Produção <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50" />
              <input
                type="date"
                value={dataProducao}
                onChange={(e) => setDataProducao(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quantidade Produzida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantidade Produzida{produtoObj ? ` (${produtoObj.unidade})` : ""} <span className="text-danger">*</span>
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
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
            </div>
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Responsável <span className="text-danger">*</span>
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
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mid/50 pointer-events-none" />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              rows={3}
              placeholder="Notas adicionais sobre o lote..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-ink-ghost/80 dark:border-gray-600 bg-panel dark:bg-surface dark:bg-ink-ghost/20 text-ink dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Feedback */}
        {erro && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/8 dark:bg-red-900/20 border border-danger/30 dark:border-red-800 px-4 py-3 text-sm text-danger dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erro}
          </div>
        )}
        {guardado && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Lote <strong>{numeroLote}</strong> guardado com sucesso.
          </div>
        )}

        {/* Botão */}
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-live hover:bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Save className="h-4 w-4" />
          Guardar Lote
        </button>
      </form>
    </div>
  );
}
