import api from "./api";

export interface DashboardAgua {
  agua_disponivel_litros: number;
  agua_consumida_hoje_litros: number;
  agua_consumida_mes_litros: number;
  custo_total_agua: number;
  custo_medio_por_litro: number;
  custo_por_lavagem: number;
  eficiencia_hidrica_litros_por_lavagem: number;
  percentual_reutilizacao: number;
  numero_abastecimentos: number;
  valor_gasto_abastecimentos: number;
}

export interface EvolucaoCustosAgua { meses: { mes: string; custo_total: number }[]; }
export interface ConsumoPorServico { itens: { tipo_lavagem_id: string | null; tipo_lavagem_nome: string; litros: number; n_lavagens: number }[]; }
export interface RankingFornecedoresAgua {
  fornecedores: { fornecedor_id: string; fornecedor_nome: string; quantidade_total_litros: number; faturacao_total: number; preco_medio_litro: number; n_abastecimentos: number }[];
}
export interface RankingFiliaisAgua { filiais: { filial_id: string; filial_nome: string; consumo_total_litros: number }[]; }

export const biAguaService = {
  async dashboard(): Promise<DashboardAgua> {
    const { data } = await api.get<DashboardAgua>("/bi/agua/dashboard");
    return data;
  },
  async evolucaoCustos(meses = 6): Promise<EvolucaoCustosAgua> {
    const { data } = await api.get<EvolucaoCustosAgua>("/bi/agua/evolucao-custos", { params: { meses } });
    return data;
  },
  async consumoPorServico(): Promise<ConsumoPorServico> {
    const { data } = await api.get<ConsumoPorServico>("/bi/agua/consumo-por-servico");
    return data;
  },
  async rankingFornecedores(): Promise<RankingFornecedoresAgua> {
    const { data } = await api.get<RankingFornecedoresAgua>("/bi/agua/ranking-fornecedores");
    return data;
  },
  async rankingFiliais(): Promise<RankingFiliaisAgua> {
    const { data } = await api.get<RankingFiliaisAgua>("/bi/agua/ranking-filiais");
    return data;
  },
};
