"use client";
import { useEffect } from "react";
import { X, Download, FileText, FileImage, File as FileIcon, ExternalLink } from "lucide-react";

interface Props {
  url: string | null;
  name?: string;
  mimeType?: string | null;
  onClose: () => void;
}

export function FilePreview({ url, name, mimeType, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (url) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [url, onClose]);

  if (!url) return null;

  const ext = (name || url).split(".").pop()?.toLowerCase() || "";
  const isPdf = mimeType === "application/pdf" || ext === "pdf";
  const isImg = (mimeType?.startsWith("image/") ?? false) || ["png","jpg","jpeg","webp","svg","gif"].includes(ext);
  const Icon = isPdf ? FileText : isImg ? FileImage : FileIcon;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{name || "Documento"}</span>
          </div>
          <div className="flex items-center gap-1">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Abrir noutra aba">
              <ExternalLink className="h-4 w-4" />
            </a>
            <a href={url} download={name}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Descarregar">
              <Download className="h-4 w-4" />
            </a>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
          {isPdf ? (
            <iframe src={url} className="w-full h-full" title={name || "PDF"} />
          ) : isImg ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img src={url} alt={name || ""} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-500">
              <FileIcon className="h-16 w-16" />
              <p className="text-sm">Pré-visualização não disponível para este tipo de ficheiro.</p>
              <a href={url} download={name}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                <Download className="h-4 w-4" /> Descarregar
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
