"use client";
import { Building2 } from "lucide-react";
import { ExtratoReport } from "@/shared/ui/extrato-report";

export default function RelatorioFornecedorPage() {
  return (
    <div className="space-y-6">
      <div className="no-print flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Building2 className="h-5 w-5 text-ink" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Extrato por Fornecedor</h1>
          <p className="text-ink-mid/70 text-sm">Gere relatório com movimentos por fornecedor — imprimir, exportar Excel/PDF</p>
        </div>
      </div>
      <ExtratoReport tipo="fornecedor" />
    </div>
  );
}
