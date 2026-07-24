"use client";

import Link from "next/link";
import { BarChart3, ArrowRight, Info } from "lucide-react";

export default function AnalisesContabilisticasPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-ink dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Análises Contabilísticas</h1>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Análise mês-a-mês por centro de custo ainda por construir</p>
          <p className="mt-1 text-blue-700/90 dark:text-blue-300/90">
            Comparar mês actual vs. anterior vs. orçamento, por centro de custo e conta, exige ligar os
            movimentos financeiros ao centro de custo — funcionalidade ainda por implementar. Entretanto,
            os indicadores financeiros reais já disponíveis estão em Fluxo de Caixa e no Dashboard Executivo.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/financeiro/fluxo-caixa"
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ink/90"
        >
          Ver Fluxo de Caixa
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard/relatorios/executivo"
          className="inline-flex items-center gap-2 rounded-lg border border-ink-ghost/60 bg-panel px-4 py-2.5 text-sm font-medium text-ink-mid hover:bg-surface dark:border-ink-ghost/20 dark:text-gray-200"
        >
          Ver Dashboard Executivo
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard/contabilidade/saft-ao"
          className="inline-flex items-center gap-2 rounded-lg border border-ink-ghost/60 bg-panel px-4 py-2.5 text-sm font-medium text-ink-mid hover:bg-surface dark:border-ink-ghost/20 dark:text-gray-200"
        >
          Exportação SAF-T-AO
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
