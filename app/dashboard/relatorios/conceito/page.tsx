"use client";
import { Tag } from "lucide-react";
import { ExtratoReport } from "@/shared/ui/extrato-report";

export default function RelatorioConceitoPage() {
  return (
    <div className="space-y-6">
      <div className="no-print flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Tag className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Extrato por Conceito</h1>
          <p className="text-ink-mid/70 text-sm">Gere relatório com movimentos por conceito — imprimir, exportar Excel/PDF</p>
        </div>
      </div>
      <ExtratoReport tipo="conceito" />
    </div>
  );
}
