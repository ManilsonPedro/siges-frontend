import api from "./api";
import type {
  TransferenciaFundo, CentroCusto, AprovacaoFinanceira, ContaReceber, ContaPagar,
  PlanoContas, TaxaImposto, ObrigacaoFiscal,
} from "@/shared/types";

export const tesourariaService = {
  async listTransferencias(): Promise<TransferenciaFundo[]> {
    const { data } = await api.get<TransferenciaFundo[]>("/financeiro/transferencias");
    return data;
  },
  async createTransferencia(dto: { fundo_origem_tipo: string; fundo_destino_tipo: string; valor: number; motivo?: string }): Promise<TransferenciaFundo> {
    const { data } = await api.post<TransferenciaFundo>("/financeiro/transferencias", dto);
    return data;
  },
  async fluxoCaixa(params?: { de?: string; ate?: string; agrupar_por?: string }): Promise<{ periodo: string; entradas: number; saidas: number; liquido: number }[]> {
    const { data } = await api.get("/financeiro/fluxo-caixa", { params });
    return data;
  },
};

export const centrosCustoService = {
  async list(): Promise<CentroCusto[]> {
    const { data } = await api.get<CentroCusto[]>("/financeiro/centros-custo");
    return data;
  },
  async create(dto: { codigo: string; nome: string }): Promise<CentroCusto> {
    const { data } = await api.post<CentroCusto>("/financeiro/centros-custo", dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/financeiro/centros-custo/${id}`);
  },
};

export const aprovacoesService = {
  async list(estado?: string): Promise<AprovacaoFinanceira[]> {
    const { data } = await api.get<AprovacaoFinanceira[]>("/financeiro/aprovacoes", { params: { estado } });
    return data;
  },
  async aprovar(id: string): Promise<AprovacaoFinanceira> {
    const { data } = await api.post<AprovacaoFinanceira>(`/financeiro/aprovacoes/${id}/aprovar`);
    return data;
  },
  async rejeitar(id: string, motivo: string): Promise<AprovacaoFinanceira> {
    const { data } = await api.post<AprovacaoFinanceira>(`/financeiro/aprovacoes/${id}/rejeitar`, { motivo });
    return data;
  },
};

export const contasReceberService = {
  async list(estado?: string): Promise<ContaReceber[]> {
    const { data } = await api.get<ContaReceber[]>("/financeiro/contas-receber", { params: { estado } });
    return data;
  },
  async create(dto: { cliente_id: string; valor: number; data_vencimento: string }): Promise<ContaReceber> {
    const { data } = await api.post<ContaReceber>("/financeiro/contas-receber", dto);
    return data;
  },
  async registarRecebimento(id: string, valor: number): Promise<ContaReceber> {
    const { data } = await api.post<ContaReceber>(`/financeiro/contas-receber/${id}/registar-recebimento`, { valor });
    return data;
  },
  async atrasadas(diasMin = 0): Promise<ContaReceber[]> {
    const { data } = await api.get<ContaReceber[]>("/financeiro/contas-receber/atrasadas", { params: { dias_min: diasMin } });
    return data;
  },
};

export const contasPagarService = {
  async list(estado?: string): Promise<ContaPagar[]> {
    const { data } = await api.get<ContaPagar[]>("/financeiro/contas-pagar", { params: { estado } });
    return data;
  },
  async create(dto: { fornecedor_id: string; valor: number; data_vencimento: string }): Promise<ContaPagar> {
    const { data } = await api.post<ContaPagar>("/financeiro/contas-pagar", dto);
    return data;
  },
  async registarPagamento(id: string, valor: number): Promise<ContaPagar> {
    const { data } = await api.post<ContaPagar>(`/financeiro/contas-pagar/${id}/registar-pagamento`, { valor });
    return data;
  },
  async aVencer(dias = 7): Promise<ContaPagar[]> {
    const { data } = await api.get<ContaPagar[]>("/financeiro/contas-pagar/a-vencer", { params: { dias } });
    return data;
  },
};

export const contabilidadeService = {
  async listPlanoContas(): Promise<PlanoContas[]> {
    const { data } = await api.get<PlanoContas[]>("/contabilidade/plano-contas");
    return data;
  },
  async createPlanoContas(dto: { codigo: string; nome: string; classe: number; tipo: string }): Promise<PlanoContas> {
    const { data } = await api.post<PlanoContas>("/contabilidade/plano-contas", dto);
    return data;
  },
  async balancetes(params?: { de?: string; ate?: string }): Promise<{ fonte: string; linhas: { conceito: string; entradas: number; saidas: number }[] }> {
    const { data } = await api.get("/contabilidade/balancetes", { params });
    return data;
  },
  async razao(conceitoId: string, params?: { de?: string; ate?: string }): Promise<{ fonte: string; lancamentos: any[] }> {
    const { data } = await api.get("/contabilidade/razao", { params: { conceito_id: conceitoId, ...params } });
    return data;
  },
  async diario(data: string): Promise<{ fonte: string; lancamentos: any[] }> {
    const { data: res } = await api.get("/contabilidade/diario", { params: { data } });
    return res;
  },
};

export const fiscalidadeService = {
  async listTaxas(): Promise<TaxaImposto[]> {
    const { data } = await api.get<TaxaImposto[]>("/fiscalidade/taxas");
    return data;
  },
  async createTaxa(dto: { nome: string; percentagem: number; tipo?: string; padrao?: boolean }): Promise<TaxaImposto> {
    const { data } = await api.post<TaxaImposto>("/fiscalidade/taxas", dto);
    return data;
  },
  async deleteTaxa(id: string): Promise<void> {
    await api.delete(`/fiscalidade/taxas/${id}`);
  },
  async listObrigacoes(): Promise<ObrigacaoFiscal[]> {
    const { data } = await api.get<ObrigacaoFiscal[]>("/fiscalidade/obrigacoes");
    return data;
  },
  async createObrigacao(dto: { nome: string; prazo: string; recorrencia?: string }): Promise<ObrigacaoFiscal> {
    const { data } = await api.post<ObrigacaoFiscal>("/fiscalidade/obrigacoes", dto);
    return data;
  },
  async cumprirObrigacao(id: string): Promise<ObrigacaoFiscal> {
    const { data } = await api.patch<ObrigacaoFiscal>(`/fiscalidade/obrigacoes/${id}`, { estado: "cumprida" });
    return data;
  },
  async relatorioIva(params?: { de?: string; ate?: string }): Promise<{ total_vendas: number; total_iva: number; n_vendas: number }> {
    const { data } = await api.get("/fiscalidade/iva", { params });
    return data;
  },
};
