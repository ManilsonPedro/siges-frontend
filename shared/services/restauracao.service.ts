import api from "./api";
import type { Mesa, ItemMenu, Comanda, ReservaMesa, HappyHour, Combo, PedidoProducao } from "@/shared/types";

export const restauracaoBaseService = {
  async listMesas(): Promise<Mesa[]> {
    const { data } = await api.get<Mesa[]>("/restauracao/mesas");
    return data;
  },
  async createMesa(dto: { area_servico_id?: string; numero: string; capacidade?: number }): Promise<Mesa> {
    const { data } = await api.post<Mesa>("/restauracao/mesas", dto);
    return data;
  },
  async deleteMesa(id: string): Promise<void> {
    await api.delete(`/restauracao/mesas/${id}`);
  },
  async listItensMenu(tipo_negocio?: string): Promise<ItemMenu[]> {
    const { data } = await api.get<ItemMenu[]>("/restauracao/itens-menu", { params: { tipo_negocio } });
    return data;
  },
  async createItemMenu(dto: { tipo_negocio: string; nome: string; descricao?: string; preco: number; categoria?: string; ingredientes?: any[]; activo?: boolean }): Promise<ItemMenu> {
    const { data } = await api.post<ItemMenu>("/restauracao/itens-menu", dto);
    return data;
  },
  async deleteItemMenu(id: string): Promise<void> {
    await api.delete(`/restauracao/itens-menu/${id}`);
  },
  async listComandas(estado?: string): Promise<Comanda[]> {
    const { data } = await api.get<Comanda[]>("/restauracao/comandas", { params: { estado } });
    return data;
  },
  async createComanda(dto: { mesa_id?: string; cliente_id?: string }): Promise<Comanda> {
    const { data } = await api.post<Comanda>("/restauracao/comandas", dto);
    return data;
  },
  async adicionarLinha(comandaId: string, dto: { item_id: string; quantidade?: number; observacoes?: string }): Promise<Comanda> {
    const { data } = await api.post<Comanda>(`/restauracao/comandas/${comandaId}/linhas`, dto);
    return data;
  },
  async mudarEstadoLinha(comandaId: string, linhaId: string, estado: string): Promise<Comanda> {
    const { data } = await api.patch<Comanda>(`/restauracao/comandas/${comandaId}/linhas/${linhaId}`, { estado });
    return data;
  },
  async cancelarLinha(comandaId: string, linhaId: string): Promise<Comanda> {
    const { data } = await api.delete<Comanda>(`/restauracao/comandas/${comandaId}/linhas/${linhaId}`);
    return data;
  },
  async fecharComanda(comandaId: string, armazemId: string): Promise<Comanda> {
    const { data } = await api.post<Comanda>(`/restauracao/comandas/${comandaId}/fechar`, null, { params: { armazem_id: armazemId } });
    return data;
  },
};

export const restauracaoBarService = {
  async listHappyHour(): Promise<HappyHour[]> {
    const { data } = await api.get<HappyHour[]>("/restauracao/bar/happy-hour");
    return data;
  },
  async createHappyHour(dto: { dia_semana: number; hora_inicio: string; hora_fim: string; desconto_pct: number; itens_aplicaveis?: string[] }): Promise<HappyHour> {
    const { data } = await api.post<HappyHour>("/restauracao/bar/happy-hour", dto);
    return data;
  },
  async deleteHappyHour(id: string): Promise<void> {
    await api.delete(`/restauracao/bar/happy-hour/${id}`);
  },
};

export const restauracaoRestauranteService = {
  async listReservas(): Promise<ReservaMesa[]> {
    const { data } = await api.get<ReservaMesa[]>("/restauracao/restaurante/reservas");
    return data;
  },
  async createReserva(dto: { mesa_id?: string; cliente_id?: string; nome_cliente?: string; data_hora: string; numero_pessoas?: number }): Promise<ReservaMesa> {
    const { data } = await api.post<ReservaMesa>("/restauracao/restaurante/reservas", dto);
    return data;
  },
  async updateReserva(id: string, estado: string): Promise<ReservaMesa> {
    const { data } = await api.patch<ReservaMesa>(`/restauracao/restaurante/reservas/${id}`, { estado });
    return data;
  },
  async contaMesa(mesaId: string): Promise<{ mesa_id: string; total: number; comandas: any[] }> {
    const { data } = await api.get(`/restauracao/restaurante/mesas/${mesaId}/conta`);
    return data;
  },
};

export const restauracaoChurrasqueiraService = {
  async listCombos(): Promise<Combo[]> {
    const { data } = await api.get<Combo[]>("/restauracao/churrasqueira/combos");
    return data;
  },
  async createCombo(dto: { nome: string; itens: { item_menu_id: string; quantidade: number }[]; preco_combo: number }): Promise<Combo> {
    const { data } = await api.post<Combo>("/restauracao/churrasqueira/combos", dto);
    return data;
  },
  async deleteCombo(id: string): Promise<void> {
    await api.delete(`/restauracao/churrasqueira/combos/${id}`);
  },
  async listKds(): Promise<PedidoProducao[]> {
    const { data } = await api.get<PedidoProducao[]>("/restauracao/churrasqueira/kds");
    return data;
  },
  async avancarEstado(id: string): Promise<PedidoProducao> {
    const { data } = await api.post<PedidoProducao>(`/restauracao/churrasqueira/pedidos-producao/${id}/avancar-estado`);
    return data;
  },
};
