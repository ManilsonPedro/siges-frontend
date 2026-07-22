"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2, Tag, FileDown, FileText, Printer, Trash2, Plus, Search,
  Calendar, TrendingUp, TrendingDown, Loader2, X, Globe,
} from "lucide-react";
import {
  extratoService, fornecedorService, conceitoService, companyService,
  type ExtratoMovimento, type ExtratoGrupo,
} from "@/shared/services/financeiro.service";
import { formatCurrency, formatDate } from "@/shared/utils";

type TipoEntidade = "fornecedor" | "conceito";

interface Props {
  tipo: TipoEntidade;
}

export function ExtratoReport({ tipo }: Props) {
  // "todos" ou um UUID
  const [entityId, setEntityId] = useState<string>("");
  const [entityLabel, setEntityLabel] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const isTodos = entityId === "todos";

  // Lista de entidades para o combo
  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => fornecedorService.list(),
    enabled: tipo === "fornecedor",
  });
  const { data: conceitos = [] } = useQuery({
    queryKey: ["conceitos"],
    queryFn: () => conceitoService.list(),
    enabled: tipo === "conceito",
  });
  const entidades = tipo === "fornecedor" ? fornecedores : conceitos;

  // Dados da empresa
  const { data: empresa } = useQuery({
    queryKey: ["company-settings"],
    queryFn: companyService.get,
  });

  // Extrato singular
  const { data: dataSingular, isLoading: loadingSingular } = useQuery<any>({
    queryKey: ["extrato", tipo, entityId, dataInicio, dataFim],
    queryFn: () =>
      tipo === "fornecedor"
        ? extratoService.fornecedor(entityId, dataInicio || undefined, dataFim || undefined)
        : extratoService.conceito(entityId, dataInicio || undefined, dataFim || undefined),
    enabled: !!entityId && !isTodos,
  });

  // Extrato "todos"
  const { data: dataTodos, isLoading: loadingTodos } = useQuery({
    queryKey: ["extrato", tipo, "todos", dataInicio, dataFim],
    queryFn: () =>
      tipo === "fornecedor"
        ? extratoService.todosFornecedores(dataInicio || undefined, dataFim || undefined)
        : extratoService.todosConceitos(dataInicio || undefined, dataFim || undefined),
    enabled: isTodos,
  });

  const isLoading = loadingSingular || loadingTodos;

  const entidadesFiltradas = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return entidades;
    return entidades.filter((e) => (e.nome || "").toLowerCase().includes(q));
  }, [entidades, search]);

  // Construir grupos exibidos
  const grupos: ExtratoGrupo[] = useMemo(() => {
    if (isTodos && dataTodos) {
      return dataTodos.grupos.map((g) => ({
        ...g,
        movimentos: g.movimentos.filter((m) => !excludedIds.has(m.id)),
      })).filter((g) => g.movimentos.length > 0);
    }
    if (dataSingular && entityId) {
      const movs: ExtratoMovimento[] = dataSingular.movimentos.filter((m: ExtratoMovimento) => !excludedIds.has(m.id));
      const totais = {
        entradas: movs.filter((m: ExtratoMovimento) => m.tipo_movimento === "entrada").reduce((s: number, m: ExtratoMovimento) => s + m.valor, 0),
        saidas: movs.filter((m: ExtratoMovimento) => m.tipo_movimento === "saida").reduce((s: number, m: ExtratoMovimento) => s + m.valor, 0),
        saldo: 0,
        count: movs.length,
      };
      totais.saldo = totais.entradas - totais.saidas;
      const label = "fornecedor" in dataSingular ? dataSingular.fornecedor.nome : dataSingular.conceito.nome;
      return [{
        label,
        entidade: { id: "single", nome: label },
        movimentos: movs,
        totais,
      }];
    }
    return [];
  }, [isTodos, dataTodos, dataSingular, excludedIds, entityId]);

  const totaisGerais = useMemo(() => {
    let entradas = 0, saidas = 0, count = 0;
    grupos.forEach((g) => {
      entradas += g.totais.entradas;
      saidas += g.totais.saidas;
      count += g.totais.count;
    });
    return { entradas, saidas, saldo: entradas - saidas, count, n_grupos: grupos.length };
  }, [grupos]);

  // Entidade detalhe (para mostrar info)
  const entidadeDetalhe = !isTodos && dataSingular
    ? (tipo === "fornecedor" && "fornecedor" in dataSingular ? dataSingular.fornecedor : "conceito" in dataSingular ? dataSingular.conceito : null)
    : null;

  // Todos movimentos disponíveis (para "Adicionar excluído")
  const todosMovimentos: ExtratoMovimento[] = useMemo(() => {
    if (isTodos && dataTodos) return dataTodos.grupos.flatMap((g) => g.movimentos);
    if (dataSingular) return dataSingular.movimentos;
    return [];
  }, [isTodos, dataTodos, dataSingular]);

  function handleSelectEntity(id: string, label: string) {
    setEntityId(id);
    setEntityLabel(label);
    setSearch("");
    setExcludedIds(new Set());
  }

  async function handleExport(formato: "excel" | "pdf") {
    if (!entityId) return;
    setExporting(true);
    try {
      let blob: Blob;
      if (isTodos) {
        blob = await extratoService.exportTodos(tipo === "fornecedor" ? "fornecedores" : "conceitos", {
          formato, data_inicio: dataInicio || undefined, data_fim: dataFim || undefined,
        });
      } else {
        const incluidos = grupos[0]?.movimentos.map((m) => m.id) || [];
        blob = tipo === "fornecedor"
          ? await extratoService.exportFornecedor(entityId, { formato, data_inicio: dataInicio || undefined, data_fim: dataFim || undefined, movimentos_ids: incluidos })
          : await extratoService.exportConceito(entityId, { formato, data_inicio: dataInicio || undefined, data_fim: dataFim || undefined, movimentos_ids: incluidos });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const nome = isTodos ? `todos_${tipo}s` : entityLabel.replace(/\s+/g, "_");
      a.download = `extrato_${nome}.${formato === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao exportar");
    } finally {
      setExporting(false);
    }
  }

  const Icon = tipo === "fornecedor" ? Building2 : Tag;
  const tipoColunaAux = tipo === "fornecedor" ? "Conceito" : "Fornecedor";

  // Watermark style — só renderiza se houver logo
  const watermarkStyle: React.CSSProperties = empresa?.logo_url
    ? {
        backgroundImage: `url(${empresa.logo_url})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center 60%",
        backgroundSize: "60% auto",
      }
    : {};

  return (
    <div className="space-y-6">
      {/* Filtros (não imprimíveis) */}
      <div className="no-print bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              {tipo === "fornecedor" ? "Fornecedor" : "Conceito"}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectEntity("todos", "Todos")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isTodos ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50"
                }`}
              >
                <Globe className="h-4 w-4" /> Todos
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={entityId && !isTodos ? entityLabel : `Pesquisar ${tipo}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {search && entidadesFiltradas.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {entidadesFiltradas.slice(0, 10).map((e) => (
                      <button
                        key={e.id}
                        onClick={() => handleSelectEntity(e.id, e.nome)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <span className="font-medium">{e.nome}</span>
                        {tipo === "fornecedor" && "nif" in e && <span className="text-xs text-gray-500 ml-2">NIF {e.nif}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Data início</label>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Data fim</label>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800" />
            </div>
          </div>
        </div>

        {entityId && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm">
              <Printer className="h-3.5 w-3.5" /> Imprimir
            </button>
            <button onClick={() => handleExport("excel")} disabled={exporting} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm">
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
              Exportar Excel
            </button>
            <button onClick={() => handleExport("pdf")} disabled={exporting} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm">
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              Exportar PDF
            </button>
            {excludedIds.size > 0 && !isTodos && (
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm">
                <Plus className="h-3.5 w-3.5" /> Adicionar ({excludedIds.size})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Relatório */}
      {!entityId ? (
        <div className="text-center text-gray-400 py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Icon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Seleccione um {tipo} ou "Todos" para gerar o extrato.</p>
        </div>
      ) : isLoading ? (
        <div className="text-center text-gray-400 py-12 animate-pulse bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          A carregar extrato...
        </div>
      ) : (
        <div
          className="printable-area relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          {/* Watermark — overlay com pseudo-elemento via style inline */}
          {empresa?.logo_url && (
            <div
              aria-hidden="true"
              className="watermark pointer-events-none absolute inset-0 z-0"
              style={{
                ...watermarkStyle,
                opacity: 0.06,
              }}
            />
          )}

          <div className="relative z-10">
            {/* Cabeçalho do extrato */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {empresa?.logo_url && (
                    <img src={empresa.logo_url} alt="logo" className="w-16 h-16 object-contain rounded border border-gray-200" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{empresa?.nome || "AQUASAN"}</h2>
                    {empresa?.nif && <p className="text-xs text-gray-500">NIF: {empresa.nif}</p>}
                    {empresa?.morada && <p className="text-xs text-gray-500">{empresa.morada}</p>}
                    {(empresa?.telefone || empresa?.email) && (
                      <p className="text-xs text-gray-500">
                        {empresa.telefone && `Tel: ${empresa.telefone}`}
                        {empresa.telefone && empresa.email && " · "}
                        {empresa.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Data emissão</p>
                  <p className="text-sm font-medium">{new Date().toLocaleDateString("pt-PT")}</p>
                </div>
              </div>
            </div>

            {/* Bloco da entidade ou "TODOS" */}
            <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  {isTodos
                    ? `Extrato — Todos os ${tipo === "fornecedor" ? "Fornecedores" : "Conceitos"}`
                    : `Extrato por ${tipo === "fornecedor" ? "Fornecedor" : "Conceito"}`}
                </h3>
              </div>
              {!isTodos && entidadeDetalhe && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{entidadeDetalhe.nome}</span></div>
                  {tipo === "fornecedor" && "nif" in entidadeDetalhe && (
                    <>
                      <div><span className="text-gray-500">NIF:</span> <span className="font-medium">{entidadeDetalhe.nif}</span></div>
                      {entidadeDetalhe.telefone && <div><span className="text-gray-500">Telefone:</span> {entidadeDetalhe.telefone}</div>}
                      {entidadeDetalhe.email && <div><span className="text-gray-500">Email:</span> {entidadeDetalhe.email}</div>}
                      {entidadeDetalhe.endereco && <div className="sm:col-span-2"><span className="text-gray-500">Morada:</span> {entidadeDetalhe.endereco}</div>}
                    </>
                  )}
                  {tipo === "conceito" && "descricao" in entidadeDetalhe && entidadeDetalhe.descricao && (
                    <div className="sm:col-span-2"><span className="text-gray-500">Descrição:</span> {entidadeDetalhe.descricao}</div>
                  )}
                </div>
              )}
              {isTodos && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totaisGerais.n_grupos} {tipo === "fornecedor" ? "fornecedor(es)" : "conceito(s)"} · {totaisGerais.count} movimento(s) · ordem alfabética
                </p>
              )}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Período: {dataInicio ? new Date(dataInicio).toLocaleDateString("pt-PT") : "Início"} → {dataFim ? new Date(dataFim).toLocaleDateString("pt-PT") : "Hoje"}
                </span>
              </div>
            </div>

            {/* Grupos */}
            {grupos.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400">Sem movimentos.</div>
            ) : (
              grupos.map((g, gidx) => (
                <div key={`${g.entidade.id}-${gidx}`} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  {isTodos && (
                    <div className="px-6 py-2.5 bg-blue-50/70 dark:bg-blue-900/20 flex items-center justify-between border-y border-blue-100 dark:border-blue-800">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                        ▸ {g.label} <span className="text-xs font-normal text-blue-700 dark:text-blue-400 ml-1">({g.totais.count} mov.)</span>
                      </h4>
                      <span className={`text-sm font-semibold ${g.totais.saldo >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {formatCurrency(g.totais.saldo)}
                      </span>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100/80 dark:bg-gray-800">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">#</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Código</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Data</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">{tipoColunaAux}</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Tipo</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Fundo</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Valor</th>
                          {!isTodos && <th className="no-print"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {g.movimentos.map((m, idx) => (
                          <tr key={m.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono text-xs text-gray-500">{m.codigo || "—"}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(m.data)}</td>
                            <td className="px-3 py-2">{tipo === "fornecedor" ? m.conceito_nome || "—" : m.fornecedor_nome || "—"}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${m.tipo_movimento === "entrada" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                {m.tipo_movimento === "entrada" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {m.tipo_movimento === "entrada" ? "Entrada" : "Saída"}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.fundo_tipo === "BFA" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{m.fundo_tipo}</span>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">{formatCurrency(m.valor)}</td>
                            {!isTodos && (
                              <td className="px-3 py-2 no-print">
                                <button onClick={() => setExcludedIds((p) => new Set(p).add(m.id))} className="text-red-500 hover:text-red-700 p-1" title="Remover">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      {isTodos && (
                        <tfoot className="bg-gray-50 dark:bg-gray-800/50 font-semibold">
                          <tr><td colSpan={6} className="px-3 py-1.5 text-right text-xs text-gray-700 dark:text-gray-300">Subtotal {g.label}:</td><td className={`px-3 py-1.5 text-right text-xs ${g.totais.saldo >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(g.totais.saldo)}</td></tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              ))
            )}

            {/* Total Geral */}
            {grupos.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-wide">Entradas</p>
                    <p className="text-base font-bold text-emerald-300">{formatCurrency(totaisGerais.entradas)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-wide">Saídas</p>
                    <p className="text-base font-bold text-red-300">{formatCurrency(totaisGerais.saidas)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-wide">Saldo Geral</p>
                    <p className={`text-base font-bold ${totaisGerais.saldo >= 0 ? "text-emerald-300" : "text-red-300"}`}>{formatCurrency(totaisGerais.saldo)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-wide">Movimentos</p>
                    <p className="text-base font-bold">{totaisGerais.count}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de movimentos excluídos */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Movimentos excluídos</h3>
              <button onClick={() => setShowAddModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-4 space-y-2">
              {todosMovimentos.filter((m) => excludedIds.has(m.id)).map((m: ExtratoMovimento) => (
                <div key={m.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-mono text-xs text-gray-500">{m.codigo}</p>
                    <p className="text-sm">{formatDate(m.data)} · {tipo === "fornecedor" ? m.conceito_nome : m.fornecedor_nome} · <span className="font-semibold">{formatCurrency(m.valor)}</span></p>
                  </div>
                  <button onClick={() => setExcludedIds((p) => { const n = new Set(p); n.delete(m.id); return n; })} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded">
                    <Plus className="h-3 w-3" /> Incluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
