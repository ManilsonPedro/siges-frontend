import api from "./api";

/* ── Tipos ─────────────────────────────────────────────── */

export type TipoBalancete = "geral" | "analitico" | "centro_custo" | "projeto";
export type GrupoContaBalancete = "ativo" | "passivo" | "capital" | "rendimentos" | "gastos";

export interface LinhaBalancete {
  conta: string;           // "11", "11.01", "12.03"
  descricao: string;
  nivel: number;           // 1 = grupo, 2 = subconta, 3 = detalhe
  grupo: GrupoContaBalancete;
  saldo_inicial: number;
  debito: number;
  credito: number;
  saldo_final: number;
  tem_filhos: boolean;
}

export interface TotaisBalancete {
  ativo_total: number;
  passivo_total: number;
  capital_proprio: number;
  receitas: number;
  despesas: number;
  resultado_exercicio: number;
  total_debito: number;
  total_credito: number;
}

export interface Balancete {
  id: string;
  tipo: TipoBalancete;
  periodo_inicio: string;   // ISO date
  periodo_fim: string;
  empresa: string;
  filial?: string;
  centro_custo?: string;
  gerado_em: string;        // ISO datetime
  fonte: "primavera" | "snapshot";
  linhas: LinhaBalancete[];
  totais: TotaisBalancete;
}

export interface BalanceteFilters {
  tipo?: TipoBalancete;
  periodo_inicio?: string;
  periodo_fim?: string;
  empresa?: string;
  filial?: string;
  centro_custo?: string;
  apenas_com_movimento?: boolean;
  nivel_maximo?: number;
}

export interface SnapshotBalancete {
  id: string;
  periodo_inicio: string;
  periodo_fim: string;
  tipo: TipoBalancete;
  empresa: string;
  gerado_em: string;
  fonte: "primavera" | "snapshot";
  linhas_count: number;
}

/* ── Serviço ────────────────────────────────────────────── */

export const contabilidadeService = {
  /** Gera/carrega balancete com filtros (pode demorar — chama Primavera) */
  async getBalancete(filters: BalanceteFilters): Promise<Balancete> {
    const { data } = await api.get("/contabilidade/balancetes/atual", { params: filters });
    return data;
  },

  /** Lista snapshots históricos já gerados */
  async listarSnapshots(filters?: { tipo?: TipoBalancete; empresa?: string }): Promise<SnapshotBalancete[]> {
    const { data } = await api.get("/contabilidade/balancetes", { params: filters });
    return data;
  },

  /** Busca snapshot por ID */
  async getSnapshot(id: string): Promise<Balancete> {
    const { data } = await api.get(`/contabilidade/balancetes/${id}`);
    return data;
  },

  /** Força sincronização com Primavera e grava novo snapshot */
  async sincronizar(filters: BalanceteFilters): Promise<Balancete> {
    const { data } = await api.post("/contabilidade/balancetes/sincronizar", filters);
    return data;
  },

  /** Export Excel/PDF do balancete */
  async exportar(id: string, formato: "xlsx" | "pdf"): Promise<string> {
    const { data } = await api.get(`/contabilidade/balancetes/${id}/export`, {
      params: { formato },
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([data]));
    return url;
  },
};

/* ── Mock para desenvolvimento (sem backend) ────────────── */

export function mockBalancete(filters: BalanceteFilters): Balancete {
  const linhas: LinhaBalancete[] = [
    // 1 — ATIVO
    { conta: "1", descricao: "Ativo", nivel: 1, grupo: "ativo", saldo_inicial: 9000000, debito: 3200000, credito: 2800000, saldo_final: 9400000, tem_filhos: true },
    { conta: "11", descricao: "Caixa e Equivalentes", nivel: 2, grupo: "ativo", saldo_inicial: 1000000, debito: 500000, credito: 300000, saldo_final: 1200000, tem_filhos: true },
    { conta: "11.01", descricao: "Caixa Luanda", nivel: 3, grupo: "ativo", saldo_inicial: 600000, debito: 300000, credito: 200000, saldo_final: 700000, tem_filhos: false },
    { conta: "11.02", descricao: "Caixa Benguela", nivel: 3, grupo: "ativo", saldo_inicial: 400000, debito: 200000, credito: 100000, saldo_final: 500000, tem_filhos: false },
    { conta: "12", descricao: "Depósitos Bancários", nivel: 2, grupo: "ativo", saldo_inicial: 5000000, debito: 2000000, credito: 1500000, saldo_final: 5500000, tem_filhos: true },
    { conta: "12.01", descricao: "BAI - CC 001", nivel: 3, grupo: "ativo", saldo_inicial: 2000000, debito: 800000, credito: 600000, saldo_final: 2200000, tem_filhos: false },
    { conta: "12.02", descricao: "BFA - CC 002", nivel: 3, grupo: "ativo", saldo_inicial: 2000000, debito: 700000, credito: 500000, saldo_final: 2200000, tem_filhos: false },
    { conta: "12.03", descricao: "Atlantico - CC 003", nivel: 3, grupo: "ativo", saldo_inicial: 1000000, debito: 500000, credito: 400000, saldo_final: 1100000, tem_filhos: false },
    { conta: "13", descricao: "Clientes", nivel: 2, grupo: "ativo", saldo_inicial: 3000000, debito: 700000, credito: 1000000, saldo_final: 2700000, tem_filhos: false },
    // 2 — PASSIVO
    { conta: "2", descricao: "Passivo", nivel: 1, grupo: "passivo", saldo_inicial: 4500000, debito: 1000000, credito: 1200000, saldo_final: 4700000, tem_filhos: true },
    { conta: "21", descricao: "Fornecedores", nivel: 2, grupo: "passivo", saldo_inicial: 2500000, debito: 600000, credito: 700000, saldo_final: 2600000, tem_filhos: false },
    { conta: "22", descricao: "Empréstimos Bancários", nivel: 2, grupo: "passivo", saldo_inicial: 2000000, debito: 400000, credito: 500000, saldo_final: 2100000, tem_filhos: false },
    // 3 — CAPITAL PRÓPRIO
    { conta: "3", descricao: "Capital Próprio", nivel: 1, grupo: "capital", saldo_inicial: 4500000, debito: 0, credito: 0, saldo_final: 4500000, tem_filhos: true },
    { conta: "31", descricao: "Capital Social", nivel: 2, grupo: "capital", saldo_inicial: 3000000, debito: 0, credito: 0, saldo_final: 3000000, tem_filhos: false },
    { conta: "32", descricao: "Reservas", nivel: 2, grupo: "capital", saldo_inicial: 1500000, debito: 0, credito: 0, saldo_final: 1500000, tem_filhos: false },
    // 4 — RENDIMENTOS
    { conta: "4", descricao: "Rendimentos", nivel: 1, grupo: "rendimentos", saldo_inicial: 0, debito: 0, credito: 2800000, saldo_final: 2800000, tem_filhos: true },
    { conta: "41", descricao: "Vendas de Mercadorias", nivel: 2, grupo: "rendimentos", saldo_inicial: 0, debito: 0, credito: 2400000, saldo_final: 2400000, tem_filhos: false },
    { conta: "42", descricao: "Prestação de Serviços", nivel: 2, grupo: "rendimentos", saldo_inicial: 0, debito: 0, credito: 400000, saldo_final: 400000, tem_filhos: false },
    // 5 — GASTOS
    { conta: "5", descricao: "Gastos", nivel: 1, grupo: "gastos", saldo_inicial: 0, debito: 2200000, credito: 0, saldo_final: 2200000, tem_filhos: true },
    { conta: "51", descricao: "Custo das Mercadorias", nivel: 2, grupo: "gastos", saldo_inicial: 0, debito: 1200000, credito: 0, saldo_final: 1200000, tem_filhos: false },
    { conta: "52", descricao: "Gastos com Pessoal", nivel: 2, grupo: "gastos", saldo_inicial: 0, debito: 600000, credito: 0, saldo_final: 600000, tem_filhos: false },
    { conta: "53", descricao: "Gastos Administrativos", nivel: 2, grupo: "gastos", saldo_inicial: 0, debito: 400000, credito: 0, saldo_final: 400000, tem_filhos: false },
  ];

  const totais: TotaisBalancete = {
    ativo_total: 9400000,
    passivo_total: 4700000,
    capital_proprio: 4500000,
    receitas: 2800000,
    despesas: 2200000,
    resultado_exercicio: 600000,
    total_debito: linhas.reduce((s, l) => s + l.debito, 0),
    total_credito: linhas.reduce((s, l) => s + l.credito, 0),
  };

  return {
    id: "mock-001",
    tipo: filters.tipo ?? "geral",
    periodo_inicio: filters.periodo_inicio ?? "2026-01-01",
    periodo_fim: filters.periodo_fim ?? "2026-01-31",
    empresa: filters.empresa ?? "Aquasan",
    gerado_em: new Date().toISOString(),
    fonte: "primavera",
    linhas,
    totais,
  };
}
