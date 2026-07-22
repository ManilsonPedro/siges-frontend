import api from "./api";
import type {
  Departamento, Colaborador, OrganogramaNode, ContratoRH, HorarioColaborador,
  RegistoPonto, Falta, Ferias, HoraExtra, Subsidio, DescontoRH,
  FolhaPagamento, ReciboSalario, ObjetivoRH, Competencia, AvaliacaoRH, Formacao,
} from "@/shared/types";

export const rhService = {
  async listDepartamentos(): Promise<Departamento[]> {
    const { data } = await api.get<Departamento[]>("/rh/departamentos");
    return data;
  },
  async createDepartamento(dto: { nome: string; responsavel_id?: string }): Promise<Departamento> {
    const { data } = await api.post<Departamento>("/rh/departamentos", dto);
    return data;
  },
  async deleteDepartamento(id: string): Promise<void> {
    await api.delete(`/rh/departamentos/${id}`);
  },
  async listColaboradores(estado?: string): Promise<Colaborador[]> {
    const { data } = await api.get<Colaborador[]>("/rh/colaboradores", { params: { estado } });
    return data;
  },
  async createColaborador(dto: { nome: string; cargo?: string; departamento_id?: string; data_admissao: string; salario_base?: number; superior_id?: string }): Promise<Colaborador> {
    const { data } = await api.post<Colaborador>("/rh/colaboradores", dto);
    return data;
  },
  async updateColaborador(id: string, dto: Partial<Colaborador>): Promise<Colaborador> {
    const { data } = await api.patch<Colaborador>(`/rh/colaboradores/${id}`, dto);
    return data;
  },
  async deleteColaborador(id: string): Promise<void> {
    await api.delete(`/rh/colaboradores/${id}`);
  },
  async organograma(): Promise<OrganogramaNode[]> {
    const { data } = await api.get<OrganogramaNode[]>("/rh/organograma");
    return data;
  },
  async listContratos(colaboradorId: string): Promise<ContratoRH[]> {
    const { data } = await api.get<ContratoRH[]>(`/rh/colaboradores/${colaboradorId}/contratos`);
    return data;
  },
  async createContrato(colaboradorId: string, dto: { tipo: string; data_inicio: string; data_fim?: string }): Promise<ContratoRH> {
    const { data } = await api.post<ContratoRH>(`/rh/colaboradores/${colaboradorId}/contratos`, dto);
    return data;
  },
};

export const rhTempoService = {
  async getHorarios(colaboradorId: string): Promise<HorarioColaborador[]> {
    const { data } = await api.get<HorarioColaborador[]>(`/rh/horarios/${colaboradorId}`);
    return data;
  },
  async setHorarios(colaboradorId: string, horarios: { dia_semana: number; hora_entrada: string; hora_saida: string }[]): Promise<HorarioColaborador[]> {
    const { data } = await api.patch<HorarioColaborador[]>(`/rh/horarios/${colaboradorId}`, horarios);
    return data;
  },
  async listPonto(colaboradorId?: string): Promise<RegistoPonto[]> {
    const { data } = await api.get<RegistoPonto[]>("/rh/ponto", { params: { colaborador_id: colaboradorId } });
    return data;
  },
  async registarPonto(dto: { colaborador_id: string; tipo: "entrada" | "saida" }): Promise<RegistoPonto> {
    const { data } = await api.post<RegistoPonto>("/rh/ponto", dto);
    return data;
  },
  async listFaltas(colaboradorId?: string): Promise<Falta[]> {
    const { data } = await api.get<Falta[]>("/rh/faltas", { params: { colaborador_id: colaboradorId } });
    return data;
  },
  async createFalta(dto: { colaborador_id: string; data: string; tipo: string; motivo?: string }): Promise<Falta> {
    const { data } = await api.post<Falta>("/rh/faltas", dto);
    return data;
  },
  async listFerias(params?: { colaborador_id?: string; estado?: string }): Promise<Ferias[]> {
    const { data } = await api.get<Ferias[]>("/rh/ferias", { params });
    return data;
  },
  async createFerias(dto: { colaborador_id: string; data_inicio: string; data_fim: string; dias: number }): Promise<Ferias> {
    const { data } = await api.post<Ferias>("/rh/ferias", dto);
    return data;
  },
  async aprovarFerias(id: string): Promise<Ferias> {
    const { data } = await api.post<Ferias>(`/rh/ferias/${id}/aprovar`);
    return data;
  },
  async rejeitarFerias(id: string, motivo: string): Promise<Ferias> {
    const { data } = await api.post<Ferias>(`/rh/ferias/${id}/rejeitar`, { motivo });
    return data;
  },
  async listHorasExtra(colaboradorId?: string): Promise<HoraExtra[]> {
    const { data } = await api.get<HoraExtra[]>("/rh/horas-extra", { params: { colaborador_id: colaboradorId } });
    return data;
  },
  async createHoraExtra(dto: { colaborador_id: string; data: string; horas: number; tipo?: string }): Promise<HoraExtra> {
    const { data } = await api.post<HoraExtra>("/rh/horas-extra", dto);
    return data;
  },
  async aprovarHoraExtra(id: string): Promise<HoraExtra> {
    const { data } = await api.post<HoraExtra>(`/rh/horas-extra/${id}/aprovar`);
    return data;
  },
  async indicadorAssiduidade(colaboradorId?: string): Promise<{ colaborador_id: string; nome: string; faltas_registadas: number }[]> {
    const { data } = await api.get("/rh/indicadores/assiduidade", { params: { colaborador_id: colaboradorId } });
    return data;
  },
};

export const rhAvaliacaoService = {
  async listObjetivos(colaboradorId?: string): Promise<ObjetivoRH[]> {
    const { data } = await api.get<ObjetivoRH[]>("/rh/avaliacao/objetivos", { params: { colaborador_id: colaboradorId } });
    return data;
  },
  async createObjetivo(dto: { colaborador_id: string; periodo: string; descricao: string; meta?: string }): Promise<ObjetivoRH> {
    const { data } = await api.post<ObjetivoRH>("/rh/avaliacao/objetivos", dto);
    return data;
  },
  async updateObjetivo(id: string, dto: { progresso_pct?: number; estado?: string }): Promise<ObjetivoRH> {
    const { data } = await api.patch<ObjetivoRH>(`/rh/avaliacao/objetivos/${id}`, dto);
    return data;
  },
  async listCompetencias(): Promise<Competencia[]> {
    const { data } = await api.get<Competencia[]>("/rh/avaliacao/competencias");
    return data;
  },
  async createCompetencia(dto: { nome: string; descricao?: string }): Promise<Competencia> {
    const { data } = await api.post<Competencia>("/rh/avaliacao/competencias", dto);
    return data;
  },
  async listAvaliacoes(colaboradorId?: string): Promise<AvaliacaoRH[]> {
    const { data } = await api.get<AvaliacaoRH[]>("/rh/avaliacao/avaliacoes", { params: { colaborador_id: colaboradorId } });
    return data;
  },
  async createAvaliacao(dto: { colaborador_id: string; periodo: string; nota_geral: number; pontos_fortes?: string; pontos_melhorar?: string }): Promise<AvaliacaoRH> {
    const { data } = await api.post<AvaliacaoRH>("/rh/avaliacao/avaliacoes", dto);
    return data;
  },
  async listFormacoes(colaboradorId?: string): Promise<Formacao[]> {
    const { data } = await api.get<Formacao[]>("/rh/avaliacao/formacoes", { params: { colaborador_id: colaboradorId } });
    return data;
  },
  async createFormacao(dto: { colaborador_id: string; nome: string; instituicao?: string }): Promise<Formacao> {
    const { data } = await api.post<Formacao>("/rh/avaliacao/formacoes", dto);
    return data;
  },
  async indicadorProdutividade(colaboradorId?: string): Promise<{ media_progresso_pct: number; n_objetivos: number }> {
    const { data } = await api.get("/rh/avaliacao/indicadores/produtividade", { params: { colaborador_id: colaboradorId } });
    return data;
  },
};

export const rhPayrollService = {
  async listSubsidios(colaboradorId?: string): Promise<Subsidio[]> {
    const { data } = await api.get<Subsidio[]>("/rh/payroll/subsidios", { params: { colaborador_id: colaboradorId } });
    return data;
  },
  async createSubsidio(dto: { colaborador_id: string; tipo: string; valor: number; recorrente?: boolean }): Promise<Subsidio> {
    const { data } = await api.post<Subsidio>("/rh/payroll/subsidios", dto);
    return data;
  },
  async listDescontos(colaboradorId?: string): Promise<DescontoRH[]> {
    const { data } = await api.get<DescontoRH[]>("/rh/payroll/descontos", { params: { colaborador_id: colaboradorId } });
    return data;
  },
  async createDesconto(dto: { colaborador_id: string; tipo: string; valor: number; referente_periodo: string }): Promise<DescontoRH> {
    const { data } = await api.post<DescontoRH>("/rh/payroll/descontos", dto);
    return data;
  },
  async listFolhas(): Promise<FolhaPagamento[]> {
    const { data } = await api.get<FolhaPagamento[]>("/rh/payroll/folhas");
    return data;
  },
  async createFolha(periodo: string): Promise<FolhaPagamento> {
    const { data } = await api.post<FolhaPagamento>("/rh/payroll/folhas", { periodo });
    return data;
  },
  async processarFolha(periodo: string): Promise<ReciboSalario[]> {
    const { data } = await api.post<ReciboSalario[]>(`/rh/payroll/folhas/${periodo}/processar`);
    return data;
  },
  async getRecibos(periodo: string): Promise<ReciboSalario[]> {
    const { data } = await api.get<ReciboSalario[]>(`/rh/payroll/folhas/${periodo}/recibos`);
    return data;
  },
};
