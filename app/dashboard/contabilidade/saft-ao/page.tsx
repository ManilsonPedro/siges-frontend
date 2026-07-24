"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Download, FileCode2, Loader2 } from "lucide-react";
import { contabilidadeService } from "@/shared/services/financeiro2.service";

function primeiroDiaDoAno(): string {
  const d = new Date();
  return `${d.getFullYear()}-01-01`;
}
function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SaftAoPage() {
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoAno());
  const [dataFim, setDataFim] = useState(hoje());

  const exportarMut = useMutation({
    mutationFn: () => contabilidadeService.downloadSaftAo({ data_inicio: dataInicio, data_fim: dataFim }),
    onSuccess: () => toast.success("Ficheiro SAF-T-AO gerado"),
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao gerar o ficheiro"),
  });

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <FileCode2 className="h-6 w-6 text-ink dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Exportação SAF-T-AO</h1>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm space-y-1.5">
          <p className="font-semibold">Este exportador não é certificado fiscalmente.</p>
          <p className="text-amber-800/90 dark:text-amber-300/90">
            A estrutura do ficheiro foi construída a partir da documentação pública do modelo SAF-T-AO
            (versão 1.01_01, Decreto Presidencial nº 312/18), mas <strong>não foi validada contra o XSD
            oficial da AGT</strong>. Antes de submeter este ficheiro à Administração Geral Tributária:
          </p>
          <ul className="list-disc list-inside text-amber-800/90 dark:text-amber-300/90 space-y-0.5">
            <li>Valide o ficheiro contra o XSD oficial <code>SAF-T-AO1.01_01.xsd</code> assim que disponível.</li>
            <li>Peça a revisão de um contabilista ou fiscalista certificado em Angola.</li>
            <li>Confirme se a obrigatoriedade de facturação electrónica já se aplica à empresa (limiar legal:
              facturação ≥ 25M AOA / ~USD 250.000; obrigatório a partir de 2026 para grandes contribuintes,
              2027 para os restantes).</li>
          </ul>
          <p className="text-amber-800/90 dark:text-amber-300/90 pt-1">
            O ficheiro cobre Header, Plano de Contas, Clientes, Fornecedores, Produtos e Facturas de Venda
            (vendas concluídas). Não inclui lançamentos de razão geral com dupla entrada — o SIGES não tem
            esse modelo internamente (ver <code>Contabilidade &gt; Razão/Diário</code>, que agrega
            movimentos financeiros directamente).
          </p>
        </div>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">De</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Até</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          </div>
        </div>
        <button
          onClick={() => exportarMut.mutate()}
          disabled={exportarMut.isPending || dataFim < dataInicio}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90 disabled:opacity-50"
        >
          {exportarMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Gerar ficheiro SAF-T-AO (XML)
        </button>
        {dataFim < dataInicio && <p className="text-xs text-danger">A data final não pode ser anterior à data inicial.</p>}
      </div>
    </div>
  );
}
