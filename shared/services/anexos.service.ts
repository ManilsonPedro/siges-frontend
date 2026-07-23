import api from "./api";

export interface Anexo {
  id: string;
  entity_type: string;
  entity_id: string;
  tipo_documento: string;
  versao: number;
  file_path: string;
  file_name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  uploaded_by: string;
  uploaded_at: string;
}

export const TIPOS_DOCUMENTO_ABASTECIMENTO = [
  { value: "proforma", label: "Proforma" },
  { value: "fatura", label: "Fatura" },
  { value: "fatura_recibo", label: "Fatura-Recibo" },
  { value: "recibo", label: "Recibo" },
  { value: "guia_transporte", label: "Guia de Transporte" },
  { value: "comprovativo_pagamento", label: "Comprovativo de Pagamento" },
  { value: "comprovativo_bancario", label: "Comprovativo Bancário" },
  { value: "fotografia", label: "Fotografia" },
  { value: "outro", label: "Outro" },
] as const;

export const anexosService = {
  async list(entityType: string, entityId: string): Promise<Anexo[]> {
    const { data } = await api.get<Anexo[]>(`/anexos/${entityType}/${entityId}`);
    return data;
  },
  async upload(entityType: string, entityId: string, file: File, tipoDocumento: string): Promise<Anexo> {
    const form = new FormData();
    form.append("file", file);
    form.append("tipo_documento", tipoDocumento);
    const { data } = await api.post<Anexo>(`/anexos/${entityType}/${entityId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/anexos/${id}`);
  },
};
