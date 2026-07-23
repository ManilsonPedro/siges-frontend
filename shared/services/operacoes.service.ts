import api from "./api";
import type {
  Filial, AreaServico, Equipamento, TurnoOperacional,
  TipoLavagem, BoxLavagem, SlotLavagem, OrdemLavagem,
  CategoriaVeiculo, CreateCategoriaVeiculoDTO,
  ExtraLavagem, CreateExtraLavagemDTO,
  Viatura, CreateViaturaDTO,
  CreateWalkinDTO, FilaItem,
  EquipaLavagem, CreateEquipaLavagemDTO,
  EscalaTurno, CreateEscalaTurnoDTO,
  TanqueAgua, ConsumoAgua, AbastecimentoAgua, MovimentoTanqueAgua,
} from "@/shared/types";

export const operacoesEstacaoService = {
  async listFiliais(): Promise<Filial[]> {
    const { data } = await api.get<Filial[]>("/operacoes/estacao/filiais");
    return data;
  },
  async createFilial(dto: { nome: string; morada?: string; activo?: boolean }): Promise<Filial> {
    const { data } = await api.post<Filial>("/operacoes/estacao/filiais", dto);
    return data;
  },
  async updateFilial(id: string, dto: Partial<{ nome: string; morada: string; activo: boolean }>): Promise<Filial> {
    const { data } = await api.patch<Filial>(`/operacoes/estacao/filiais/${id}`, dto);
    return data;
  },
  async deleteFilial(id: string): Promise<void> {
    await api.delete(`/operacoes/estacao/filiais/${id}`);
  },
  async listAreas(): Promise<AreaServico[]> {
    const { data } = await api.get<AreaServico[]>("/operacoes/estacao/areas-servico");
    return data;
  },
  async createArea(dto: { filial_id?: string; nome: string; tipo: string; activo?: boolean }): Promise<AreaServico> {
    const { data } = await api.post<AreaServico>("/operacoes/estacao/areas-servico", dto);
    return data;
  },
  async deleteArea(id: string): Promise<void> {
    await api.delete(`/operacoes/estacao/areas-servico/${id}`);
  },
  async listEquipamentos(): Promise<Equipamento[]> {
    const { data } = await api.get<Equipamento[]>("/operacoes/estacao/equipamentos");
    return data;
  },
  async createEquipamento(dto: { area_servico_id?: string; nome: string; tipo: string }): Promise<Equipamento> {
    const { data } = await api.post<Equipamento>("/operacoes/estacao/equipamentos", dto);
    return data;
  },
  async registarManutencao(id: string): Promise<Equipamento> {
    const { data } = await api.post<Equipamento>(`/operacoes/estacao/equipamentos/${id}/registar-manutencao`);
    return data;
  },
  async listTurnos(): Promise<TurnoOperacional[]> {
    const { data } = await api.get<TurnoOperacional[]>("/operacoes/estacao/turnos");
    return data;
  },
  async createTurno(dto: { nome: string; hora_inicio: string; hora_fim: string }): Promise<TurnoOperacional> {
    const { data } = await api.post<TurnoOperacional>("/operacoes/estacao/turnos", dto);
    return data;
  },
  async deleteTurno(id: string): Promise<void> {
    await api.delete(`/operacoes/estacao/turnos/${id}`);
  },
};

export const operacoesLavagemService = {
  async listTipos(): Promise<TipoLavagem[]> {
    const { data } = await api.get<TipoLavagem[]>("/operacoes/lavagem/tipos");
    return data;
  },
  async createTipo(dto: { codigo: string; nome: string; descricao?: string; preco_base: number; duracao_estimada_minutos?: number; agua_estimada_litros?: number }): Promise<TipoLavagem> {
    const { data } = await api.post<TipoLavagem>("/operacoes/lavagem/tipos", dto);
    return data;
  },
  async deleteTipo(id: string): Promise<void> {
    await api.delete(`/operacoes/lavagem/tipos/${id}`);
  },
  async listBoxes(): Promise<BoxLavagem[]> {
    const { data } = await api.get<BoxLavagem[]>("/operacoes/lavagem/boxes");
    return data;
  },
  async createBox(dto: { area_servico_id?: string; filial_id?: string; codigo: string; nome: string; capacidade?: number }): Promise<BoxLavagem> {
    const { data } = await api.post<BoxLavagem>("/operacoes/lavagem/boxes", dto);
    return data;
  },
  async listSlots(params?: { box_id?: string; estado?: string }): Promise<SlotLavagem[]> {
    const { data } = await api.get<SlotLavagem[]>("/operacoes/lavagem/slots", { params });
    return data;
  },
  async createSlot(dto: { box_id: string; data_hora_inicio: string; data_hora_fim: string; preco_override?: number }): Promise<SlotLavagem> {
    const { data } = await api.post<SlotLavagem>("/operacoes/lavagem/slots", dto);
    return data;
  },
  async listOrdens(estado?: string): Promise<OrdemLavagem[]> {
    const { data } = await api.get<OrdemLavagem[]>("/operacoes/lavagem/ordens", { params: { estado } });
    return data;
  },
  async createOrdem(dto: { cliente_id?: string; viatura_id?: string; tipo_lavagem_id: string; slot_id?: string; box_id?: string; extra_ids?: string[]; origem?: string }): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>("/operacoes/lavagem/ordens", dto);
    return data;
  },
  // Categorias de Veículo
  async listCategoriasVeiculo(): Promise<CategoriaVeiculo[]> {
    const { data } = await api.get<CategoriaVeiculo[]>("/operacoes/lavagem/categorias-veiculo");
    return data;
  },
  async createCategoriaVeiculo(dto: CreateCategoriaVeiculoDTO): Promise<CategoriaVeiculo> {
    const { data } = await api.post<CategoriaVeiculo>("/operacoes/lavagem/categorias-veiculo", dto);
    return data;
  },
  async updateCategoriaVeiculo(id: string, dto: Partial<CreateCategoriaVeiculoDTO>): Promise<CategoriaVeiculo> {
    const { data } = await api.patch<CategoriaVeiculo>(`/operacoes/lavagem/categorias-veiculo/${id}`, dto);
    return data;
  },
  async deleteCategoriaVeiculo(id: string): Promise<void> {
    await api.delete(`/operacoes/lavagem/categorias-veiculo/${id}`);
  },
  // Extras
  async listExtras(): Promise<ExtraLavagem[]> {
    const { data } = await api.get<ExtraLavagem[]>("/operacoes/lavagem/extras");
    return data;
  },
  async createExtra(dto: CreateExtraLavagemDTO): Promise<ExtraLavagem> {
    const { data } = await api.post<ExtraLavagem>("/operacoes/lavagem/extras", dto);
    return data;
  },
  async updateExtra(id: string, dto: Partial<CreateExtraLavagemDTO>): Promise<ExtraLavagem> {
    const { data } = await api.patch<ExtraLavagem>(`/operacoes/lavagem/extras/${id}`, dto);
    return data;
  },
  async deleteExtra(id: string): Promise<void> {
    await api.delete(`/operacoes/lavagem/extras/${id}`);
  },
  // Viaturas
  async listViaturas(matricula?: string): Promise<Viatura[]> {
    const { data } = await api.get<Viatura[]>("/operacoes/lavagem/viaturas", { params: { matricula } });
    return data;
  },
  async createViatura(dto: CreateViaturaDTO): Promise<Viatura> {
    const { data } = await api.post<Viatura>("/operacoes/lavagem/viaturas", dto);
    return data;
  },
  // Walk-in e Fila de Prioridade
  async createWalkin(dto: CreateWalkinDTO): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>("/operacoes/lavagem/ordens/walkin", dto);
    return data;
  },
  async filaAtendimento(): Promise<FilaItem[]> {
    const { data } = await api.get<FilaItem[]>("/operacoes/lavagem/fila-atendimento");
    return data;
  },
  async checkin(id: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/checkin`);
    return data;
  },
  async marcarNoShow(id: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/no-show`);
    return data;
  },
  async iniciar(id: string, box_id?: string, colaborador_responsavel_id?: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/iniciar`, null, { params: { box_id, colaborador_responsavel_id } });
    return data;
  },
  async definirColaboradorResponsavel(id: string, colaborador_responsavel_id: string): Promise<OrdemLavagem> {
    const { data } = await api.patch<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/colaborador-responsavel`, { colaborador_responsavel_id });
    return data;
  },
  async registarConsumo(id: string, dto: { agua_consumida_litros?: number; quimicos?: any[]; armazem_id?: string }): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/registar-consumo`, dto);
    return data;
  },
  async controloQualidade(id: string, dto: { pontuacao: number; observacoes?: string }): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/controlo-qualidade`, dto);
    return data;
  },
  async getFotos(id: string): Promise<{ fotos_antes: string[]; fotos_depois: string[] }> {
    const { data } = await api.get(`/operacoes/lavagem/ordens/${id}/fotos`);
    return data;
  },
  async uploadFoto(id: string, momento: "antes" | "depois", file: File): Promise<void> {
    const form = new FormData();
    form.append("file", file);
    await api.post(`/operacoes/lavagem/ordens/${id}/fotos`, form, {
      params: { momento },
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  async oferecerRelavagem(id: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/oferecer-re-lavagem`);
    return data;
  },
  async concluir(id: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/concluir`);
    return data;
  },
  // Equipas
  async listEquipas(): Promise<EquipaLavagem[]> {
    const { data } = await api.get<EquipaLavagem[]>("/operacoes/lavagem/equipas");
    return data;
  },
  async createEquipa(dto: CreateEquipaLavagemDTO): Promise<EquipaLavagem> {
    const { data } = await api.post<EquipaLavagem>("/operacoes/lavagem/equipas", dto);
    return data;
  },
  async updateEquipa(id: string, dto: Partial<CreateEquipaLavagemDTO>): Promise<EquipaLavagem> {
    const { data } = await api.patch<EquipaLavagem>(`/operacoes/lavagem/equipas/${id}`, dto);
    return data;
  },
  async deleteEquipa(id: string): Promise<void> {
    await api.delete(`/operacoes/lavagem/equipas/${id}`);
  },
  async addMembroEquipa(id: string, user_id: string): Promise<EquipaLavagem> {
    const { data } = await api.post<EquipaLavagem>(`/operacoes/lavagem/equipas/${id}/membros`, { user_id });
    return data;
  },
  async removeMembroEquipa(id: string, user_id: string): Promise<void> {
    await api.delete(`/operacoes/lavagem/equipas/${id}/membros/${user_id}`);
  },
  // Escalas
  async listEscalas(params?: { data?: string; box_id?: string }): Promise<EscalaTurno[]> {
    const { data } = await api.get<EscalaTurno[]>("/operacoes/lavagem/escalas", { params });
    return data;
  },
  async createEscala(dto: CreateEscalaTurnoDTO): Promise<EscalaTurno> {
    const { data } = await api.post<EscalaTurno>("/operacoes/lavagem/escalas", dto);
    return data;
  },
  async deleteEscala(id: string): Promise<void> {
    await api.delete(`/operacoes/lavagem/escalas/${id}`);
  },
};

export const operacoesAguaService = {
  async listTanques(): Promise<TanqueAgua[]> {
    const { data } = await api.get<TanqueAgua[]>("/operacoes/agua/tanques");
    return data;
  },
  async createTanque(dto: Partial<TanqueAgua>): Promise<TanqueAgua> {
    const { data } = await api.post<TanqueAgua>("/operacoes/agua/tanques", dto);
    return data;
  },
  async updateTanque(id: string, dto: Partial<TanqueAgua>): Promise<TanqueAgua> {
    const { data } = await api.patch<TanqueAgua>(`/operacoes/agua/tanques/${id}`, dto);
    return data;
  },
  async deleteTanque(id: string): Promise<void> {
    await api.delete(`/operacoes/agua/tanques/${id}`);
  },
  async registarLeitura(id: string, dto: { nivel_litros?: number; ph?: number; turbidez?: number; condutividade?: number }): Promise<TanqueAgua> {
    const { data } = await api.post<TanqueAgua>(`/operacoes/agua/tanques/${id}/leitura`, dto);
    return data;
  },
  async listConsumos(tanque_agua_id?: string): Promise<ConsumoAgua[]> {
    const { data } = await api.get<ConsumoAgua[]>("/operacoes/agua/consumos", { params: { tanque_agua_id } });
    return data;
  },
  async createConsumo(dto: { tanque_agua_id: string; litros_consumidos: number; tipo: string; custo_por_litro?: number }): Promise<ConsumoAgua> {
    const { data } = await api.post<ConsumoAgua>("/operacoes/agua/consumos", dto);
    return data;
  },
  async indicadores(): Promise<{ consumo_total_litros: number; custo_total: number; percentual_reciclagem: number }> {
    const { data } = await api.get("/operacoes/agua/indicadores");
    return data;
  },
  async alertas(): Promise<{ alertas: { tipo: string; severidade: "alta" | "media" | "baixa"; mensagem: string; tanque_agua_id?: string | null; abastecimento_id?: string }[]; total: number }> {
    const { data } = await api.get("/operacoes/agua/alertas");
    return data;
  },
  async custos(params?: { data_inicio?: string; data_fim?: string }): Promise<{
    por_abastecimento: { abastecimento_id: string; numero: string | null; custo_total: number; data: string }[];
    por_fornecedor: { fornecedor_id: string; fornecedor_nome: string; custo_total: number }[];
    por_filial: { filial_id: string; filial_nome: string; custo_total: number }[];
    por_tanque: { tanque_agua_id: string; tanque_codigo: string; custo_total: number }[];
    evolucao_preco_medio_litro: { mes: string; preco_medio_litro: number }[];
  }> {
    const { data } = await api.get("/operacoes/agua/custos", { params });
    return data;
  },
  async listAbastecimentos(params?: {
    tanque_agua_id?: string; fornecedor_id?: string; filial_id?: string; estado?: string;
    data_inicio?: string; data_fim?: string;
    valor_min?: number; valor_max?: number; quantidade_min?: number; quantidade_max?: number;
  }): Promise<AbastecimentoAgua[]> {
    const { data } = await api.get<AbastecimentoAgua[]>("/operacoes/agua/abastecimentos", { params });
    return data;
  },
  async createAbastecimento(dto: {
    tanque_agua_id: string; fornecedor_id: string; filial_id?: string; equipamento_id?: string;
    quantidade_litros: number; valor_por_litro: number; metodo_pagamento?: string;
    observacoes?: string; recebido_por_id?: string;
  }): Promise<AbastecimentoAgua> {
    const { data } = await api.post<AbastecimentoAgua>("/operacoes/agua/abastecimentos", dto);
    return data;
  },
  async atualizarEstadoAbastecimento(id: string, estado: string): Promise<AbastecimentoAgua> {
    const { data } = await api.patch<AbastecimentoAgua>(`/operacoes/agua/abastecimentos/${id}/estado`, { estado });
    return data;
  },
  async listMovimentosTanque(id: string): Promise<MovimentoTanqueAgua[]> {
    const { data } = await api.get<MovimentoTanqueAgua[]>(`/operacoes/agua/tanques/${id}/movimentos`);
    return data;
  },
  async createMovimentoTanque(id: string, dto: { tipo: string; quantidade_litros: number; observacoes?: string }): Promise<MovimentoTanqueAgua> {
    const { data } = await api.post<MovimentoTanqueAgua>(`/operacoes/agua/tanques/${id}/movimentos`, dto);
    return data;
  },
  async consumoPorDimensao(dimensao: "box" | "colaborador" | "equipa"): Promise<{ dimensao: string; itens: { chave: string; label: string; litros: number; n_lavagens: number }[] }> {
    const { data } = await api.get("/operacoes/agua/consumo-por-dimensao", { params: { dimensao } });
    return data;
  },
  async gerarDocumentoAbastecimento(id: string, tipo: string): Promise<void> {
    const { data, headers } = await api.post(`/operacoes/agua/abastecimentos/${id}/documentos/${tipo}`, null, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
    const disposition = headers["content-disposition"] ?? "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `${tipo}.pdf`;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.click();
    URL.revokeObjectURL(url);
  },
};
