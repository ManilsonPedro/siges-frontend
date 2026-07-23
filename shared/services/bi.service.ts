import api from "./api";

export const biService = {
  async dashboardFinanceiro(): Promise<{ saldos_fundos: { tipo: string; saldo_atual: number }[]; movimentos_mes: { entradas: number; saidas: number; liquido: number } }> {
    const { data } = await api.get("/bi/dashboards/financeiro");
    return data;
  },
  async dashboardComercial(): Promise<{
    vendas_hoje: { total: number; n_vendas: number; ticket_medio: number };
    top_produtos: { produto_id: string; nome: string; n_vendas: number }[];
    pedidos_ecommerce_pendentes: number;
  }> {
    const { data } = await api.get("/bi/dashboards/comercial");
    return data;
  },
  async dashboardOperacional(): Promise<{
    ordens_lavagem_em_curso: number;
    lavagem_walkins_hoje: number;
    lavagem_reservas_hoje: number;
    lavagem_taxa_ocupacao_boxes_pct: number;
    lavagem_agua_por_categoria_litros: Record<string, number>;
    lavagem_hoje: number;
    lavagem_agendadas_hoje: number;
    lavagem_concluidas_hoje: number;
    lavagem_top_clientes: { cliente_id: string; cliente_nome: string; n_lavagens: number }[];
    lavagem_avaliacao_media: number;
    lavagem_cancelamentos_hoje: number;
    lavagem_taxa_retrabalho_pct: number;
    lavagem_top_extras: { extra_id: string; extra_nome: string; n_vendas: number }[];
  }> {
    const { data } = await api.get("/bi/dashboards/operacional");
    return data;
  },
  async dashboardRh(): Promise<{ colaboradores_ativos: number; ferias_em_curso: number; assiduidade_media_pct: number }> {
    const { data } = await api.get("/bi/dashboards/rh");
    return data;
  },
  async comparativo(params: { indicador: string; periodo_a_inicio: string; periodo_a_fim: string; periodo_b_inicio: string; periodo_b_fim: string }): Promise<any> {
    const { data } = await api.get("/bi/analytics/comparativo", { params });
    return data;
  },
};
