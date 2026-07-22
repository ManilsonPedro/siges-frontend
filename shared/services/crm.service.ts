import api from "./api";
import type {
  Lead, EtapaPipeline, Oportunidade, Viatura, Visita, TarefaCRM,
  SegmentoCliente, Campanha, Reclamacao, Sugestao, TicketAtendimento,
} from "@/shared/types";

export const crmService = {
  async listLeads(estado?: string): Promise<Lead[]> {
    const { data } = await api.get<Lead[]>("/crm/leads", { params: { estado } });
    return data;
  },
  async createLead(dto: { nome: string; empresa?: string; telefone?: string; email?: string; origem?: string }): Promise<Lead> {
    const { data } = await api.post<Lead>("/crm/leads", dto);
    return data;
  },
  async updateLead(id: string, dto: Partial<Lead>): Promise<Lead> {
    const { data } = await api.patch<Lead>(`/crm/leads/${id}`, dto);
    return data;
  },
  async converterLead(id: string, etapaPipelineId: string): Promise<{ cliente_id: string; oportunidade_id: string }> {
    const { data } = await api.post(`/crm/leads/${id}/converter`, null, { params: { etapa_pipeline_id: etapaPipelineId } });
    return data;
  },
  async listEtapas(): Promise<EtapaPipeline[]> {
    const { data } = await api.get<EtapaPipeline[]>("/crm/pipeline/etapas");
    return data;
  },
  async createEtapa(dto: { nome: string; ordem?: number; cor?: string }): Promise<EtapaPipeline> {
    const { data } = await api.post<EtapaPipeline>("/crm/pipeline/etapas", dto);
    return data;
  },
  async listOportunidades(estado?: string): Promise<Oportunidade[]> {
    const { data } = await api.get<Oportunidade[]>("/crm/oportunidades", { params: { estado } });
    return data;
  },
  async createOportunidade(dto: { titulo: string; etapa_pipeline_id: string; valor_estimado?: number; probabilidade_pct?: number; cliente_id?: string; lead_id?: string }): Promise<Oportunidade> {
    const { data } = await api.post<Oportunidade>("/crm/oportunidades", dto);
    return data;
  },
  async moverEtapa(id: string, etapaPipelineId: string): Promise<Oportunidade> {
    const { data } = await api.post<Oportunidade>(`/crm/oportunidades/${id}/mover-etapa`, null, { params: { etapa_pipeline_id: etapaPipelineId } });
    return data;
  },
  async ganharOportunidade(id: string): Promise<Oportunidade> {
    const { data } = await api.post<Oportunidade>(`/crm/oportunidades/${id}/ganhar`);
    return data;
  },
  async perderOportunidade(id: string, motivo: string): Promise<Oportunidade> {
    const { data } = await api.post<Oportunidade>(`/crm/oportunidades/${id}/perder`, { motivo });
    return data;
  },
  async listViaturas(clienteId?: string): Promise<Viatura[]> {
    const { data } = await api.get<Viatura[]>("/crm/viaturas", { params: { cliente_id: clienteId } });
    return data;
  },
  async createViatura(dto: { cliente_id: string; matricula: string; marca?: string; modelo?: string; cor?: string }): Promise<Viatura> {
    const { data } = await api.post<Viatura>("/crm/viaturas", dto);
    return data;
  },
  async listVisitas(): Promise<Visita[]> {
    const { data } = await api.get<Visita[]>("/crm/visitas");
    return data;
  },
  async createVisita(dto: { cliente_id?: string; oportunidade_id?: string; data_hora: string; tipo?: string; notas?: string }): Promise<Visita> {
    const { data } = await api.post<Visita>("/crm/visitas", dto);
    return data;
  },
  async updateVisita(id: string, dto: { estado?: string; notas?: string }): Promise<Visita> {
    const { data } = await api.patch<Visita>(`/crm/visitas/${id}`, dto);
    return data;
  },
  async listTarefas(estado?: string): Promise<TarefaCRM[]> {
    const { data } = await api.get<TarefaCRM[]>("/crm/tarefas", { params: { estado } });
    return data;
  },
  async createTarefa(dto: { titulo: string; descricao?: string; tipo?: string; prazo?: string; prioridade?: string }): Promise<TarefaCRM> {
    const { data } = await api.post<TarefaCRM>("/crm/tarefas", dto);
    return data;
  },
  async updateTarefa(id: string, estado: string): Promise<TarefaCRM> {
    const { data } = await api.patch<TarefaCRM>(`/crm/tarefas/${id}`, { estado });
    return data;
  },
};

export const marketingService = {
  async listSegmentos(): Promise<SegmentoCliente[]> {
    const { data } = await api.get<SegmentoCliente[]>("/marketing/segmentos");
    return data;
  },
  async createSegmento(dto: { nome: string; criterios?: Record<string, any> }): Promise<SegmentoCliente> {
    const { data } = await api.post<SegmentoCliente>("/marketing/segmentos", dto);
    return data;
  },
  async previewSegmento(id: string): Promise<{ total: number; clientes: any[] }> {
    const { data } = await api.get(`/marketing/segmentos/${id}/preview`);
    return data;
  },
  async listCampanhas(): Promise<Campanha[]> {
    const { data } = await api.get<Campanha[]>("/marketing/campanhas");
    return data;
  },
  async createCampanha(dto: { nome: string; tipo: string; segmento_id?: string; conteudo: string; data_agendada?: string }): Promise<Campanha> {
    const { data } = await api.post<Campanha>("/marketing/campanhas", dto);
    return data;
  },
  async enviarCampanha(id: string): Promise<Campanha> {
    const { data } = await api.post<Campanha>(`/marketing/campanhas/${id}/enviar`);
    return data;
  },
  async cancelarCampanha(id: string): Promise<Campanha> {
    const { data } = await api.post<Campanha>(`/marketing/campanhas/${id}/cancelar`);
    return data;
  },
};

export const atendimentoService = {
  async listReclamacoes(estado?: string): Promise<Reclamacao[]> {
    const { data } = await api.get<Reclamacao[]>("/atendimento/reclamacoes", { params: { estado } });
    return data;
  },
  async createReclamacao(dto: { cliente_id?: string; assunto: string; descricao: string; canal: string; gravidade?: string }): Promise<Reclamacao> {
    const { data } = await api.post<Reclamacao>("/atendimento/reclamacoes", dto);
    return data;
  },
  async resolverReclamacao(id: string): Promise<Reclamacao> {
    const { data } = await api.post<Reclamacao>(`/atendimento/reclamacoes/${id}/resolver`);
    return data;
  },
  async listSugestoes(): Promise<Sugestao[]> {
    const { data } = await api.get<Sugestao[]>("/atendimento/sugestoes");
    return data;
  },
  async createSugestao(dto: { descricao: string; cliente_id?: string }): Promise<Sugestao> {
    const { data } = await api.post<Sugestao>("/atendimento/sugestoes", dto);
    return data;
  },
  async updateSugestao(id: string, estado: string): Promise<Sugestao> {
    const { data } = await api.patch<Sugestao>(`/atendimento/sugestoes/${id}`, { estado });
    return data;
  },
  async listTickets(estado?: string): Promise<TicketAtendimento[]> {
    const { data } = await api.get<TicketAtendimento[]>("/atendimento/tickets", { params: { estado } });
    return data;
  },
  async createTicket(dto: { assunto: string; descricao: string; cliente_id?: string; prioridade?: string }): Promise<TicketAtendimento> {
    const { data } = await api.post<TicketAtendimento>("/atendimento/tickets", dto);
    return data;
  },
  async resolverTicket(id: string): Promise<TicketAtendimento> {
    const { data } = await api.post<TicketAtendimento>(`/atendimento/tickets/${id}/resolver`);
    return data;
  },
};
