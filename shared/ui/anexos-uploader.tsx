"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Paperclip, Upload, Trash2, Loader2, FileText } from "lucide-react";
import { anexosService, TIPOS_DOCUMENTO_ABASTECIMENTO } from "@/shared/services/anexos.service";

export function AnexosUploader({ entityType, entityId }: { entityType: string; entityId: string }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tipoDocumento, setTipoDocumento] = useState<string>(TIPOS_DOCUMENTO_ABASTECIMENTO[0].value);

  const { data: anexos = [], isLoading } = useQuery({
    queryKey: ["anexos", entityType, entityId],
    queryFn: () => anexosService.list(entityType, entityId),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => anexosService.upload(entityType, entityId, file, tipoDocumento),
    onSuccess: () => {
      toast.success("Anexo carregado");
      qc.invalidateQueries({ queryKey: ["anexos", entityType, entityId] });
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao carregar anexo"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => anexosService.delete(id),
    onSuccess: () => { toast.success("Anexo removido"); qc.invalidateQueries({ queryKey: ["anexos", entityType, entityId] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-ink-mid/70" />
        <span className="text-sm font-semibold text-ink dark:text-white">Documentos e Anexos</span>
      </div>

      <div className="flex items-center gap-2">
        <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-sm dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
          {TIPOS_DOCUMENTO_ABASTECIMENTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMut.mutate(f); }}
          className="hidden"
          id={`anexo-file-${entityType}-${entityId}`}
        />
        <label htmlFor={`anexo-file-${entityType}-${entityId}`}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-lg hover:bg-surface dark:hover:bg-ink-ghost/20 cursor-pointer">
          {uploadMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Carregar ficheiro
        </label>
      </div>

      {isLoading ? (
        <p className="text-xs text-ink-mid/50">A carregar…</p>
      ) : anexos.length === 0 ? (
        <p className="text-xs text-ink-mid/50">Nenhum documento anexado.</p>
      ) : (
        <ul className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15 border rounded-lg dark:border-ink-ghost/20">
          {anexos.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-ink-mid/50 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate">{a.file_name}</p>
                  <p className="text-[11px] text-ink-mid/50">
                    {TIPOS_DOCUMENTO_ABASTECIMENTO.find((t) => t.value === a.tipo_documento)?.label || a.tipo_documento}
                    {" · v"}{a.versao} · {new Date(a.uploaded_at).toLocaleDateString("pt-AO")}
                  </p>
                </div>
              </div>
              <button onClick={() => deleteMut.mutate(a.id)} disabled={deleteMut.isPending}
                className="text-danger hover:bg-danger/10 rounded-lg p-1.5 shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
