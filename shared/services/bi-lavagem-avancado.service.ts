import api from "./api";

export interface CelulaHeatmap { dia_semana: string; hora: number; n_checkins: number; }
export interface HeatmapMovimento { periodo_dias: number; celulas: CelulaHeatmap[]; }

export interface ClienteValor {
  cliente_id: string;
  cliente_nome: string;
  lifetime_value: number;
  n_lavagens: number;
  cliente_desde: string | null;
}
export interface ValorPorCliente { valor_medio_por_cliente: number; clientes: ClienteValor[]; }

export interface CrossSelling {
  clientes_com_lavagem: number;
  clientes_com_compra_cruzada: number;
  taxa_conversao_pct: number;
}

export const biLavagemAvancadoService = {
  async heatmapMovimento(dias = 30): Promise<HeatmapMovimento> {
    const { data } = await api.get<HeatmapMovimento>("/bi/lavagem/heatmap-movimento", { params: { dias } });
    return data;
  },
  async valorPorCliente(): Promise<ValorPorCliente> {
    const { data } = await api.get<ValorPorCliente>("/bi/lavagem/valor-por-cliente");
    return data;
  },
  async crossSelling(): Promise<CrossSelling> {
    const { data } = await api.get<CrossSelling>("/bi/lavagem/cross-selling");
    return data;
  },
};
