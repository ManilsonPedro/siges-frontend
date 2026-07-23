import api from "./api";
import type {
  Fornecedor,
  Cliente,
  Conceito,
  Fundo,
  FundoSet,
  FundoCarregamento,
  Movimento,
  MovimentoHistorico,
  PaginatedResponse,
  DashboardData,
  FundoReport,
  AuditEntry,
  MovimentoFilters,
  CreateFornecedorDTO,
  CreateClienteDTO,
  CreateConceitoDTO,
  Produto,
  CreateProdutoDTO,
  ProdutoCategoria,
  CreateProdutoCategoriaDTO,
  CreateMovimentoDTO,
  UpdateFundoDTO,
  User,
  CreateUserDTO,
  UpdateUserDTO,
  Armazem,
  CreateArmazemDTO,
  StockSaldo,
  StockMovimento,
  EntradaDTO,
  SaidaDTO,
  TransferenciaDTO,
  Localizacao,
  CreateLocalizacaoDTO,
  Inventario,
  InventarioLinha,
  Requisicao,
  CreateRequisicaoDTO,
  ConverterPedidoDTO,
  PedidoCompra,
  Recepcao,
  CreateRecepcaoDTO,
  ContratoFornecedor,
  CreateContratoDTO,
  AvaliacaoFornecedor,
  CreateAvaliacaoDTO,
  Promocao,
  CreatePromocaoDTO,
  CreateDevolucaoDTO,
  Devolucao,
  LojaOnlineConfig,
  Cupao,
  CreateCupaoDTO,
  PedidoOnline,
  CheckoutDTO,
  CaixaSessao,
  Venda,
  VendaCreateDTO,
  LinhaCreateDTO,
  PagamentoCreateDTO,
} from "@/shared/types";

export const fornecedorService = {
  async list(): Promise<Fornecedor[]> {
    const { data } = await api.get<Fornecedor[]>("/fornecedores");
    return data;
  },
  async get(id: string): Promise<Fornecedor> {
    const { data } = await api.get<Fornecedor>(`/fornecedores/${id}`);
    return data;
  },
  async create(dto: CreateFornecedorDTO): Promise<Fornecedor> {
    const { data } = await api.post<Fornecedor>("/fornecedores", dto);
    return data;
  },
  async update(id: string, dto: Partial<CreateFornecedorDTO>): Promise<Fornecedor> {
    const { data } = await api.put<Fornecedor>(`/fornecedores/${id}`, dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/fornecedores/${id}`);
  },
  async tornarCliente(id: string): Promise<{ cliente_id: string; fornecedor_id: string }> {
    const { data } = await api.post(`/fornecedores/${id}/tornar-cliente`);
    return data;
  },
};

export const clienteService = {
  async list(): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>("/clientes");
    return data;
  },
  async get(id: string): Promise<Cliente> {
    const { data } = await api.get<Cliente>(`/clientes/${id}`);
    return data;
  },
  async create(dto: CreateClienteDTO): Promise<Cliente> {
    const { data } = await api.post<Cliente>("/clientes", dto);
    return data;
  },
  async update(id: string, dto: Partial<CreateClienteDTO>): Promise<Cliente> {
    const { data } = await api.put<Cliente>(`/clientes/${id}`, dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },
  async tornarFornecedor(id: string): Promise<{ fornecedor_id: string; cliente_id: string }> {
    const { data } = await api.post(`/clientes/${id}/tornar-fornecedor`);
    return data;
  },
};

export const conceitoService = {
  async list(): Promise<Conceito[]> {
    const { data } = await api.get<Conceito[]>("/conceitos");
    return data;
  },
  async get(id: string): Promise<Conceito> {
    const { data } = await api.get<Conceito>(`/conceitos/${id}`);
    return data;
  },
  async create(dto: CreateConceitoDTO): Promise<Conceito> {
    const { data } = await api.post<Conceito>("/conceitos", dto);
    return data;
  },
  async update(id: string, dto: Partial<CreateConceitoDTO>): Promise<Conceito> {
    const { data } = await api.put<Conceito>(`/conceitos/${id}`, dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/conceitos/${id}`);
  },
};

export const fundoService = {
  async get(): Promise<FundoSet> {
    const { data } = await api.get<FundoSet>("/fundos");
    return data;
  },
  async update(dto: UpdateFundoDTO): Promise<Fundo> {
    const { data } = await api.put<Fundo>("/fundos", dto);
    return data;
  },
  async historico(limit = 20): Promise<FundoCarregamento[]> {
    const { data } = await api.get<FundoCarregamento[]>("/fundos/historico", { params: { limit } });
    return data;
  },
  async exportExcel(data_inicio?: string, data_fim?: string): Promise<Blob> {
    const { data } = await api.get("/fundos/export", {
      params: { data_inicio, data_fim },
      responseType: "blob",
    });
    return data;
  },
};

export const movimentoService = {
  async list(filters?: MovimentoFilters): Promise<PaginatedResponse<Movimento>> {
    const { data } = await api.get<PaginatedResponse<Movimento>>("/movimentos", { params: filters });
    return data;
  },
  async get(id: string): Promise<Movimento> {
    const { data } = await api.get<Movimento>(`/movimentos/${id}`);
    return data;
  },
  async create(dto: CreateMovimentoDTO, allowDuplicate = false): Promise<Movimento> {
    const { data } = await api.post<Movimento>("/movimentos", dto, {
      params: allowDuplicate ? { allow_duplicate: true } : undefined,
    });
    return data;
  },
  async checkFatura(fatura_proforma?: string, fatura_recibo?: string): Promise<{ duplicado: boolean; movimentos: Array<{ id: string; codigo: string | null; data: string; valor: number; tipo_movimento: string; estado_pagamento: string; fatura_proforma: string | null; fatura_recibo: string | null; match: string }> }> {
    const { data } = await api.get("/movimentos/check-fatura", { params: { fatura_proforma, fatura_recibo } });
    return data;
  },
  async update(id: string, dto: Partial<CreateMovimentoDTO>): Promise<Movimento> {
    const { data } = await api.put<Movimento>(`/movimentos/${id}`, dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/movimentos/${id}`);
  },
  async uploadComprovativo(id: string, file: File): Promise<{ filename: string; url: string }> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post(`/movimentos/${id}/comprovativo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async deleteComprovativo(id: string): Promise<void> {
    await api.delete(`/movimentos/${id}/comprovativo`);
  },
  async exportExcel(filters?: MovimentoFilters): Promise<Blob> {
    const { data } = await api.get("/movimentos/export", {
      params: filters,
      responseType: "blob",
    });
    return data;
  },
  async historico(id: string): Promise<MovimentoHistorico[]> {
    const { data } = await api.get<MovimentoHistorico[]>(`/movimentos/${id}/historico`);
    return data;
  },
  async bulkUpdateEstado(ids: string[], estado_pagamento: string): Promise<{actualizados: number; erros: Array<{id: string; erro: string}>}> {
    const { data } = await api.post("/movimentos/bulk-update", { ids, estado_pagamento });
    return data;
  },
  async bulkDelete(ids: string[]): Promise<{eliminados: number; erros: Array<{id: string; erro: string}>}> {
    const { data } = await api.post("/movimentos/bulk-delete", { ids });
    return data;
  },
};

export const userService = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>("/auth/users");
    return data;
  },
  async create(dto: CreateUserDTO): Promise<User> {
    const { data } = await api.post<User>("/auth/users", dto);
    return data;
  },
  async update(id: string, dto: UpdateUserDTO): Promise<User> {
    const { data } = await api.put<User>(`/auth/users/${id}`, dto);
    return data;
  },
  async resetPassword(id: string, newPassword: string): Promise<void> {
    await api.post(`/auth/users/${id}/reset-password`, { new_password: newPassword });
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/auth/users/${id}`);
  },
};

export interface CompanySettings {
  company_id: string;
  nome: string;
  nif?: string | null;
  morada?: string | null;
  telefone?: string | null;
  email?: string | null;
  iban_bcs?: string | null;
  iban_bfa?: string | null;
  logo_path?: string | null;
  logo_url?: string | null;
  updated_at?: string | null;
}

export interface UpdateCompanySettingsDTO {
  nome?: string;
  nif?: string;
  morada?: string;
  telefone?: string;
  email?: string;
  iban_bcs?: string;
  iban_bfa?: string;
}

export const companyService = {
  async get(): Promise<CompanySettings> {
    const { data } = await api.get<CompanySettings>("/settings/company");
    return data;
  },
  async update(dto: UpdateCompanySettingsDTO): Promise<CompanySettings> {
    const { data } = await api.put<CompanySettings>("/settings/company", dto);
    return data;
  },
  async uploadLogo(file: File): Promise<CompanySettings> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<CompanySettings>("/settings/company/logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async deleteLogo(): Promise<CompanySettings> {
    const { data } = await api.delete<CompanySettings>("/settings/company/logo");
    return data;
  },
};

export interface SavedFilter {
  id: string;
  name: string;
  route: string;
  params: Record<string, unknown>;
  created_at: string;
}

export const savedFilterService = {
  async list(route?: string): Promise<SavedFilter[]> {
    const { data } = await api.get<SavedFilter[]>("/saved-filters", { params: { route } });
    return data;
  },
  async create(name: string, route: string, params: Record<string, unknown>): Promise<SavedFilter> {
    const { data } = await api.post<SavedFilter>("/saved-filters", { name, route, params });
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/saved-filters/${id}`);
  },
};

export interface TrashItem {
  id: string;
  deleted_at: string;
  created_at: string;
  [key: string]: unknown;
}

export const trashService = {
  async list(tipo: "fornecedores" | "conceitos" | "movimentos"): Promise<TrashItem[]> {
    const { data } = await api.get<TrashItem[]>("/trash", { params: { tipo } });
    return data;
  },
  async restore(tipo: string, id: string): Promise<void> {
    await api.post(`/trash/${tipo}/${id}/restore`);
  },
  async deletePermanently(tipo: string, id: string): Promise<void> {
    await api.delete(`/trash/${tipo}/${id}`);
  },
};

export interface PeriodoFechado {
  id: string;
  ano: number;
  mes: number;
  fechado_em: string;
  fechado_por: string;
  motivo: string | null;
}

export const periodoService = {
  async list(): Promise<PeriodoFechado[]> {
    const { data } = await api.get<PeriodoFechado[]>("/periodos");
    return data;
  },
  async fechar(ano: number, mes: number, motivo?: string): Promise<{ id: string }> {
    const { data } = await api.post<{ id: string }>("/periodos/fechar", { ano, mes, motivo });
    return data;
  },
  async reabrir(ano: number, mes: number): Promise<void> {
    await api.post(`/periodos/reabrir/${ano}/${mes}`);
  },
};

export interface Pagamento {
  id: string;
  movimento_id: string;
  valor: number;
  data: string;
  fundo_tipo: "BCS" | "BFA";
  observacao: string | null;
  created_by_name: string | null;
  created_at: string;
}

export interface PagamentosResponse {
  movimento_id: string;
  valor_movimento: number;
  total_pago: number;
  saldo_em_divida: number;
  pagamentos: Pagamento[];
}

export interface MovimentoFullDetail {
  id: string;
  codigo: string | null;
  data: string;
  valor: number;
  tipo_movimento: "entrada" | "saida";
  fundo_tipo: "BCS" | "BFA";
  estado_pagamento: string;
  estado_movimento: string;
  fatura_proforma: string | null;
  fatura_recibo: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  tempo_tratamento: string | null;
  created_by: { id: string; nome: string; email: string } | null;
  closed_by: { id: string; nome: string; email: string } | null;
  fornecedor: { id: string; nome: string; nif: string; telefone: string | null; email: string | null; endereco: string | null; estado: string } | null;
  cliente: { id: string; nome: string; nif: string; telefone: string | null; email: string | null; endereco: string | null; estado: string } | null;
  conceito: { id: string; nome: string; descricao: string | null; estado: string } | null;
  comentarios: Array<{ id: string; texto: string; user_id: string; user_name: string; is_owner: boolean; is_editable: boolean; edited_at: string | null; created_at: string }>;
  anexos: Array<{ id: string; file_name: string; file_url: string; mime_type: string | null; size_bytes: number | null; uploaded_by_name: string | null; uploaded_at: string; deleted_at?: string | null; deleted_by_name?: string | null; delete_reason?: string | null; tipo_fatura?: "proforma" | "recibo" | null; _legacy?: boolean }>;
  historico: Array<{ id: string; campo: string; valor_anterior: string | null; valor_novo: string | null; observacao: string | null; user_name: string | null; created_at: string; tipo: "alteracao" }>;
  pagamentos: Array<{ id: string; valor: number; fundo_tipo: string; data: string; observacao: string | null; user_name: string | null; created_at: string; tipo: "pagamento" }>;
}

export const movimentoDetailService = {
  async full(id: string): Promise<MovimentoFullDetail> {
    const { data } = await api.get<MovimentoFullDetail>(`/movimentos-detail/${id}/full`);
    return data;
  },
  async addComentario(id: string, texto: string) {
    const { data } = await api.post(`/movimentos-detail/${id}/comentarios`, { texto });
    return data;
  },
  async editComentario(id: string, cid: string, texto: string) {
    const { data } = await api.put(`/movimentos-detail/${id}/comentarios/${cid}`, { texto });
    return data;
  },
  async deleteComentario(id: string, cid: string) {
    await api.delete(`/movimentos-detail/${id}/comentarios/${cid}`);
  },
  async uploadAnexo(id: string, file: File, titulo: string, tipo_fatura: "proforma" | "recibo") {
    const form = new FormData();
    form.append("file", file);
    form.append("titulo", titulo);
    form.append("tipo_fatura", tipo_fatura);
    const { data } = await api.post(`/movimentos-detail/${id}/anexos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async deleteAnexo(id: string, aid: string, motivo: string) {
    await api.delete(`/movimentos-detail/${id}/anexos/${aid}`, { data: { motivo } });
  },
  async mudarEstado(id: string, novo_estado: string, motivo?: string, comentario?: string) {
    const { data } = await api.post(`/movimentos-detail/${id}/mudar-estado`, { novo_estado, motivo, comentario });
    return data;
  },
};

export const pagamentosService = {
  async list(movimentoId: string): Promise<PagamentosResponse> {
    const { data } = await api.get<PagamentosResponse>(`/pagamentos/${movimentoId}`);
    return data;
  },
  async add(movimentoId: string, body: { valor: number; data?: string; fundo_tipo: "BCS" | "BFA"; observacao?: string }): Promise<Pagamento> {
    const { data } = await api.post<Pagamento>(`/pagamentos/${movimentoId}`, body);
    return data;
  },
  async remove(movimentoId: string, pagamentoId: string): Promise<void> {
    await api.delete(`/pagamentos/${movimentoId}/${pagamentoId}`);
  },
};

export interface EvolucaoSerie {
  mes: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface EvolucaoSaldo {
  periodo_inicio: string;
  periodo_fim: string;
  bcs: EvolucaoSerie[];
  bfa: EvolucaoSerie[];
}

export interface Orcamento {
  id: string;
  conceito_id: string;
  conceito_nome: string | null;
  ano: number;
  mes: number;
  valor_planeado: number;
  valor_gasto: number;
  percentagem: number;
  alerta: "ok" | "perto_limite" | "ultrapassado";
}

export interface EvolucaoDiariaPonto {
  dia: number;
  entradas: number;
  saidas: number;
  saldo: number | null;
}

export interface EvolucaoDiariaResponse {
  fundo: "BCS" | "BFA" | "todos";
  mes_actual: {
    label: string;
    ano: number; mes: number;
    dias_no_mes: number;
    ultimo_dia_com_dados: number;
    serie: EvolucaoDiariaPonto[];
  };
  mes_anterior: {
    label: string;
    ano: number; mes: number;
    dias_no_mes: number;
    ultimo_dia_com_dados: number;
    serie: EvolucaoDiariaPonto[];
  };
  comparativo: {
    saldo_actual: number;
    saldo_mes_anterior_mesmo_dia: number;
    delta: number;
    delta_pct: number | null;
    dia_comparacao: number;
  };
}

export const intelligenceService = {
  async evolucaoSaldo(meses = 6): Promise<EvolucaoSaldo> {
    const { data } = await api.get<EvolucaoSaldo>("/intelligence/evolucao-saldo", { params: { meses } });
    return data;
  },
  async evolucaoDiaria(fundo: "BCS" | "BFA" | "todos" = "todos"): Promise<EvolucaoDiariaResponse> {
    const { data } = await api.get<EvolucaoDiariaResponse>("/intelligence/evolucao-saldo-diaria", { params: { fundo } });
    return data;
  },
  async listOrcamentos(ano?: number, mes?: number): Promise<{ ano: number; mes: number; items: Orcamento[] }> {
    const { data } = await api.get("/intelligence/orcamentos", { params: { ano, mes } });
    return data;
  },
  async saveOrcamento(body: { conceito_id: string; ano: number; mes: number; valor_planeado: number }): Promise<Orcamento> {
    const { data } = await api.post<Orcamento>("/intelligence/orcamentos", body);
    return data;
  },
  async deleteOrcamento(id: string): Promise<void> {
    await api.delete(`/intelligence/orcamentos/${id}`);
  },
};

export interface ExtratoMovimento {
  id: string;
  codigo: string | null;
  data: string;
  valor: number;
  tipo_movimento: "entrada" | "saida";
  estado_pagamento: string;
  estado_movimento: string;
  fundo_tipo: "BCS" | "BFA";
  fatura_proforma: string | null;
  fatura_recibo: string | null;
  observacoes: string | null;
  fornecedor_id: string;
  conceito_id: string;
  conceito_nome?: string;
  fornecedor_nome?: string;
}

export interface ExtratoFornecedorResponse {
  fornecedor: { id: string; nome: string; nif: string; telefone: string | null; email: string | null; endereco: string | null; estado: string };
  periodo: { data_inicio: string | null; data_fim: string | null };
  movimentos: ExtratoMovimento[];
  totais: { entradas: number; saidas: number; saldo: number; count: number };
}

export interface ExtratoConceitoResponse {
  conceito: { id: string; nome: string; descricao: string | null; estado: string };
  periodo: { data_inicio: string | null; data_fim: string | null };
  movimentos: ExtratoMovimento[];
  totais: { entradas: number; saidas: number; saldo: number; count: number };
}

export interface ExtratoGrupo {
  label: string;
  entidade: { id: string; nome: string; nif?: string };
  movimentos: ExtratoMovimento[];
  totais: { entradas: number; saidas: number; saldo: number; count: number };
}

export interface ExtratoTodosResponse {
  periodo: { data_inicio: string | null; data_fim: string | null };
  grupos: ExtratoGrupo[];
  totais_gerais: { entradas: number; saidas: number; saldo: number; count: number; n_grupos: number };
}

export const extratoService = {
  async fornecedor(id: string, data_inicio?: string, data_fim?: string): Promise<ExtratoFornecedorResponse> {
    const { data } = await api.get<ExtratoFornecedorResponse>(`/extrato/fornecedor/${id}`, { params: { data_inicio, data_fim } });
    return data;
  },
  async conceito(id: string, data_inicio?: string, data_fim?: string): Promise<ExtratoConceitoResponse> {
    const { data } = await api.get<ExtratoConceitoResponse>(`/extrato/conceito/${id}`, { params: { data_inicio, data_fim } });
    return data;
  },
  async todosFornecedores(data_inicio?: string, data_fim?: string): Promise<ExtratoTodosResponse> {
    const { data } = await api.get<ExtratoTodosResponse>("/extrato/fornecedores/todos", { params: { data_inicio, data_fim } });
    return data;
  },
  async todosConceitos(data_inicio?: string, data_fim?: string): Promise<ExtratoTodosResponse> {
    const { data } = await api.get<ExtratoTodosResponse>("/extrato/conceitos/todos", { params: { data_inicio, data_fim } });
    return data;
  },
  async exportTodos(tipo: "fornecedores" | "conceitos", params: { formato?: "excel" | "pdf"; data_inicio?: string; data_fim?: string }): Promise<Blob> {
    const { data } = await api.get(`/extrato/${tipo}/todos/export`, {
      params: { formato: params.formato || "excel", data_inicio: params.data_inicio, data_fim: params.data_fim },
      responseType: "blob",
    });
    return data;
  },
  async movimentos(filters: {
    data_inicio?: string; data_fim?: string;
    fornecedor_id?: string; conceito_id?: string;
    tipo_movimento?: string; estado_pagamento?: string; fundo_tipo?: string;
  }): Promise<{ periodo: { data_inicio: string | null; data_fim: string | null }; movimentos: ExtratoMovimento[]; totais: { entradas: number; saidas: number; saldo: number; count: number } }> {
    const { data } = await api.get("/extrato/movimentos", { params: filters });
    return data;
  },
  async exportMovimentos(params: {
    formato?: "excel" | "pdf";
    data_inicio?: string; data_fim?: string;
    fornecedor_id?: string; conceito_id?: string;
    tipo_movimento?: string; estado_pagamento?: string; fundo_tipo?: string;
    movimentos_ids?: string[];
  }): Promise<Blob> {
    const { data } = await api.get("/extrato/movimentos/export", {
      params: {
        ...params,
        formato: params.formato || "excel",
        movimentos_ids: params.movimentos_ids?.join(",") || undefined,
      },
      responseType: "blob",
    });
    return data;
  },
  async exportFornecedor(id: string, params: { formato?: "excel" | "pdf"; data_inicio?: string; data_fim?: string; movimentos_ids?: string[] }): Promise<Blob> {
    const { data } = await api.get(`/extrato/fornecedor/${id}/export`, {
      params: {
        formato: params.formato || "excel",
        data_inicio: params.data_inicio,
        data_fim: params.data_fim,
        movimentos_ids: params.movimentos_ids?.join(",") || undefined,
      },
      responseType: "blob",
    });
    return data;
  },
  async exportConceito(id: string, params: { formato?: "excel" | "pdf"; data_inicio?: string; data_fim?: string; movimentos_ids?: string[] }): Promise<Blob> {
    const { data } = await api.get(`/extrato/conceito/${id}/export`, {
      params: {
        formato: params.formato || "excel",
        data_inicio: params.data_inicio,
        data_fim: params.data_fim,
        movimentos_ids: params.movimentos_ids?.join(",") || undefined,
      },
      responseType: "blob",
    });
    return data;
  },
};

export interface Permissao {
  id: string;
  codigo: string;
  modulo?: string | null;
  menu: string;       // página
  acao: string;
  descricao?: string | null;
}

export interface Grupo {
  id: string;
  nome: string;
  descricao?: string | null;
  is_system: boolean;
  n_permissoes: number;
  n_utilizadores: number;
  created_at?: string;
}

export interface Modulo {
  id: string;
  nome: string;
  descricao?: string | null;
  icone?: string | null;
  ordem: number;
  is_system: boolean;
  n_paginas: number;
  created_at?: string;
}

export interface Pagina {
  id: string;
  modulo_id: string | null;
  modulo_nome?: string | null;
  nome: string;
  descricao?: string | null;
  href?: string | null;
  icone?: string | null;
  ordem: number;
  is_system: boolean;
  n_permissoes: number;
  created_at?: string;
}

export const catalogoService = {
  // Módulos
  async listarModulos(): Promise<Modulo[]> {
    const { data } = await api.get<Modulo[]>("/modulos");
    return data;
  },
  async criarModulo(dto: { nome: string; descricao?: string; icone?: string; ordem?: number }) {
    const { data } = await api.post("/modulos", dto);
    return data;
  },
  async atualizarModulo(id: string, dto: Partial<{ nome: string; descricao: string; icone: string; ordem: number }>) {
    const { data } = await api.put(`/modulos/${id}`, dto);
    return data;
  },
  async eliminarModulo(id: string) {
    await api.delete(`/modulos/${id}`);
  },
  // Páginas
  async listarPaginas(): Promise<Pagina[]> {
    const { data } = await api.get<Pagina[]>("/paginas");
    return data;
  },
  async criarPagina(dto: { modulo_id: string; nome: string; descricao?: string; href?: string; icone?: string; ordem?: number }) {
    const { data } = await api.post("/paginas", dto);
    return data;
  },
  async atualizarPagina(id: string, dto: Partial<{ modulo_id: string; nome: string; descricao: string; href: string; icone: string; ordem: number }>) {
    const { data } = await api.put(`/paginas/${id}`, dto);
    return data;
  },
  async eliminarPagina(id: string) {
    await api.delete(`/paginas/${id}`);
  },
  // Permissões CRUD
  async criarPermissao(dto: { codigo: string; pagina_id: string; acao: string; descricao?: string }) {
    const { data } = await api.post("/permissoes", dto);
    return data;
  },
  async atualizarPermissao(id: string, dto: Partial<{ pagina_id: string; acao: string; descricao: string }>) {
    const { data } = await api.put(`/permissoes/${id}`, dto);
    return data;
  },
  async eliminarPermissao(id: string) {
    await api.delete(`/permissoes/${id}`);
  },
};

export const permissoesService = {
  async listarPermissoes(): Promise<Permissao[]> {
    const { data } = await api.get<Permissao[]>("/permissoes");
    return data;
  },
  async listarGrupos(): Promise<Grupo[]> {
    const { data } = await api.get<Grupo[]>("/grupos");
    return data;
  },
  async criarGrupo(nome: string, descricao?: string): Promise<Grupo> {
    const { data } = await api.post<Grupo>("/grupos", { nome, descricao });
    return data;
  },
  async atualizarGrupo(id: string, dto: { nome?: string; descricao?: string }) {
    const { data } = await api.put(`/grupos/${id}`, dto);
    return data;
  },
  async eliminarGrupo(id: string) {
    await api.delete(`/grupos/${id}`);
  },
  async getPermissoesDoGrupo(id: string): Promise<string[]> {
    const { data } = await api.get<string[]>(`/grupos/${id}/permissoes`);
    return data;
  },
  async setPermissoesDoGrupo(id: string, permissao_ids: string[]) {
    const { data } = await api.put(`/grupos/${id}/permissoes`, { permissao_ids });
    return data;
  },
  async atribuirGrupoUser(userId: string, grupoId: string | null) {
    const { data } = await api.put(`/users/${userId}/grupo`, { grupo_id: grupoId });
    return data;
  },
  async listarUtilizadoresDoGrupo(grupoId: string): Promise<Array<{ id: string; full_name: string; email: string }>> {
    const { data } = await api.get(`/grupos/${grupoId}/utilizadores`);
    return data;
  },
  async adicionarUtilizadoresAoGrupo(grupoId: string, userIds: string[]) {
    const { data } = await api.post(`/grupos/${grupoId}/utilizadores`, { user_ids: userIds });
    return data;
  },
  async getMinhasPermissoes(): Promise<{ grupo_id: string | null; permissions: string[] }> {
    const { data } = await api.get("/auth/permissions");
    return data;
  },
};

export interface OrigemFundo {
  id: string;
  nome: string;
  descricao?: string | null;
  ordem: number;
  is_system: boolean;
  estado: "ativo" | "inativo";
  created_at?: string;
}

export const origensFundoService = {
  async listar(): Promise<OrigemFundo[]> {
    const { data } = await api.get<OrigemFundo[]>("/origens-fundo");
    return data;
  },
  async criar(dto: { nome: string; descricao?: string; ordem?: number; estado?: "ativo" | "inativo" }) {
    const { data } = await api.post("/origens-fundo", dto);
    return data;
  },
  async atualizar(id: string, dto: Partial<{ nome: string; descricao: string; ordem: number; estado: "ativo" | "inativo" }>) {
    const { data } = await api.put(`/origens-fundo/${id}`, dto);
    return data;
  },
  async eliminar(id: string) {
    await api.delete(`/origens-fundo/${id}`);
  },
};

export interface UsersStats {
  total: number;
  ativos: number;
  suspensos: number;
  online: number;
  login_24h: number;
  login_7d: number;
  nunca_logaram: number;
}

export interface UserListagem {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  grupo_id: string | null;
  last_login_at: string | null;
  last_activity_at: string | null;
  online: boolean;
  created_at: string;
}

export interface ProdutividadeEntry {
  user_id: string;
  user_name: string;
  email: string;
  movimentos_criados: number;
  total_entradas: number;
  total_saidas: number;
  movimentos_fechados: number;
}

export const usersStatsService = {
  async stats(): Promise<UsersStats> {
    const { data } = await api.get<UsersStats>("/auth/users/stats");
    return data;
  },
  async listagem(): Promise<UserListagem[]> {
    const { data } = await api.get<UserListagem[]>("/auth/users/listagem");
    return data;
  },
};

export const produtividadeService = {
  async porUser(data_inicio?: string, data_fim?: string): Promise<ProdutividadeEntry[]> {
    const { data } = await api.get<ProdutividadeEntry[]>("/relatorios/produtividade-users", {
      params: { data_inicio, data_fim },
    });
    return data;
  },
};

export const relatoriosService = {
  async dashboard(data_inicio?: string, data_fim?: string): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>("/relatorios/dashboard", {
      params: { data_inicio, data_fim },
    });
    return data;
  },
  async mensal(ano: number, mes: number) {
    const { data } = await api.get("/relatorios/mensal", { params: { ano, mes } });
    return data;
  },
  async porFornecedor(data_inicio?: string, data_fim?: string) {
    const { data } = await api.get("/relatorios/fornecedor", { params: { data_inicio, data_fim } });
    return data;
  },
  async porConceito(data_inicio?: string, data_fim?: string) {
    const { data } = await api.get("/relatorios/conceito", { params: { data_inicio, data_fim } });
    return data;
  },
  async extrato(params?: MovimentoFilters) {
    const { data } = await api.get("/relatorios/extrato", { params });
    return data;
  },
  async fundos(data_inicio?: string, data_fim?: string) {
    const { data } = await api.get("/relatorios/fundos", { params: { data_inicio, data_fim } });
    return data as FundoReport;
  },
  async auditoria(params?: {
    page?: number;
    page_size?: number;
    entidade?: string;
    acao?: string;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<PaginatedResponse<AuditEntry>> {
    const { data } = await api.get<PaginatedResponse<AuditEntry>>("/relatorios/auditoria", { params });
    return data;
  },
};


export const produtoService = {
  async list(params?: { q?: string; categoria_id?: string; activo?: boolean; page?: number; page_size?: number }): Promise<Produto[]> {
    const { data } = await api.get<Produto[]>("/produtos", { params });
    return data;
  },
  async get(id: string): Promise<Produto> {
    const { data } = await api.get<Produto>(`/produtos/${id}`);
    return data;
  },
  async create(dto: CreateProdutoDTO): Promise<Produto> {
    const { data } = await api.post<Produto>("/produtos", dto);
    return data;
  },
  async update(id: string, dto: Partial<CreateProdutoDTO>): Promise<Produto> {
    const { data } = await api.patch<Produto>(`/produtos/${id}`, dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/produtos/${id}`);
  },
  async restore(id: string): Promise<Produto> {
    const { data } = await api.post<Produto>(`/produtos/${id}/restore`);
    return data;
  },
  // Categorias
  async listCategorias(): Promise<ProdutoCategoria[]> {
    const { data } = await api.get<ProdutoCategoria[]>("/produtos/categorias");
    return data;
  },
  async createCategoria(dto: CreateProdutoCategoriaDTO): Promise<ProdutoCategoria> {
    const { data } = await api.post<ProdutoCategoria>("/produtos/categorias", dto);
    return data;
  },
  async updateCategoria(id: string, dto: Partial<CreateProdutoCategoriaDTO>): Promise<ProdutoCategoria> {
    const { data } = await api.patch<ProdutoCategoria>(`/produtos/categorias/${id}`, dto);
    return data;
  },
  async deleteCategoria(id: string): Promise<void> {
    await api.delete(`/produtos/categorias/${id}`);
  },
};

// ─── Armazéns (F2) ────────────────────────────────────────────────
export const armazemService = {
  async list(): Promise<Armazem[]> {
    const { data } = await api.get<Armazem[]>("/armazens");
    return data;
  },
  async create(dto: CreateArmazemDTO): Promise<Armazem> {
    const { data } = await api.post<Armazem>("/armazens", dto);
    return data;
  },
  async update(id: string, dto: Partial<CreateArmazemDTO>): Promise<Armazem> {
    const { data } = await api.patch<Armazem>(`/armazens/${id}`, dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/armazens/${id}`);
  },
};

// ─── Estoque (F2) ─────────────────────────────────────────────────
export const estoqueService = {
  async saldos(params?: { armazem_id?: string; produto_id?: string; abaixo_minimo?: boolean }): Promise<StockSaldo[]> {
    const { data } = await api.get<StockSaldo[]>("/estoque/saldos", { params });
    return data;
  },
  async setStockMinimo(dto: { produto_id: string; armazem_id: string; stock_minimo: number }): Promise<void> {
    await api.post("/estoque/saldos/stock-minimo", dto);
  },
  async alertas(): Promise<StockSaldo[]> {
    const { data } = await api.get<StockSaldo[]>("/estoque/alertas/stock-minimo");
    return data;
  },
  async movimentos(params?: Record<string, any>): Promise<StockMovimento[]> {
    const { data } = await api.get<StockMovimento[]>("/estoque/movimentos", { params });
    return data;
  },
  async entrada(dto: EntradaDTO): Promise<StockMovimento> {
    const { data } = await api.post<StockMovimento>("/estoque/movimentos/entrada", dto);
    return data;
  },
  async saida(dto: SaidaDTO): Promise<StockMovimento> {
    const { data } = await api.post<StockMovimento>("/estoque/movimentos/saida", dto);
    return data;
  },
  async transferencia(dto: TransferenciaDTO): Promise<StockMovimento> {
    const { data } = await api.post<StockMovimento>("/estoque/movimentos/transferencia", dto);
    return data;
  },
  async estornar(id: string): Promise<StockMovimento> {
    const { data } = await api.post<StockMovimento>(`/estoque/movimentos/${id}/estornar`);
    return data;
  },
  exportUrl(params?: Record<string, string | undefined>): string {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params || {})) if (v) q.append(k, v);
    const qs = q.toString();
    return `${api.defaults.baseURL}/estoque/movimentos/export${qs ? `?${qs}` : ""}`;
  },
  async downloadKardex(params?: Record<string, string | undefined>): Promise<Blob> {
    const { data } = await api.get<Blob>("/estoque/movimentos/export", {
      params, responseType: "blob",
    });
    return data;
  },
};

// ─── Localizações (Supply Chain) ──────────────────────────────────
export const localizacaoService = {
  async list(armazem_id?: string): Promise<Localizacao[]> {
    const { data } = await api.get<Localizacao[]>("/estoque/localizacoes", { params: { armazem_id } });
    return data;
  },
  async create(dto: CreateLocalizacaoDTO): Promise<Localizacao> {
    const { data } = await api.post<Localizacao>("/estoque/localizacoes", dto);
    return data;
  },
  async update(id: string, dto: Partial<CreateLocalizacaoDTO>): Promise<Localizacao> {
    const { data } = await api.patch<Localizacao>(`/estoque/localizacoes/${id}`, dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/estoque/localizacoes/${id}`);
  },
};

// ─── Inventários (Supply Chain) ───────────────────────────────────
export const inventarioService = {
  async list(params?: { armazem_id?: string; estado?: string }): Promise<Inventario[]> {
    const { data } = await api.get<Inventario[]>("/estoque/inventarios", { params });
    return data;
  },
  async create(armazem_id: string): Promise<Inventario> {
    const { data } = await api.post<Inventario>("/estoque/inventarios", { armazem_id });
    return data;
  },
  async iniciar(id: string): Promise<InventarioLinha[]> {
    const { data } = await api.post<InventarioLinha[]>(`/estoque/inventarios/${id}/iniciar`);
    return data;
  },
  async linhas(id: string): Promise<InventarioLinha[]> {
    const { data } = await api.get<InventarioLinha[]>(`/estoque/inventarios/${id}/linhas`);
    return data;
  },
  async registarContagem(id: string, dto: { produto_id: string; localizacao_id?: string; quantidade_contada: number }): Promise<InventarioLinha> {
    const { data } = await api.post<InventarioLinha>(`/estoque/inventarios/${id}/linhas`, dto);
    return data;
  },
  async concluir(id: string): Promise<Inventario> {
    const { data } = await api.post<Inventario>(`/estoque/inventarios/${id}/concluir`);
    return data;
  },
};

// ─── Compras (Supply Chain) ───────────────────────────────────────
export const requisicaoService = {
  async list(estado?: string): Promise<Requisicao[]> {
    const { data } = await api.get<Requisicao[]>("/compras/requisicoes", { params: { estado } });
    return data;
  },
  async create(dto: CreateRequisicaoDTO): Promise<Requisicao> {
    const { data } = await api.post<Requisicao>("/compras/requisicoes", dto);
    return data;
  },
  async submeter(id: string): Promise<Requisicao> {
    const { data } = await api.patch<Requisicao>(`/compras/requisicoes/${id}/submeter`);
    return data;
  },
  async aprovar(id: string): Promise<Requisicao> {
    const { data } = await api.post<Requisicao>(`/compras/requisicoes/${id}/aprovar`);
    return data;
  },
  async rejeitar(id: string, motivo: string): Promise<Requisicao> {
    const { data } = await api.post<Requisicao>(`/compras/requisicoes/${id}/rejeitar`, { motivo });
    return data;
  },
  async converterPedido(id: string, dto: ConverterPedidoDTO): Promise<{ pedido_id: string }> {
    const { data } = await api.post<{ pedido_id: string }>(`/compras/requisicoes/${id}/converter-pedido`, dto);
    return data;
  },
};

export const pedidoCompraService = {
  async list(params?: { estado?: string; fornecedor_id?: string }): Promise<PedidoCompra[]> {
    const { data } = await api.get<PedidoCompra[]>("/compras/pedidos", { params });
    return data;
  },
  async get(id: string): Promise<PedidoCompra> {
    const { data } = await api.get<PedidoCompra>(`/compras/pedidos/${id}`);
    return data;
  },
  async confirmar(id: string): Promise<PedidoCompra> {
    const { data } = await api.post<PedidoCompra>(`/compras/pedidos/${id}/confirmar`);
    return data;
  },
};

export const recepcaoService = {
  async list(pedido_id?: string): Promise<Recepcao[]> {
    const { data } = await api.get<Recepcao[]>("/compras/recepcoes", { params: { pedido_id } });
    return data;
  },
  async create(dto: CreateRecepcaoDTO): Promise<Recepcao> {
    const { data } = await api.post<Recepcao>("/compras/recepcoes", dto);
    return data;
  },
  async confirmar(id: string): Promise<Recepcao> {
    const { data } = await api.post<Recepcao>(`/compras/recepcoes/${id}/confirmar`);
    return data;
  },
};

// ─── Fornecedores · Contratos & Avaliação (Supply Chain) ──────────
export const fornecedorAvaliacaoService = {
  async listContratos(fornecedorId: string): Promise<ContratoFornecedor[]> {
    const { data } = await api.get<ContratoFornecedor[]>(`/fornecedores/${fornecedorId}/contratos`);
    return data;
  },
  async createContrato(fornecedorId: string, dto: CreateContratoDTO): Promise<ContratoFornecedor> {
    const { data } = await api.post<ContratoFornecedor>(`/fornecedores/${fornecedorId}/contratos`, dto);
    return data;
  },
  async deleteContrato(id: string): Promise<void> {
    await api.delete(`/fornecedores/contratos/${id}`);
  },
  async listAvaliacoes(fornecedorId: string): Promise<AvaliacaoFornecedor[]> {
    const { data } = await api.get<AvaliacaoFornecedor[]>(`/fornecedores/${fornecedorId}/avaliacoes`);
    return data;
  },
  async createAvaliacao(fornecedorId: string, dto: CreateAvaliacaoDTO): Promise<AvaliacaoFornecedor> {
    const { data } = await api.post<AvaliacaoFornecedor>(`/fornecedores/${fornecedorId}/avaliacoes`, dto);
    return data;
  },
};

// ─── Loja / Promoções (Comércio) ──────────────────────────────────
export const promocaoService = {
  async list(activo?: boolean): Promise<Promocao[]> {
    const { data } = await api.get<Promocao[]>("/loja/promocoes", { params: { activo } });
    return data;
  },
  async create(dto: CreatePromocaoDTO): Promise<Promocao> {
    const { data } = await api.post<Promocao>("/loja/promocoes", dto);
    return data;
  },
  async update(id: string, dto: Partial<CreatePromocaoDTO>): Promise<Promocao> {
    const { data } = await api.patch<Promocao>(`/loja/promocoes/${id}`, dto);
    return data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/loja/promocoes/${id}`);
  },
  async descontoSugerido(produtoId: string): Promise<{ tem_promocao: boolean; desconto_pct: number }> {
    const { data } = await api.get(`/loja/promocoes/desconto-sugerido/${produtoId}`);
    return data;
  },
};

// ─── Devoluções (Comércio / POS) ──────────────────────────────────
export const devolucaoService = {
  async list(vendaId?: string): Promise<Devolucao[]> {
    const { data } = await api.get<Devolucao[]>("/caixa/devolucoes", { params: { venda_id: vendaId } });
    return data;
  },
  async create(dto: CreateDevolucaoDTO): Promise<Devolucao> {
    const { data } = await api.post<Devolucao>("/caixa/devolucoes", dto);
    return data;
  },
};

// ─── E-Commerce (Comércio) ─────────────────────────────────────────
export const ecommerceService = {
  async getConfig(): Promise<LojaOnlineConfig> {
    const { data } = await api.get<LojaOnlineConfig>("/ecommerce/config");
    return data;
  },
  async updateConfig(dto: Partial<Omit<LojaOnlineConfig, "id" | "company_id" | "updated_at">>): Promise<LojaOnlineConfig> {
    const { data } = await api.patch<LojaOnlineConfig>("/ecommerce/config", dto);
    return data;
  },
  async listCupoes(): Promise<Cupao[]> {
    const { data } = await api.get<Cupao[]>("/ecommerce/cupoes");
    return data;
  },
  async createCupao(dto: CreateCupaoDTO): Promise<Cupao> {
    const { data } = await api.post<Cupao>("/ecommerce/cupoes", dto);
    return data;
  },
  async updateCupao(id: string, dto: Partial<CreateCupaoDTO>): Promise<Cupao> {
    const { data } = await api.patch<Cupao>(`/ecommerce/cupoes/${id}`, dto);
    return data;
  },
  async deleteCupao(id: string): Promise<void> {
    await api.delete(`/ecommerce/cupoes/${id}`);
  },
  async validarCupao(codigo: string): Promise<{ valido: boolean; motivo?: string; cupao_id?: string; tipo?: string; valor?: number }> {
    const { data } = await api.get(`/ecommerce/cupoes/validar`, { params: { codigo } });
    return data;
  },
  async checkout(dto: CheckoutDTO): Promise<PedidoOnline> {
    const { data } = await api.post<PedidoOnline>("/ecommerce/checkout", dto);
    return data;
  },
  async listPedidos(estado?: string): Promise<PedidoOnline[]> {
    const { data } = await api.get<PedidoOnline[]>("/ecommerce/pedidos", { params: { estado } });
    return data;
  },
  async getPedido(id: string): Promise<PedidoOnline> {
    const { data } = await api.get<PedidoOnline>(`/ecommerce/pedidos/${id}`);
    return data;
  },
  async atualizarEstado(id: string, estado: string): Promise<PedidoOnline> {
    const { data } = await api.post<PedidoOnline>(`/ecommerce/pedidos/${id}/atualizar-estado`, { estado });
    return data;
  },
};

// ─── Caixa / Vendas (F4 + F5) ─────────────────────────────────────
export const caixaService = {
  async sessaoActiva(): Promise<CaixaSessao | null> {
    const { data } = await api.get<CaixaSessao | null>("/caixa/sessoes/activa");
    return data;
  },
  async listSessoes(params?: { estado?: string }): Promise<CaixaSessao[]> {
    const { data } = await api.get<CaixaSessao[]>("/caixa/sessoes", { params });
    return data;
  },
  async abrirSessao(dto: { armazem_id: string; fundo_inicial: number; observacao?: string }): Promise<CaixaSessao> {
    const { data } = await api.post<CaixaSessao>("/caixa/sessoes/abrir", dto);
    return data;
  },
  async fecharSessao(id: string, dto: { fundo_contado: number; observacao?: string }): Promise<CaixaSessao> {
    const { data } = await api.post<CaixaSessao>(`/caixa/sessoes/${id}/fechar`, dto);
    return data;
  },
  async criarVenda(dto: VendaCreateDTO): Promise<Venda> {
    const { data } = await api.post<Venda>("/caixa/vendas", dto);
    return data;
  },
  async adicionarLinha(vendaId: string, dto: LinhaCreateDTO): Promise<Venda> {
    const { data } = await api.post<Venda>(`/caixa/vendas/${vendaId}/linhas`, dto);
    return data;
  },
  async removerLinha(vendaId: string, linhaId: string): Promise<Venda> {
    const { data } = await api.delete<Venda>(`/caixa/vendas/${vendaId}/linhas/${linhaId}`);
    return data;
  },
  async pagar(vendaId: string, dto: PagamentoCreateDTO): Promise<Venda> {
    const { data } = await api.post<Venda>(`/caixa/vendas/${vendaId}/pagamentos`, dto);
    return data;
  },
  async concluir(vendaId: string): Promise<Venda> {
    const { data } = await api.post<Venda>(`/caixa/vendas/${vendaId}/concluir`);
    return data;
  },
  async anular(vendaId: string): Promise<Venda> {
    const { data } = await api.post<Venda>(`/caixa/vendas/${vendaId}/anular`);
    return data;
  },
  async listVendas(params?: { estado?: string; sessao_id?: string; pendente_faturacao?: boolean; page?: number; page_size?: number }): Promise<Venda[]> {
    const { data } = await api.get<Venda[]>("/caixa/vendas", { params });
    return data;
  },
  async getVenda(id: string): Promise<Venda> {
    const { data } = await api.get<Venda>(`/caixa/vendas/${id}`);
    return data;
  },
  async fetchProformaBlob(id: string): Promise<string> {
    const { data } = await api.get(`/caixa/vendas/${id}/proforma.pdf`, {
      responseType: "blob",
    });
    return URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  },
  async downloadProformaPdf(id: string): Promise<void> {
    const { data, headers } = await api.get(`/caixa/vendas/${id}/proforma.pdf`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    const disposition = headers["content-disposition"] ?? "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    a.download = match ? match[1] : `proforma-${id}.pdf`;
    a.target = "_blank";
    a.click();
    URL.revokeObjectURL(url);
  },
  async marcarFaturada(id: string, numero_fatura_interna: string): Promise<Venda> {
    const { data } = await api.post<Venda>(`/caixa/vendas/${id}/marcar-faturada`, { numero_fatura_interna });
    return data;
  },
};
