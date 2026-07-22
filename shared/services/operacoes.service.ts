import api from "./api";
import type {
  AreaServico, Equipamento, TurnoOperacional,
  TanqueCombustivel, Bomba, Bico, Abastecimento,
  TipoLavagem, BoxLavagem, SlotLavagem, OrdemLavagem,
  CategoriaVeiculo, CreateCategoriaVeiculoDTO,
  ExtraLavagem, CreateExtraLavagemDTO,
  Viatura, CreateViaturaDTO,
  TanqueAgua, ConsumoAgua,
} from "@/shared/types";

export const operacoesEstacaoService = {
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

export const operacoesCombustivelService = {
  async listTanques(): Promise<TanqueCombustivel[]> {
    const { data } = await api.get<TanqueCombustivel[]>("/operacoes/combustivel/tanques");
    return data;
  },
  async createTanque(dto: { codigo: string; tipo_combustivel: string; capacidade_litros: number; nivel_atual_litros?: number; nivel_minimo_litros?: number; nivel_reordenamento_litros?: number }): Promise<TanqueCombustivel> {
    const { data } = await api.post<TanqueCombustivel>("/operacoes/combustivel/tanques", dto);
    return data;
  },
  async registarLeitura(id: string, dto: { nivel_litros: number; temperatura?: number; origem?: string }): Promise<any> {
    const { data } = await api.post(`/operacoes/combustivel/tanques/${id}/leitura`, dto);
    return data;
  },
  async calcularVariacao(id: string, teorico_final_litros: number): Promise<any> {
    const { data } = await api.get(`/operacoes/combustivel/tanques/${id}/variacao`, { params: { teorico_final_litros } });
    return data;
  },
  async listBombas(): Promise<Bomba[]> {
    const { data } = await api.get<Bomba[]>("/operacoes/combustivel/bombas");
    return data;
  },
  async createBomba(dto: { area_servico_id?: string; codigo: string; tanque_id: string }): Promise<Bomba> {
    const { data } = await api.post<Bomba>("/operacoes/combustivel/bombas", dto);
    return data;
  },
  async listBicos(bomba_id?: string): Promise<Bico[]> {
    const { data } = await api.get<Bico[]>("/operacoes/combustivel/bicos", { params: { bomba_id } });
    return data;
  },
  async createBico(dto: { bomba_id: string; codigo: string; tipo_combustivel: string }): Promise<Bico> {
    const { data } = await api.post<Bico>("/operacoes/combustivel/bicos", dto);
    return data;
  },
  async listAbastecimentos(): Promise<Abastecimento[]> {
    const { data } = await api.get<Abastecimento[]>("/operacoes/combustivel/abastecimentos");
    return data;
  },
  async registarAbastecimento(dto: { bico_id: string; volume_litros: number; preco_unitario: number; cliente_id?: string; forma_pagamento: string }): Promise<Abastecimento> {
    const { data } = await api.post<Abastecimento>("/operacoes/combustivel/abastecimentos", dto);
    return data;
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
  async createBox(dto: { area_servico_id?: string; codigo: string; nome: string; capacidade?: number }): Promise<BoxLavagem> {
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
  async checkin(id: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/checkin`);
    return data;
  },
  async iniciar(id: string, box_id?: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/iniciar`, null, { params: { box_id } });
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
  async oferecerRelavagem(id: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/oferecer-re-lavagem`);
    return data;
  },
  async concluir(id: string): Promise<OrdemLavagem> {
    const { data } = await api.post<OrdemLavagem>(`/operacoes/lavagem/ordens/${id}/concluir`);
    return data;
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
};
