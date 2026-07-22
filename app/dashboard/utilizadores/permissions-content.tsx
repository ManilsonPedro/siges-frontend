"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { permissoesService, type Permissao } from "@/shared/services/financeiro.service";
import { Search, FileText, ChevronDown, ChevronRight } from "lucide-react";

export function PermissionsContent() {
  const { data: permissoes = [], isLoading } = useQuery({ queryKey: ["permissoes"], queryFn: permissoesService.listarPermissoes });
  const [filtro, setFiltro] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!filtro) return permissoes;
    const q = filtro.toLowerCase();
    return permissoes.filter(p =>
      p.codigo.toLowerCase().includes(q) ||
      p.menu.toLowerCase().includes(q) ||
      (p.modulo || "").toLowerCase().includes(q) ||
      (p.descricao || "").toLowerCase().includes(q)
    );
  }, [permissoes, filtro]);

  // Hierarquia Módulo > Página
  const tree = useMemo(() => {
    const t: Record<string, Record<string, Permissao[]>> = {};
    for (const p of filtered) {
      const mod = p.modulo || "Geral";
      if (!t[mod]) t[mod] = {};
      if (!t[mod][p.menu]) t[mod][p.menu] = [];
      t[mod][p.menu].push(p);
    }
    return t;
  }, [filtered]);

  const toggle = (k: string) => {
    const n = new Set(collapsed);
    if (n.has(k)) n.delete(k); else n.add(k);
    setCollapsed(n);
  };

  if (isLoading) return <div className="p-8 text-center text-ink-mid/50">A carregar...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-ink dark:text-white">Catálogo de Permissões</h3>
            <p className="text-xs text-ink-mid/70">{permissoes.length} permissões disponíveis · agrupadas por Módulo › Página</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-mid/50" />
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 pl-9 pr-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {Object.keys(tree).sort().map((modulo) => {
          const paginas = tree[modulo];
          const modCollapsed = collapsed.has(modulo);
          const totalMod = Object.values(paginas).reduce((s, arr) => s + arr.length, 0);
          return (
            <div key={modulo} className="bg-panel dark:bg-panel border-2 border-ink-ghost/60 dark:border-ink-ghost/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(modulo)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:bg-surface dark:hover:bg-gray-800/30"
              >
                {modCollapsed ? <ChevronRight className="h-4 w-4 text-ink-mid" /> : <ChevronDown className="h-4 w-4 text-ink-mid" />}
                <span className="font-bold text-sm text-ink dark:text-white flex-1 text-left">{modulo}</span>
                <span className="text-[11px] font-semibold text-ink dark:text-blue-300 bg-panel dark:bg-panel px-2 py-0.5 rounded">
                  {totalMod} permissões
                </span>
              </button>
              {!modCollapsed && (
                <div className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
                  {Object.keys(paginas).sort().map((pagina) => {
                    const perms = paginas[pagina];
                    const pagKey = `${modulo}::${pagina}`;
                    const pagCollapsed = collapsed.has(pagKey);
                    return (
                      <div key={pagina}>
                        <button
                          onClick={() => toggle(pagKey)}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-surface dark:bg-gray-800/50 pl-8 hover:bg-surface dark:hover:bg-ink-ghost/20"
                        >
                          {pagCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-ink-mid/70" /> : <ChevronDown className="h-3.5 w-3.5 text-ink-mid/70" />}
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 flex-1 text-left">{pagina}</span>
                          <span className="text-[10px] text-ink-mid/70">{perms.length}</span>
                        </button>
                        {!pagCollapsed && (
                          <div className="px-12 py-2">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-[10px] uppercase text-ink-mid/70">
                                  <th className="pb-1 font-semibold">Ação</th>
                                  <th className="pb-1 font-semibold">Código</th>
                                  <th className="pb-1 font-semibold">Descrição</th>
                                </tr>
                              </thead>
                              <tbody>
                                {perms.map((p) => (
                                  <tr key={p.id} className="border-t border-ink-ghost/40 dark:border-ink-ghost/15">
                                    <td className="py-1.5">
                                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{p.acao}</span>
                                    </td>
                                    <td className="py-1.5 font-mono text-[11px] text-ink-mid dark:text-gray-400">{p.codigo}</td>
                                    <td className="py-1.5 text-xs text-gray-700 dark:text-gray-300">{p.descricao || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {Object.keys(tree).length === 0 && (
          <div className="text-center py-8 text-ink-mid/50 text-sm">Sem resultados.</div>
        )}
      </div>
    </div>
  );
}
