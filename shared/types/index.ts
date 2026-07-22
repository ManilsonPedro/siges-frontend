export interface User {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superadmin?: boolean;
  must_change_password?: boolean;
  grupo_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Fornecedor {
  id: string;
  company_id: string;
  nome: string;
  nif: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  estado: "ativo" | "inativo" | "suspenso";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  cliente_id?: string | null;
}

export interface Cliente {
  id: string;
  company_id: string;
  nome: string;
  nif: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  estado: "ativo" | "inativo" | "suspenso";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  fornecedor_id?: string | null;
}

export interface Conceito {
  id: string;
  company_id: string;
  nome: string;
  descricao?: string;
  estado: "ativo" | "inativo";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Fundo {
  id: string;
  company_id: string;
  tipo: string;
  data: string;
  descricao?: string;
  valor_disponivel: number;
  acumulado: number;
  saldo_atual: number;
  total_entradas: number;
  total_saidas: number;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export interface FundoSet {
  bcs: Fundo;
  bfa: Fundo;
}

export interface Movimento {
  id: string;
  company_id: string;
  codigo?: string;
  data: string;
  fornecedor_id?: string | null;
  cliente_id?: string | null;
  conceito_id: string;
  fatura_proforma?: string;
  valor: number;
  fatura_recibo?: string;
  comprovativo_pagamento?: string;
  observacoes?: string;
  tipo_movimento: "entrada" | "saida";
  estado_pagamento: "pendente" | "pago" | "pago_parcial" | "pago_total" | "cancelado" | "devolvido";
  estado_movimento: "criado" | "pendente" | "fechado";
  fundo_tipo: "BCS" | "BFA";
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MovimentoHistorico {
  id: string;
  movimento_id: string;
  campo: string;
  valor_anterior?: string;
  valor_novo?: string;
  user_name: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface MetricWithDelta {
  valor: number;
  delta: number | null;
  pct: number | null;
}

interface FundoTotals {
  valor_disponivel: number;
  acumulado: number;
  saldo_atual: number;
}

export interface DashboardData {
  fundo: FundoTotals & {
    bcs: FundoTotals;
    bfa: FundoTotals;
  };
  periodo: {
    data_inicio: string | null;
    data_fim: string | null;
  };
  movimentos: {
    total_gastos: MetricWithDelta;
    total_gastos_bcs: MetricWithDelta;
    total_gastos_bfa: MetricWithDelta;
    total_entradas: MetricWithDelta;
    total_entradas_bcs: MetricWithDelta;
    total_entradas_bfa: MetricWithDelta;
    valor_pendentes: MetricWithDelta;
    valor_pendentes_bcs: MetricWithDelta;
    valor_pendentes_bfa: MetricWithDelta;
    total_saidas_pagas: number;
    count_pendentes: number;
    count_pagos: number;
  };
  fornecedores: number;
  conceitos: number;
}

export interface AuditEntry {
  id: string;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  user_name: string;
  user_email: string;
  dados_anteriores: Record<string, unknown> | null;
  dados_novos: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
}

export interface MovimentoFilters {
  page?: number;
  page_size?: number;
  fornecedor_id?: string;
  conceito_id?: string;
  tipo_movimento?: string;
  estado_pagamento?: string;
  estado_movimento?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface CreateFornecedorDTO {
  nome: string;
  nif: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  estado: string;
}

export interface CreateClienteDTO {
  nome: string;
  nif: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  estado: string;
}

export interface CreateConceitoDTO {
  nome: string;
  descricao?: string;
  estado: string;
}

export interface ProdutoCategoria {
  id: string;
  company_id: string;
  nome: string;
  ordem: number;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: string;
  company_id: string;
  sku: string;
  nome: string;
  marca?: string | null;
  categoria_id?: string | null;
  unidade_medida: "L" | "kg" | "m3" | "un" | "cx";
  preco_base: string | number;
  iva_pct: string | number;
  descricao?: string | null;
  activo: boolean;
  ref_primavera?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProdutoDTO {
  sku: string;
  nome: string;
  marca?: string;
  categoria_id?: string | null;
  unidade_medida: "L" | "kg" | "m3" | "un" | "cx";
  preco_base: number;
  iva_pct: number;
  descricao?: string;
  activo: boolean;
}

export interface CreateProdutoCategoriaDTO {
  nome: string;
  ordem?: number;
  estado?: "ativo" | "inativo";
}

// ─── F2 — Estoque ──────────────────────────────────────────────
export interface Armazem {
  id: string;
  company_id: string;
  codigo: string;
  nome: string;
  morada?: string | null;
  activo: boolean;
  ref_primavera?: string | null;
  created_at: string;
  updated_at: string;
}
export interface CreateArmazemDTO {
  codigo: string;
  nome: string;
  morada?: string;
  activo?: boolean;
}
export interface StockSaldo {
  produto_id: string;
  produto_sku: string;
  produto_nome: string;
  armazem_id: string;
  armazem_codigo: string;
  armazem_nome: string;
  qtd_actual: number;
  qtd_reservada: number;
  qtd_disponivel: number;
  stock_minimo: number;
  abaixo_minimo: boolean;
}
export interface StockMovimento {
  id: string;
  produto_id: string;
  armazem_origem_id?: string | null;
  armazem_destino_id?: string | null;
  tipo: string;
  quantidade: number;
  custo_unitario?: number | null;
  documento_ref_tipo?: string | null;
  documento_ref_id?: string | null;
  motivo?: string | null;
  estornado_de?: string | null;
  created_by?: string | null;
  created_at: string;
}
export interface Localizacao {
  id: string;
  company_id: string;
  armazem_id: string;
  codigo: string;
  corredor?: string | null;
  prateleira?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
export interface CreateLocalizacaoDTO {
  armazem_id: string;
  codigo: string;
  corredor?: string;
  prateleira?: string;
  activo?: boolean;
}
export interface Inventario {
  id: string;
  company_id: string;
  armazem_id: string;
  data_inicio?: string | null;
  data_fim?: string | null;
  estado: "rascunho" | "em_curso" | "concluido";
  responsavel_id?: string | null;
  created_at: string;
}
export interface InventarioLinha {
  id: string;
  inventario_id: string;
  produto_id: string;
  localizacao_id?: string | null;
  quantidade_sistema: number;
  quantidade_contada?: number | null;
  divergencia?: number | null;
  contado_em?: string | null;
}

// ─── Compras (Supply Chain) ───────────────────────────────────────
export type EstadoRequisicao = "rascunho" | "submetida" | "aprovada" | "rejeitada" | "convertida_pedido";

export interface RequisicaoLinha {
  id: string;
  produto_id?: string | null;
  descricao_livre?: string | null;
  quantidade: number;
}
export interface RequisicaoLinhaInDTO {
  produto_id?: string;
  descricao_livre?: string;
  quantidade: number;
}
export interface Requisicao {
  id: string;
  company_id: string;
  solicitante_id: string;
  departamento?: string | null;
  data: string;
  justificativa?: string | null;
  estado: EstadoRequisicao;
  motivo_rejeicao?: string | null;
  linhas: RequisicaoLinha[];
  created_at: string;
}
export interface CreateRequisicaoDTO {
  departamento?: string;
  justificativa?: string;
  linhas: RequisicaoLinhaInDTO[];
}
export interface ConverterPedidoDTO {
  fornecedor_id: string;
  numero: string;
  precos_unitarios: Record<string, number>;
}

export type EstadoPedidoCompra = "enviado" | "confirmado" | "parcialmente_recebido" | "recebido" | "cancelado";

export interface PedidoCompraLinha {
  id: string;
  produto_id: string;
  quantidade: number;
  quantidade_recebida: number;
  preco_unitario: number;
}
export interface PedidoCompra {
  id: string;
  company_id: string;
  requisicao_id?: string | null;
  fornecedor_id: string;
  numero: string;
  data: string;
  estado: EstadoPedidoCompra;
  total: number;
  ref_externa?: string | null;
  linhas: PedidoCompraLinha[];
  created_at: string;
}

export interface RecepcaoLinha {
  id: string;
  pedido_linha_id: string;
  produto_id: string;
  quantidade_esperada: number;
  quantidade_recebida: number;
}
export interface Recepcao {
  id: string;
  company_id: string;
  pedido_id: string;
  armazem_id: string;
  data: string;
  estado: "rascunho" | "confirmada";
  linhas: RecepcaoLinha[];
  created_at: string;
}
export interface CreateRecepcaoDTO {
  pedido_id: string;
  armazem_id: string;
  linhas: { pedido_linha_id: string; quantidade_recebida: number }[];
}

export interface ContratoFornecedor {
  id: string;
  fornecedor_id: string;
  tipo?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  condicoes_pagamento?: string | null;
  arquivo_url?: string | null;
  created_at: string;
}
export interface CreateContratoDTO {
  tipo?: string;
  data_inicio: string;
  data_fim?: string;
  condicoes_pagamento?: string;
  arquivo_url?: string;
}
export interface AvaliacaoFornecedor {
  id: string;
  fornecedor_id: string;
  periodo: string;
  nota_prazo: number;
  nota_qualidade: number;
  nota_preco: number;
  observacoes?: string | null;
  avaliado_por?: string | null;
  created_at: string;
}
export interface CreateAvaliacaoDTO {
  periodo: string;
  nota_prazo: number;
  nota_qualidade: number;
  nota_preco: number;
  observacoes?: string;
}

// ─── Loja / Promoções (Comércio) ──────────────────────────────────
export interface Promocao {
  id: string;
  company_id: string;
  produto_id?: string | null;
  categoria_id?: string | null;
  tipo: "percentual" | "valor_fixo";
  valor: number;
  data_inicio: string;
  data_fim: string;
  activo: boolean;
  created_at: string;
}
export interface CreatePromocaoDTO {
  produto_id?: string;
  categoria_id?: string;
  tipo: "percentual" | "valor_fixo";
  valor: number;
  data_inicio: string;
  data_fim: string;
  activo?: boolean;
}

// ─── Devoluções (Comércio / POS) ──────────────────────────────────
export interface DevolucaoLinhaInDTO {
  produto_id: string;
  quantidade: number;
  motivo: "normal" | "danificado";
}
export interface CreateDevolucaoDTO {
  venda_id: string;
  linhas: DevolucaoLinhaInDTO[];
  forma_devolucao: "numerario" | "credito_cliente" | "troca";
}
export interface Devolucao {
  id: string;
  company_id: string;
  venda_id: string;
  valor_devolvido: number;
  forma_devolucao: string;
  data: string;
  linhas: { id: string; produto_id: string; quantidade: number; motivo: string }[];
}

// ─── E-Commerce (Comércio) ─────────────────────────────────────────
export interface LojaOnlineConfig {
  id: string;
  company_id: string;
  dominio?: string | null;
  tema: string;
  activo: boolean;
  metodos_entrega: string[];
  moeda: string;
  updated_at: string;
}
export interface Cupao {
  id: string;
  company_id: string;
  codigo: string;
  tipo: "percentual" | "valor_fixo";
  valor: number;
  validade: string;
  uso_maximo: number;
  uso_atual: number;
  activo: boolean;
  created_at: string;
}
export interface CreateCupaoDTO {
  codigo: string;
  tipo: "percentual" | "valor_fixo";
  valor: number;
  validade: string;
  uso_maximo?: number;
  activo?: boolean;
}
export type EstadoPedidoOnline = "pendente_pagamento" | "pago" | "em_preparacao" | "pronto" | "em_entrega" | "concluido" | "cancelado";
export interface PedidoOnlineLinha {
  id: string;
  produto_id: string;
  sku_snapshot: string;
  nome_snapshot: string;
  quantidade: number;
  preco_unitario: number;
}
export interface PedidoOnline {
  id: string;
  company_id: string;
  cliente_id?: string | null;
  numero: string;
  subtotal: number;
  desconto_cupao: number;
  total: number;
  metodo_entrega: "delivery" | "click_collect";
  endereco_entrega?: string | null;
  estado: EstadoPedidoOnline;
  venda_id?: string | null;
  linhas: PedidoOnlineLinha[];
  created_at: string;
}
export interface CheckoutDTO {
  cliente_id?: string;
  armazem_id: string;
  linhas: { produto_id: string; quantidade: number }[];
  metodo_entrega: "delivery" | "click_collect";
  endereco_entrega?: string;
  cupao_codigo?: string;
}
export interface EntradaDTO {
  produto_id: string;
  armazem_id: string;
  quantidade: number;
  custo_unitario?: number;
  tipo?: "entrada_compra" | "entrada_producao" | "entrada_ajuste";
  motivo?: string;
}
export interface SaidaDTO {
  produto_id: string;
  armazem_id: string;
  quantidade: number;
  tipo?: "saida_perda" | "saida_ajuste";
  motivo?: string;
}
export interface TransferenciaDTO {
  produto_id: string;
  armazem_origem_id: string;
  armazem_destino_id: string;
  quantidade: number;
  motivo?: string;
}

// ─── F4 — Caixa / Vendas ───────────────────────────────────────
export interface CaixaSessao {
  id: string;
  company_id: string;
  utilizador_id: string;
  armazem_id: string;
  abertura_em: string;
  fundo_inicial: number;
  fecho_em?: string | null;
  fundo_apurado?: number | null;
  fundo_contado?: number | null;
  diferenca?: number | null;
  observacao?: string | null;
  estado: "aberta" | "fechada";
}
export interface VendaLinha {
  id: string;
  produto_id: string;
  sku_snapshot: string;
  nome_snapshot: string;
  quantidade: number;
  preco_unitario: number;
  iva_pct: number;
  desconto_pct: number;
  subtotal: number;
}
export interface VendaPagamento {
  id: string;
  forma: "numerario" | "tpa" | "transferencia" | "cheque";
  valor: number;
  ref_externa?: string | null;
  data: string;
}
export interface Venda {
  id: string;
  company_id: string;
  sessao_id?: string | null;
  cliente_id?: string | null;
  armazem_id: string;
  numero_proforma?: string | null;
  data: string;
  total_bruto: number;
  total_desconto: number;
  total_iva: number;
  total_liquido: number;
  estado: "rascunho" | "concluida" | "anulada";
  correlation_id: string;
  ref_primavera?: string | null;
  observacao?: string | null;
  linhas: VendaLinha[];
  pagamentos: VendaPagamento[];
}
export interface LinhaCreateDTO {
  produto_id: string;
  quantidade: number;
  preco_unitario?: number;
  iva_pct?: number;
  desconto_pct?: number;
}
export interface VendaCreateDTO {
  sessao_id?: string;
  cliente_id?: string;
  armazem_id: string;
  linhas?: LinhaCreateDTO[];
  observacao?: string;
}
export interface PagamentoCreateDTO {
  forma: "numerario" | "tpa" | "transferencia" | "cheque";
  valor: number;
  ref_externa?: string;
}

export interface CreateMovimentoDTO {
  data: string;
  fornecedor_id?: string | null;
  cliente_id?: string | null;
  conceito_id: string;
  valor: number;
  tipo_movimento: string;
  fundo_tipo: string;
  estado_pagamento?: string;
  fatura_proforma?: string;
  fatura_recibo?: string;
  observacoes?: string;
}

export interface UpdateFundoDTO {
  tipo: "BCS" | "BFA";
  valor_disponivel: number;
  observacao?: string;
  origem?: string;
}

export interface FundoReportEntry {
  tipo: "BCS" | "BFA";
  valor_disponivel: number;
  acumulado: number;
  saldo_atual: number;
  total_entradas?: number;
  total_saidas?: number;
  periodo: {
    entradas: number;
    saidas: number;
    saidas_pagas: number;
    saidas_pendentes: number;
    qtd_entradas: number;
    qtd_saidas: number;
    carregamentos_qtd: number;
    carregamentos_total: number;
  };
}

export interface FundoReport {
  periodo: {
    data_inicio: string | null;
    data_fim: string | null;
  };
  bcs: FundoReportEntry;
  bfa: FundoReportEntry;
}

export interface FundoCarregamento {
  id: string;
  valor_anterior: number;
  valor_novo: number;
  observacao?: string;
  origem?: string | null;
  user_name: string;
  fundo_tipo: "BCS" | "BFA";
  created_at: string;
}

export interface CreateUserDTO {
  email: string;
  full_name: string;
  password?: string;
}

export interface UpdateUserDTO {
  email?: string;
  full_name?: string;
  is_active?: boolean;
}

// ══════════════════════════════════════════════════════════════════
// Operações
// ══════════════════════════════════════════════════════════════════
export interface AreaServico {
  id: string; company_id: string; filial_id?: string | null;
  nome: string; tipo: "bomba" | "lavagem" | "loja" | "restauracao"; activo: boolean; created_at: string;
}
export interface Equipamento {
  id: string; company_id: string; area_servico_id?: string | null;
  nome: string; tipo: "bomba_combustivel" | "maquina_lavagem" | "outro"; estado: string;
  ultima_manutencao?: string | null; proxima_manutencao_prevista?: string | null; created_at: string;
}
export interface TurnoOperacional { id: string; company_id: string; nome: string; hora_inicio: string; hora_fim: string; }

export interface TanqueCombustivel {
  id: string; company_id: string; codigo: string;
  tipo_combustivel: "gasolina" | "gasoleo" | "gpl" | "outro";
  capacidade_litros: number; nivel_atual_litros: number; nivel_minimo_litros: number;
  nivel_reordenamento_litros: number; activo: boolean;
}
export interface Bomba { id: string; company_id: string; area_servico_id?: string | null; codigo: string; tanque_id: string; estado: string; }
export interface Bico { id: string; bomba_id: string; codigo: string; tipo_combustivel: string; }
export interface Abastecimento {
  id: string; company_id: string; bico_id: string; tanque_id: string; tipo_combustivel: string;
  volume_litros: number; preco_unitario: number; total: number; forma_pagamento: string; created_at: string;
}

export interface TipoLavagem {
  id: string; company_id: string; codigo: string; nome: string; descricao?: string | null;
  preco_base: number; duracao_estimada_minutos: number; agua_estimada_litros: number; activo: boolean;
}
export interface BoxLavagem { id: string; company_id: string; codigo: string; nome: string; estado: string; capacidade: number; }
export interface SlotLavagem { id: string; box_id: string; data_hora_inicio: string; data_hora_fim: string; estado: string; preco_override?: number | null; }
export interface OrdemLavagem {
  id: string; company_id: string; cliente_id?: string | null; viatura_id?: string | null;
  tipo_lavagem_id: string; box_id?: string | null; slot_id?: string | null; estado: string;
  agua_consumida_litros?: number | null; re_lavagem_de_id?: string | null; created_at: string;
}

export interface TanqueAgua {
  id: string; company_id: string; codigo: string; nome: string;
  tipo: "limpa" | "reciclada" | "tratada" | "pluvial";
  capacidade_litros: number; nivel_atual_litros: number; nivel_minimo_litros: number;
  ph?: number | null; turbidez?: number | null; condutividade?: number | null;
  tem_sensor: boolean; sensor_id?: string | null;
}
export interface ConsumoAgua {
  id: string; company_id: string; tanque_agua_id: string; litros_consumidos: number;
  tipo: "lavagem" | "limpeza" | "outro"; custo_por_litro?: number | null; custo_total?: number | null; data: string;
}

// ══════════════════════════════════════════════════════════════════
// Restauração
// ══════════════════════════════════════════════════════════════════
export interface Mesa {
  id: string; company_id: string; area_servico_id?: string | null;
  numero: string; capacidade: number; estado: "livre" | "ocupada" | "reservada" | "limpeza";
}
export interface ItemMenu {
  id: string; company_id: string; tipo_negocio: "bar" | "restaurante" | "churrasqueira";
  nome: string; descricao?: string | null; preco: number; categoria?: string | null; activo: boolean;
  ingredientes: { produto_id: string; quantidade: number }[];
}
export interface ComandaLinha {
  id: string; item_id: string; nome_snapshot: string; preco_snapshot: number;
  quantidade: number; observacoes?: string | null; estado: string;
}
export interface Comanda {
  id: string; company_id: string; mesa_id?: string | null; cliente_id?: string | null;
  aberta_em: string; fechada_em?: string | null; estado: string; venda_id?: string | null; linhas: ComandaLinha[];
}
export interface ReservaMesa {
  id: string; company_id: string; mesa_id?: string | null; cliente_id?: string | null;
  nome_cliente?: string | null; data_hora: string; numero_pessoas: number; estado: string;
}
export interface HappyHour {
  id: string; company_id: string; dia_semana: number; hora_inicio: string; hora_fim: string;
  desconto_pct: number; itens_aplicaveis: string[];
}
export interface Combo { id: string; company_id: string; nome: string; itens: { item_menu_id: string; quantidade: number }[]; preco_combo: number; activo: boolean; }
export interface PedidoProducao {
  id: string; company_id: string; comanda_linha_id?: string | null; estado: string;
  estacao_producao?: string | null; tempo_estimado_minutos?: number | null; criado_em: string;
}

// ══════════════════════════════════════════════════════════════════
// Gestão Comercial (CRM / Marketing / Atendimento)
// ══════════════════════════════════════════════════════════════════
export interface Lead {
  id: string; company_id: string; nome: string; empresa?: string | null; telefone?: string | null;
  email?: string | null; origem: string; estado: "novo" | "qualificado" | "descartado" | "convertido";
  responsavel_id?: string | null; created_at: string;
}
export interface EtapaPipeline { id: string; company_id: string; nome: string; ordem: number; cor?: string | null; }
export interface Oportunidade {
  id: string; company_id: string; lead_id?: string | null; cliente_id?: string | null; titulo: string;
  valor_estimado: number; probabilidade_pct: number; etapa_pipeline_id: string; responsavel_id?: string | null;
  data_fecho_prevista?: string | null; estado: "aberta" | "ganha" | "perdida"; motivo_perda?: string | null; created_at: string;
}
export interface Viatura { id: string; company_id: string; cliente_id: string; matricula: string; marca?: string | null; modelo?: string | null; cor?: string | null; vin?: string | null; }
export interface Visita {
  id: string; company_id: string; oportunidade_id?: string | null; cliente_id?: string | null;
  data_hora: string; tipo: "presencial" | "remota"; responsavel_id?: string | null; notas?: string | null; estado: string;
}
export interface TarefaCRM {
  id: string; company_id: string; titulo: string; descricao?: string | null; tipo: string;
  responsavel_id?: string | null; relacionado_tipo?: string | null; relacionado_id?: string | null;
  prazo?: string | null; estado: "pendente" | "concluida"; prioridade: "baixa" | "media" | "alta"; created_at: string;
}
export interface SegmentoCliente { id: string; company_id: string; nome: string; criterios: Record<string, any>; }
export interface Campanha {
  id: string; company_id: string; nome: string; tipo: "sms" | "whatsapp" | "email" | "promocao";
  segmento_id?: string | null; conteudo: string; data_agendada?: string | null; estado: string;
  enviados_count: number; entregues_count: number; created_at: string;
}
export interface Reclamacao {
  id: string; company_id: string; cliente_id?: string | null; assunto: string; descricao: string;
  canal: string; gravidade: string; estado: string; responsavel_id?: string | null;
  data_abertura: string; data_resolucao?: string | null;
}
export interface Sugestao { id: string; company_id: string; cliente_id?: string | null; descricao: string; estado: string; created_at: string; }
export interface TicketAtendimento {
  id: string; company_id: string; cliente_id?: string | null; assunto: string; descricao: string;
  prioridade: string; estado: string; responsavel_id?: string | null; created_at: string;
}

// ══════════════════════════════════════════════════════════════════
// Gestão Financeira
// ══════════════════════════════════════════════════════════════════
export interface TransferenciaFundo {
  id: string; company_id: string; fundo_origem_tipo: string; fundo_destino_tipo: string;
  valor: number; data: string; motivo?: string | null;
}
export interface CentroCusto { id: string; company_id: string; codigo: string; nome: string; activo: boolean; }
export interface AprovacaoFinanceira {
  id: string; company_id: string; movimento_id: string; valor: number; solicitante_id: string;
  aprovador_id?: string | null; estado: "pendente" | "aprovado" | "rejeitado"; motivo_rejeicao?: string | null;
  data_decisao?: string | null; created_at: string;
}
export interface ContaReceber {
  id: string; company_id: string; cliente_id: string; origem_tipo: string; origem_id?: string | null;
  valor: number; data_vencimento: string; data_recebimento?: string | null; estado: string; movimento_id?: string | null;
}
export interface ContaPagar {
  id: string; company_id: string; fornecedor_id: string; origem_tipo: string; origem_id?: string | null;
  valor: number; data_vencimento: string; data_pagamento?: string | null; estado: string; movimento_id?: string | null;
}
export interface PlanoContas { id: string; company_id: string; codigo: string; nome: string; classe: number; tipo: "analitica" | "sintetica"; conta_pai_id?: string | null; }
export interface TaxaImposto { id: string; company_id: string; nome: string; percentagem: number; tipo: string; padrao: boolean; activo: boolean; }
export interface ObrigacaoFiscal { id: string; company_id: string; nome: string; prazo: string; recorrencia?: string | null; estado: "pendente" | "cumprida"; }

// ══════════════════════════════════════════════════════════════════
// Capital Humano
// ══════════════════════════════════════════════════════════════════
export interface Departamento { id: string; company_id: string; nome: string; responsavel_id?: string | null; }
export interface Colaborador {
  id: string; company_id: string; user_id?: string | null; nome: string; cargo?: string | null;
  departamento_id?: string | null; data_admissao: string; data_desligamento?: string | null;
  salario_base: number; estado: "ativo" | "ferias" | "licenca" | "desligado";
  superior_id?: string | null; telefone?: string | null; email_pessoal?: string | null;
}
export interface OrganogramaNode { id: string; nome: string; cargo?: string | null; subordinados: OrganogramaNode[]; }
export interface ContratoRH { id: string; colaborador_id: string; tipo: string; data_inicio: string; data_fim?: string | null; arquivo_url?: string | null; }
export interface HorarioColaborador { id: string; colaborador_id: string; dia_semana: number; hora_entrada: string; hora_saida: string; }
export interface RegistoPonto { id: string; colaborador_id: string; data_hora: string; tipo: "entrada" | "saida"; origem: string; }
export interface Falta { id: string; colaborador_id: string; data: string; tipo: "justificada" | "injustificada"; motivo?: string | null; }
export interface Ferias {
  id: string; colaborador_id: string; data_inicio: string; data_fim: string; dias: number;
  estado: "solicitada" | "aprovada" | "rejeitada" | "em_curso" | "concluida"; aprovador_id?: string | null; motivo_rejeicao?: string | null;
}
export interface HoraExtra { id: string; colaborador_id: string; data: string; horas: number; tipo: string; aprovado: boolean; }
export interface Subsidio { id: string; colaborador_id: string; tipo: string; valor: number; recorrente: boolean; }
export interface DescontoRH { id: string; colaborador_id: string; tipo: string; valor: number; referente_periodo: string; }
export interface FolhaPagamento { id: string; company_id: string; periodo: string; estado: "aberta" | "processada" | "paga"; data_processamento?: string | null; }
export interface ReciboSalario {
  id: string; folha_pagamento_id: string; colaborador_id: string; salario_base: number;
  total_subsidios: number; total_descontos: number; total_horas_extra: number; valor_liquido: number;
}
export interface ObjetivoRH { id: string; colaborador_id: string; periodo: string; descricao: string; meta?: string | null; progresso_pct: number; estado: string; }
export interface Competencia { id: string; company_id: string; nome: string; descricao?: string | null; }
export interface AvaliacaoRH {
  id: string; colaborador_id: string; periodo: string; avaliador_id?: string | null;
  nota_geral: number; pontos_fortes?: string | null; pontos_melhorar?: string | null; data: string;
}
export interface Formacao { id: string; colaborador_id: string; nome: string; instituicao?: string | null; data_inicio?: string | null; data_fim?: string | null; certificado_url?: string | null; }
