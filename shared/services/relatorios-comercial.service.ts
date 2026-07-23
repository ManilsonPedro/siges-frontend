import api from "./api";

export interface VendaPorProduto {
  produto_id?: string | null;
  sku: string;
  nome: string;
  quantidade: number;
  total: number;
}
export interface VendaPorCliente {
  cliente_id?: string | null;
  cliente_nome: string;
  n_vendas: number;
  total: number;
}
export interface CompraPorFornecedor {
  fornecedor_id: string;
  fornecedor_nome: string;
  n_pedidos: number;
  total: number;
}
export interface CompraPorProduto {
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  total: number;
}

export const relatoriosComercialService = {
  async vendasPorProduto(params?: { data_de?: string; data_ate?: string }): Promise<VendaPorProduto[]> {
    const { data } = await api.get<VendaPorProduto[]>("/relatorios/vendas/por-produto", { params });
    return data;
  },
  async vendasPorCliente(params?: { data_de?: string; data_ate?: string }): Promise<VendaPorCliente[]> {
    const { data } = await api.get<VendaPorCliente[]>("/relatorios/vendas/por-cliente", { params });
    return data;
  },
  async comprasPorFornecedor(params?: { data_de?: string; data_ate?: string }): Promise<CompraPorFornecedor[]> {
    const { data } = await api.get<CompraPorFornecedor[]>("/relatorios/compras/por-fornecedor", { params });
    return data;
  },
  async comprasPorProduto(params?: { data_de?: string; data_ate?: string }): Promise<CompraPorProduto[]> {
    const { data } = await api.get<CompraPorProduto[]>("/relatorios/compras/por-produto", { params });
    return data;
  },
};
