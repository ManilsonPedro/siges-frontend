"use client";

import Link from "next/link";
import { Building2, ArrowRight, Info } from "lucide-react";

export default function CentrosCustoAnaliticaPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-ink dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Centros de Custo Analíticos</h1>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Ainda sem breakdown por conta contabilística e período</p>
          <p className="mt-1 text-blue-700/90 dark:text-blue-300/90">
            Ver custos por conta (matérias-primas, mão-de-obra, etc.) dentro de um centro de custo exige
            ligar os movimentos financeiros ao centro de custo correspondente — funcionalidade ainda por
            construir. Por agora, a gestão dos centros de custo (criar, editar, eliminar) está disponível
            em Financeiro.
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/financeiro/centros-custo"
        className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ink/90"
      >
        Ir para Centros de Custo (Financeiro)
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
