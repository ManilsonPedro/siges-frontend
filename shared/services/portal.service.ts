import portalApi from "./portal-api";

export interface PortalTokens { access_token: string; refresh_token: string; token_type: string; }
export interface ContaCliente { id: string; cliente_id: string; email: string; telefone?: string | null; email_verificado: boolean; }
export interface ViaturaPortal { id: string; matricula: string; marca?: string | null; modelo?: string | null; cor?: string | null; categoria_veiculo_id?: string | null; }
export interface SlotDisponivel { id: string; box_id: string; box_codigo: string; data_hora_inicio: string; data_hora_fim: string; preco_estimado: number; }
export interface ExtraAplicadoPortal { extra_id: string; preco_aplicado: number; }
export interface ReservaPortal {
  id: string; viatura_id?: string | null; tipo_lavagem_id: string; box_id?: string | null; slot_id?: string | null;
  estado: string; preco_total?: number | null; extras: ExtraAplicadoPortal[]; created_at: string;
}

function salvarTokens(tokens: PortalTokens) {
  localStorage.setItem("portal_access_token", tokens.access_token);
  localStorage.setItem("portal_refresh_token", tokens.refresh_token);
}

export const portalAuthService = {
  async registar(dto: { nome: string; email: string; telefone?: string; password: string }): Promise<PortalTokens> {
    const { data } = await portalApi.post<PortalTokens>("/portal/auth/registar", dto);
    salvarTokens(data);
    return data;
  },
  async login(dto: { email: string; password: string }): Promise<PortalTokens> {
    const { data } = await portalApi.post<PortalTokens>("/portal/auth/login", dto);
    salvarTokens(data);
    return data;
  },
  async me(): Promise<ContaCliente> {
    const { data } = await portalApi.get<ContaCliente>("/portal/auth/me");
    return data;
  },
  logout(): void {
    localStorage.removeItem("portal_access_token");
    localStorage.removeItem("portal_refresh_token");
  },
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("portal_access_token");
  },
};

export const portalReservaService = {
  async disponibilidade(params: { data: string; tipo_lavagem_id: string; categoria_veiculo_id?: string }): Promise<SlotDisponivel[]> {
    const { data } = await portalApi.get<SlotDisponivel[]>("/portal/disponibilidade", { params });
    return data;
  },
  async listViaturas(): Promise<ViaturaPortal[]> {
    const { data } = await portalApi.get<ViaturaPortal[]>("/portal/viaturas");
    return data;
  },
  async registarViatura(dto: { matricula: string; marca?: string; modelo?: string; cor?: string; categoria_veiculo_id?: string }): Promise<ViaturaPortal> {
    const { data } = await portalApi.post<ViaturaPortal>("/portal/viaturas", dto);
    return data;
  },
  async minhasReservas(): Promise<ReservaPortal[]> {
    const { data } = await portalApi.get<ReservaPortal[]>("/portal/reservas/minhas");
    return data;
  },
  async getReserva(id: string): Promise<ReservaPortal> {
    const { data } = await portalApi.get<ReservaPortal>(`/portal/reservas/${id}`);
    return data;
  },
  async criarReserva(dto: { viatura_id: string; tipo_lavagem_id: string; slot_id: string; extra_ids?: string[] }): Promise<ReservaPortal> {
    const { data } = await portalApi.post<ReservaPortal>("/portal/reservas", dto);
    return data;
  },
  async cancelarReserva(id: string): Promise<ReservaPortal> {
    const { data } = await portalApi.post<ReservaPortal>(`/portal/reservas/${id}/cancelar`);
    return data;
  },
};
