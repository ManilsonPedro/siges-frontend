"use client";
import Link from "next/link";
import { Building2, Tag, ArrowLeftRight, ArrowRight, BarChart3, Users } from "lucide-react";

const EXTRATOS = [
  {
    href: "/dashboard/relatorios/fornecedor",
    titulo: "Extrato por Fornecedor",
    descricao: "Movimentos detalhados por fornecedor · imprimir · exportar Excel/PDF",
    icon: Building2,
    cor: "blue",
  },
  {
    href: "/dashboard/relatorios/conceito",
    titulo: "Extrato por Conceito",
    descricao: "Análise por categoria · imprimir · exportar Excel/PDF",
    icon: Tag,
    cor: "purple",
  },
  {
    href: "/dashboard/relatorios/movimentos",
    titulo: "Extrato Movimentos",
    descricao: "Lista completa de movimentos · filtros · imprimir · exportar",
    icon: ArrowLeftRight,
    cor: "emerald",
  },
  {
    href: "/dashboard/relatorios/utilizador",
    titulo: "Relatório por Utilizador",
    descricao: "Produtividade por utilizador · todos · movimentos criados, entradas, saídas e fechados",
    icon: Users,
    cor: "indigo",
  },
];

const COR_MAP: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:border-blue-400 group-hover:text-blue-600",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:border-purple-400 group-hover:text-purple-600",
  emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:border-emerald-400 group-hover:text-emerald-600",
  indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 hover:border-indigo-400 group-hover:text-indigo-600",
};

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Relatórios</h1>
          <p className="text-ink-mid/70 text-sm">Extratos detalhados com pesquisa, filtros e exportação</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
        💡 Os indicadores e gráficos gerais agora vivem no <Link href="/dashboard" className="font-semibold underline">Dashboard</Link>.
        Aqui pode aceder aos extratos detalhados para imprimir, exportar para PDF/Excel ou enviar por email.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXTRATOS.map((e) => {
          const Icon = e.icon;
          const corClasses = COR_MAP[e.cor];
          const iconBg = corClasses.split(" ").slice(0, 2).join(" ") + " " + corClasses.split(" ")[2];
          return (
            <Link
              key={e.href}
              href={e.href}
              className="group bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-4 w-4 text-ink-mid/50 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-ink dark:text-white mb-1">{e.titulo}</h3>
              <p className="text-xs text-ink-mid/70 leading-relaxed">{e.descricao}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
