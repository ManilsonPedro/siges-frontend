"use client";

import { useState } from "react";
import { Building2, Filter, Download, Info, TrendingDown, TrendingUp } from "lucide-react";

const CENTROS_CUSTO = [
  {
    codigo: "CC001",
    descricao: "Produção Hipoclorito de Sódio",
    responsavel: "Eng. Carlos Mbemba",
    ativo: true,
    contas: [
      { conta: "6211", descricao: "Matérias-primas", jan: 4850000, fev: 5120000, mar: 4990000 },
      { conta: "6221", descricao: "Mão-de-obra directa", jan: 2100000, fev: 2100000, mar: 2100000 },
      { conta: "6231", descricao: "Energia eléctrica", jan: 980000, fev: 1050000, mar: 920000 },
      { conta: "6241", descricao: "Amortizações equipamentos", jan: 650000, fev: 650000, mar: 650000 },
      { conta: "6251", descricao: "Manutenção e reparações", jan: 320000, fev: 180000, mar: 450000 },
    ],
  },
  {
    codigo: "CC002",
    descricao: "Produção Lixívia Multiuso",
    responsavel: "Eng. Filomena Nsimba",
    ativo: true,
    contas: [
      { conta: "6211", descricao: "Matérias-primas", jan: 3200000, fev: 3450000, mar: 3310000 },
      { conta: "6221", descricao: "Mão-de-obra directa", jan: 1680000, fev: 1680000, mar: 1680000 },
      { conta: "6231", descricao: "Energia eléctrica", jan: 740000, fev: 810000, mar: 695000 },
      { conta: "6241", descricao: "Amortizações equipamentos", jan: 420000, fev: 420000, mar: 420000 },
      { conta: "6251", descricao: "Manutenção e reparações", jan: 210000, fev: 95000, mar: 310000 },
    ],
  },
  {
    codigo: "CC003",
    descricao: "Armazém e Logística",
    responsavel: "Alberto Domingos Teta",
    ativo: true,
    contas: [
      { conta: "6221", descricao: "Mão-de-obra directa", jan: 1260000, fev: 1260000, mar: 1260000 },
      { conta: "6231", descricao: "Combustíveis e lubrificantes", jan: 890000, fev: 950000, mar: 870000 },
      { conta: "6241", descricao: "Amortizações viaturas", jan: 380000, fev: 380000, mar: 380000 },
      { conta: "6252", descricao: "Seguros de viaturas", jan: 145000, fev: 145000, mar: 145000 },
    ],
  },
  {
    codigo: "CC004",
    descricao: "Administração e Gestão",
    responsavel: "Beatriz Venâncio",
    ativo: true,
    contas: [
      { conta: "6221", descricao: "Remunerações pessoal administrativo", jan: 3850000, fev: 3850000, mar: 3850000 },
      { conta: "6222", descricao: "Encargos sociais", jan: 770000, fev: 770000, mar: 770000 },
      { conta: "6231", descricao: "Electricidade escritórios", jan: 185000, fev: 195000, mar: 175000 },
      { conta: "6261", descricao: "Comunicações", jan: 320000, fev: 310000, mar: 330000 },
      { conta: "6271", descricao: "Deslocações e representação", jan: 580000, fev: 420000, mar: 690000 },
    ],
  },
  {
    codigo: "CC005",
    descricao: "Comercial e Marketing",
    responsavel: "António Mbala Sousa",
    ativo: true,
    contas: [
      { conta: "6221", descricao: "Remunerações equipa comercial", jan: 2100000, fev: 2100000, mar: 2100000 },
      { conta: "6261", descricao: "Publicidade e propaganda", jan: 450000, fev: 380000, mar: 520000 },
      { conta: "6271", descricao: "Representação clientes", jan: 310000, fev: 290000, mar: 350000 },
      { conta: "6281", descricao: "Comissões de vendas", jan: 680000, fev: 720000, mar: 650000 },
    ],
  },
];

const PERIODOS = [
  { value: "jan2026", label: "Janeiro 2026" },
  { value: "fev2026", label: "Fevereiro 2026" },
  { value: "mar2026", label: "Março 2026" },
  { value: "q1-2026", label: "Q1 2026 (Jan–Mar)" },
];

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(v);

const colPorPeriodo = (periodo: string, contas: typeof CENTROS_CUSTO[0]["contas"]) => {
  if (periodo === "jan2026") return contas.map((c) => ({ ...c, valor: c.jan }));
  if (periodo === "fev2026") return contas.map((c) => ({ ...c, valor: c.fev }));
  if (periodo === "mar2026") return contas.map((c) => ({ ...c, valor: c.mar }));
  return contas.map((c) => ({ ...c, valor: c.jan + c.fev + c.mar }));
};

export default function CentrosCustoPage() {
  const [periodoSel, setPeriodoSel] = useState("mar2026");
  const [centroSel, setCentroSel] = useState("todos");
  const [expandidos, setExpandidos] = useState<string[]>(["CC001"]);

  const centrosFiltrados =
    centroSel === "todos" ? CENTROS_CUSTO : CENTROS_CUSTO.filter((c) => c.codigo === centroSel);

  const toggleExpand = (codigo: string) =>
    setExpandidos((prev) =>
      prev.includes(codigo) ? prev.filter((x) => x !== codigo) : [...prev, codigo]
    );

  const totalCentro = (centro: typeof CENTROS_CUSTO[0]) =>
    colPorPeriodo(periodoSel, centro.contas).reduce((s, c) => s + c.valor, 0);

  const totalGeral = centrosFiltrados.reduce((s, c) => s + totalCentro(c), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Banner Primavera */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <Info className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">
          Dados sincronizados do Primavera ERP — apenas leitura
        </span>
        <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold dark:bg-blue-900">
          Primavera
        </span>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-ink dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Centros de Custo Analíticos
            </h1>
          </div>
          <p className="mt-1 text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Gastos por conta contabilística agrupados por centro de custo
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-ink-ghost/60 bg-panel px-4 py-2 text-sm font-medium text-ink-mid shadow-sm hover:bg-surface dark:border-ink-ghost/20 dark:bg-panel dark:text-gray-200 dark:hover:bg-ink-ghost/20">
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-mid/50" />
          <span className="text-sm font-medium text-ink-mid dark:text-ink-mid/60">Filtros:</span>
        </div>
        <select
          value={periodoSel}
          onChange={(e) => setPeriodoSel(e.target.value)}
          className="rounded-lg border border-ink-ghost/60 bg-panel px-3 py-1.5 text-sm text-ink-mid shadow-sm dark:border-ink-ghost/20 dark:bg-panel dark:text-gray-200"
        >
          {PERIODOS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={centroSel}
          onChange={(e) => setCentroSel(e.target.value)}
          className="rounded-lg border border-ink-ghost/60 bg-panel px-3 py-1.5 text-sm text-ink-mid shadow-sm dark:border-ink-ghost/20 dark:bg-panel dark:text-gray-200"
        >
          <option value="todos">Todos os centros</option>
          {CENTROS_CUSTO.map((c) => (
            <option key={c.codigo} value={c.codigo}>
              {c.codigo} — {c.descricao}
            </option>
          ))}
        </select>
      </div>

      {/* Totalizador */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {centrosFiltrados.map((centro) => (
          <div
            key={centro.codigo}
            className="rounded-xl border border-ink-ghost/40 bg-panel p-4 shadow-sm dark:border-gray-700 dark:bg-panel"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
              {centro.codigo}
            </p>
            <p className="mt-1 text-sm font-medium text-ink-mid dark:text-gray-200 line-clamp-2">
              {centro.descricao}
            </p>
            <p className="mt-2 text-lg font-bold text-ink dark:text-white">
              {fmt(totalCentro(centro))}
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Total Geral
          </p>
          <p className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-300">
            Período seleccionado
          </p>
          <p className="mt-2 text-lg font-bold text-blue-900 dark:text-white">{fmt(totalGeral)}</p>
        </div>
      </div>

      {/* Tabela por centro */}
      <div className="space-y-4">
        {centrosFiltrados.map((centro) => {
          const aberto = expandidos.includes(centro.codigo);
          const contasValor = colPorPeriodo(periodoSel, centro.contas);
          const total = contasValor.reduce((s, c) => s + c.valor, 0);

          return (
            <div
              key={centro.codigo}
              className="overflow-hidden rounded-xl border border-ink-ghost/60 bg-panel shadow-sm dark:border-gray-700 dark:bg-panel"
            >
              <button
                onClick={() => toggleExpand(centro.codigo)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-surface dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {centro.codigo}
                  </span>
                  <div>
                    <p className="font-semibold text-ink dark:text-white">{centro.descricao}</p>
                    <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">
                      Responsável: {centro.responsavel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-bold text-ink dark:text-white">
                    {fmt(total)}
                  </span>
                  <span className="text-ink-mid/50">{aberto ? "▲" : "▼"}</span>
                </div>
              </button>

              {aberto && (
                <div className="overflow-x-auto border-t border-ink-ghost/40 dark:border-gray-700">
                  <table className="min-w-full text-sm">
                    <thead className="bg-surface dark:bg-gray-700/50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                          Conta
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                          Descrição
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                          Valor (AOA)
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-mid/70 dark:text-ink-mid/60">
                          % do Centro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
                      {contasValor.map((linha) => (
                        <tr
                          key={linha.conta}
                          className="hover:bg-surface dark:hover:bg-gray-700/30"
                        >
                          <td className="px-5 py-3 font-mono text-xs font-medium text-ink-mid dark:text-gray-300">
                            {linha.conta}
                          </td>
                          <td className="px-5 py-3 text-ink-mid dark:text-gray-300">
                            {linha.descricao}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-ink dark:text-white">
                            {fmt(linha.valor)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="inline-block w-16 rounded-full bg-blue-50 px-2 py-0.5 text-center text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                              {total > 0 ? ((linha.valor / total) * 100).toFixed(1) : "0.0"}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-surface dark:bg-gray-700/50">
                      <tr>
                        <td colSpan={2} className="px-5 py-3 font-bold text-ink dark:text-white">
                          Total {centro.codigo}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-blue-700 dark:text-blue-300">
                          {fmt(total)}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-blue-700 dark:text-blue-300">
                          100.0%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-mid/50 dark:text-gray-600">
        Última sincronização com Primavera ERP: 18/06/2026 às 08:30 • Fonte: Contabilidade Analítica
      </p>
    </div>
  );
}
