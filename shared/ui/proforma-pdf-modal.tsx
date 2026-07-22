"use client";
import { useEffect, useState } from "react";
import { X, Download, Printer, Loader2 } from "lucide-react";
import { caixaService } from "@/shared/services/financeiro.service";

interface Props {
  vendaId: string | null;
  numeroProforma?: string;
  onClose: () => void;
}

export function ProformaPdfModal({ vendaId, numeroProforma, onClose }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendaId) return;
    setLoading(true);
    setError(null);
    setBlobUrl(null);

    caixaService.fetchProformaBlob(vendaId)
      .then((url) => setBlobUrl(url))
      .catch(() => setError("Não foi possível carregar o documento."))
      .finally(() => setLoading(false));

    return () => {
      setBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, [vendaId]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `proforma-${numeroProforma || vendaId}.pdf`;
    a.click();
  };

  const handlePrint = () => {
    if (!blobUrl) return;
    const win = window.open(blobUrl, "_blank");
    win?.addEventListener("load", () => win.print());
  };

  if (!vendaId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[92vw] max-w-5xl h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Documento</p>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {numeroProforma ? `Proforma ${numeroProforma}` : "Proforma"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!blobUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Printer className="h-4 w-4" /> Imprimir
            </button>
            <button
              onClick={handleDownload}
              disabled={!blobUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4" /> Download
            </button>
            <button
              onClick={onClose}
              className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden rounded-b-2xl bg-gray-100 dark:bg-gray-800">
          {loading && (
            <div className="flex h-full items-center justify-center gap-3 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">A carregar documento...</span>
            </div>
          )}
          {error && (
            <div className="flex h-full items-center justify-center text-red-500 text-sm">
              {error}
            </div>
          )}
          {blobUrl && (
            <iframe
              src={blobUrl}
              className="w-full h-full rounded-b-2xl"
              title="Proforma PDF"
            />
          )}
        </div>
      </div>
    </div>
  );
}
