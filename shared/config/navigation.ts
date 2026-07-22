/**
 * Configuração central de navegação enterprise — Financ-BI Jennos + Primavera ERP
 * Formato de permissão: dominio.recurso.acao
 * Itens marcados com primavera: true são sincronizados / lidos do Primavera ERP
 */

import {
  LayoutDashboard,
  Factory,
  Package,
  Handshake,
  Landmark,
  BarChart3,
  Users2,
  Settings2,
  type LucideIcon,
  ClipboardList,
  CalendarRange,
  Leaf,
  BadgeCheck,
  Boxes,
  Warehouse,
  ArrowLeftRight,
  AlertTriangle,
  UserRound,
  Building2,
  ShoppingCart,
  ShoppingBag,
  FileText,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RepeatIcon,
  CalendarClock,
  BookOpen,
  Tag,
  PieChart,
  UserCog,
  ScrollText,
  Plug,
  Trash2,
  Building,
  Truck,
  MapPin,
  Car,
  UserCheck,
  Package2,
  Scale,
  Receipt,
  BanknoteIcon,
  GitMerge,
  Target,
  PhoneCall,
  CalendarCheck,
  ClipboardCheck,
  BarChart2,
  TrendingDown as CostIcon,
  Globe,
  Webhook,
  Key,
  Network,
  FolderKanban,
  Briefcase,
  Clock,
  Award,
  DollarSign,
  BookMarked,
  Calculator,
  FileBarChart,
  Layers,
  Zap,
  Link2,
  Shield,
  FlaskConical,
  Beaker,
} from "lucide-react";

/* ── Tipos ─────────────────────────────────────────────── */

export interface NavLeaf {
  type: "leaf";
  key: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  permission?: string;
  isNew?: boolean;
  primavera?: boolean; // dado vem do / vai para Primavera ERP
  readOnly?: boolean;  // apenas leitura do Primavera
}

export interface NavSection {
  type: "section";
  key: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  primavera?: boolean;
  children: (NavLeaf | NavGroup)[];
}

export interface NavGroup {
  type: "group";
  key: string;
  label: string;
  icon?: LucideIcon;
  permission?: string;
  children: NavLeaf[];
}

export interface NavDivider {
  type: "divider";
  key: string;
}

export type NavItem = NavLeaf | NavSection | NavGroup | NavDivider;

/* ── Estrutura de navegação enterprise ─────────────────── */

export const NAV_CONFIG: NavItem[] = [

  // ═══════════════════════════════════════════════════════
  // 🏠 DASHBOARD
  // ═══════════════════════════════════════════════════════
  {
    type: "leaf",
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.ver",
  },

  { type: "divider", key: "div-1" },

  // ═══════════════════════════════════════════════════════
  // 🤝 COMERCIAL (integrado Primavera)
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "comercial",
    label: "Comercial",
    icon: Handshake,
    permission: "comercial.ver",
    children: [
      {
        type: "group",
        key: "com-clientes",
        label: "Clientes",
        icon: UserRound,
        children: [
          { type: "leaf", key: "cli-lista",        label: "Cadastro",          href: "/dashboard/clientes",                  permission: "clientes.listar",          primavera: true },
          { type: "leaf", key: "cli-historico",    label: "Histórico Comercial",href: "/dashboard/clientes/historico",        permission: "clientes.ver" },
          { type: "leaf", key: "cli-credito",      label: "Limite de Crédito", href: "/dashboard/clientes/credito",          permission: "clientes.ver",             primavera: true },
          { type: "leaf", key: "cli-conta",        label: "Conta Corrente",    href: "/dashboard/clientes/conta-corrente",   permission: "clientes.ver",             primavera: true },
        ],
      },
      {
        type: "group",
        key: "com-vendas",
        label: "Vendas",
        icon: ShoppingCart,
        children: [
          { type: "leaf", key: "vnd-orcamentos",   label: "Orçamentos",        href: "/dashboard/orcamentos",               permission: "orcamentos.ver" },
          { type: "leaf", key: "vnd-encomendas",   label: "Encomendas",        href: "/dashboard/vendas/encomendas",        permission: "caixa.ver" },
          { type: "leaf", key: "vnd-caixa",        label: "Caixa / PDV",       href: "/dashboard/caixa",                    permission: "caixa.ver" },
          { type: "leaf", key: "vnd-historico",    label: "Histórico",         href: "/dashboard/caixa/vendas",             permission: "caixa.ver" },
          { type: "leaf", key: "vnd-fiscalizacao", label: "Faturas Primavera", href: "/dashboard/caixa/fiscalizacao",       permission: "caixa.fiscalizacao.ver",   primavera: true },
          { type: "leaf", key: "vnd-cobrancas",    label: "Cobranças",         href: "/dashboard/vendas/cobrancas",         permission: "comercial.cobrancas.ver",  primavera: true },
          { type: "leaf", key: "vnd-devolucoes",   label: "Devoluções",        href: "/dashboard/caixa/devolucoes",         permission: "caixa.ver",                isNew: true },
        ],
      },
      {
        type: "group",
        key: "com-loja",
        label: "Loja",
        icon: ShoppingBag,
        children: [
          { type: "leaf", key: "loja-promocoes",   label: "Promoções",         href: "/dashboard/loja/promocoes",           permission: "loja.view",  isNew: true },
        ],
      },
      {
        type: "group",
        key: "com-ecommerce",
        label: "E-Commerce",
        icon: Globe,
        children: [
          { type: "leaf", key: "ecom-pedidos",     label: "Pedidos Online",    href: "/dashboard/ecommerce/pedidos",        permission: "ecommerce.view", isNew: true },
          { type: "leaf", key: "ecom-cupoes",      label: "Cupões",            href: "/dashboard/ecommerce/cupoes",         permission: "ecommerce.gerir_cupoes", isNew: true },
          { type: "leaf", key: "ecom-config",      label: "Configuração",      href: "/dashboard/ecommerce/config",         permission: "ecommerce.gerir_config", isNew: true },
        ],
      },
      {
        type: "group",
        key: "com-crm",
        label: "CRM",
        icon: Target,
        children: [
          { type: "leaf", key: "crm-leads",        label: "Leads",             href: "/dashboard/crm/leads",                permission: "crm.view",    isNew: true },
          { type: "leaf", key: "crm-oportunidades",label: "Oportunidades",     href: "/dashboard/crm/oportunidades",        permission: "crm.view",    isNew: true },
          { type: "leaf", key: "crm-pipeline",     label: "Pipeline",          href: "/dashboard/crm/pipeline",             permission: "crm.view",    isNew: true },
          { type: "leaf", key: "crm-visitas",      label: "Visitas",           href: "/dashboard/crm/visitas",              permission: "crm.view",    isNew: true },
          { type: "leaf", key: "crm-tarefas",      label: "Tarefas",           href: "/dashboard/crm/tarefas",              permission: "crm.view",    isNew: true },
          { type: "leaf", key: "crm-atendimento",  label: "Atendimento",       href: "/dashboard/crm/atendimento",          permission: "atendimento.view",    isNew: true },
          { type: "leaf", key: "crm-campanhas",    label: "Campanhas",         href: "/dashboard/marketing/campanhas",      permission: "marketing.view",    isNew: true },
        ],
      },
    ],
  },

  { type: "divider", key: "div-2" },

  // ═══════════════════════════════════════════════════════
  // 💰 FINANCEIRO (integrado Primavera)
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "financeiro",
    label: "Financeiro",
    icon: Landmark,
    permission: "financeiro.ver",
    children: [
      {
        type: "group",
        key: "fin-tesouraria",
        label: "Tesouraria",
        icon: Wallet,
        children: [
          { type: "leaf", key: "tes-fluxo",        label: "Fluxo de Caixa",   href: "/dashboard/financeiro/fluxo-caixa",   permission: "financeiro.ver",           primavera: true },
          { type: "leaf", key: "tes-caixa",        label: "Caixa Diário",     href: "/dashboard/caixa",                    permission: "caixa.ver" },
          { type: "leaf", key: "tes-bancos",        label: "Bancos",           href: "/dashboard/financeiro/bancos",        permission: "financeiro.ver",           primavera: true },
          { type: "leaf", key: "tes-recebimentos",  label: "Recebimentos",     href: "/dashboard/movimentos?tipo=entrada",  permission: "movimentos.listar",        primavera: true },
          { type: "leaf", key: "tes-pagamentos",    label: "Pagamentos",       href: "/dashboard/movimentos?tipo=saida",    permission: "movimentos.listar",        primavera: true },
          { type: "leaf", key: "tes-contas-receber",label: "Contas a Receber", href: "/dashboard/financeiro/contas-receber", permission: "financeiro.contas_receber.view", isNew: true },
          { type: "leaf", key: "tes-contas-pagar",  label: "Contas a Pagar",   href: "/dashboard/financeiro/contas-pagar",  permission: "financeiro.contas_pagar.view",   isNew: true },
        ],
      },
      {
        type: "group",
        key: "fin-gestao",
        label: "Gestão Financeira",
        icon: FolderKanban,
        children: [
          { type: "leaf", key: "fin-fundos",        label: "Fundos",           href: "/dashboard/fundos",                   permission: "fundos.ver" },
          { type: "leaf", key: "fin-origens",       label: "Origens",          href: "/dashboard/origens-fundo",            permission: "fundos.ver" },
          { type: "leaf", key: "fin-transferencias",label: "Transferências",   href: "/dashboard/financeiro/transferencias", permission: "fundos.ver" },
          { type: "leaf", key: "fin-centros-custo", label: "Centros de Custo", href: "/dashboard/financeiro/centros-custo", permission: "financeiro.ver",           isNew: true },
          { type: "leaf", key: "fin-aprovacoes",    label: "Aprovações",       href: "/dashboard/financeiro/aprovacoes",    permission: "financeiro.ver",           isNew: true },
        ],
      },
      {
        type: "group",
        key: "fin-plano",
        label: "Plano de Contas",
        icon: BookOpen,
        children: [
          { type: "leaf", key: "fin-conceitos",     label: "Conceitos",        href: "/dashboard/conceitos",                permission: "conceitos.listar" },
          { type: "leaf", key: "fin-periodos",      label: "Períodos",         href: "/dashboard/periodos",                 permission: "periodos.ver" },
        ],
      },
      {
        type: "group",
        key: "fin-bi",
        label: "BI Financeiro",
        icon: PieChart,
        children: [
          { type: "leaf", key: "finbi-demonstrativos",label: "Demonstrativos", href: "/dashboard/relatorios/movimentos",    permission: "relatorios.ver" },
          { type: "leaf", key: "finbi-kpis",          label: "KPIs",           href: "/dashboard/relatorios",               permission: "relatorios.ver" },
          { type: "leaf", key: "finbi-projecoes",     label: "Projeções",      href: "/dashboard/relatorios/projecoes",     permission: "relatorios.ver",           isNew: true },
          { type: "leaf", key: "finbi-executivo",     label: "Dashboard Executivo", href: "/dashboard/relatorios/executivo", permission: "dashboard.ver",           isNew: true },
        ],
      },
      {
        type: "group",
        key: "fin-fiscalidade",
        label: "Fiscalidade",
        icon: Scale,
        children: [
          { type: "leaf", key: "fin-taxas",         label: "Taxas de Imposto", href: "/dashboard/configuracoes/taxas",      permission: "fiscalidade.view",         isNew: true },
          { type: "leaf", key: "fin-obrigacoes-fis",label: "Obrigações Fiscais", href: "/dashboard/contabilidade/obrigacoes", permission: "fiscalidade.view",       isNew: true },
        ],
      },
    ],
  },

  { type: "divider", key: "div-2b" },

  // ═══════════════════════════════════════════════════════
  // ⛽ OPERAÇÕES
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "operacoes",
    label: "Operações",
    icon: Factory,
    permission: "operacoes.estacao.view",
    children: [
      {
        type: "group",
        key: "op-estacao",
        label: "Gestão da Estação",
        icon: Building,
        children: [
          { type: "leaf", key: "op-estacao-page",  label: "Áreas & Equipamentos", href: "/dashboard/operacoes/estacao",      permission: "operacoes.estacao.view",   isNew: true },
        ],
      },
      {
        type: "group",
        key: "op-combustivel",
        label: "Combustível",
        icon: Zap,
        children: [
          { type: "leaf", key: "op-combustivel-page", label: "Tanques & Bombas", href: "/dashboard/operacoes/combustivel",  permission: "operacoes.combustivel.view", isNew: true },
        ],
      },
      {
        type: "group",
        key: "op-lavagem",
        label: "Lavagem Automóvel",
        icon: Car,
        children: [
          { type: "leaf", key: "op-lavagem-page",  label: "Ordens & Boxes",   href: "/dashboard/operacoes/lavagem",        permission: "operacoes.lavagem.view",   isNew: true },
        ],
      },
      {
        type: "group",
        key: "op-agua",
        label: "Gestão da Água",
        icon: Beaker,
        children: [
          { type: "leaf", key: "op-agua-page",     label: "Tanques de Água",  href: "/dashboard/operacoes/agua",           permission: "operacoes.agua.view",      isNew: true },
        ],
      },
    ],
  },

  { type: "divider", key: "div-2c" },

  // ═══════════════════════════════════════════════════════
  // 🍽️ RESTAURAÇÃO
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "restauracao",
    label: "Restauração",
    icon: FlaskConical,
    permission: "restauracao.view",
    children: [
      {
        type: "group",
        key: "rest-base",
        label: "Base",
        icon: Building,
        children: [
          { type: "leaf", key: "rest-mesas",  label: "Mesas",       href: "/dashboard/restauracao/mesas",    permission: "restauracao.view", isNew: true },
          { type: "leaf", key: "rest-menu",   label: "Itens de Menu", href: "/dashboard/restauracao/menu",   permission: "restauracao.view", isNew: true },
          { type: "leaf", key: "rest-comandas", label: "Comandas",  href: "/dashboard/restauracao/comandas", permission: "restauracao.operar_comanda", isNew: true },
        ],
      },
      {
        type: "group",
        key: "rest-bar",
        label: "Bar",
        icon: Tag,
        children: [
          { type: "leaf", key: "rest-happy-hour", label: "Happy Hour", href: "/dashboard/restauracao/bar/happy-hour", permission: "restauracao.gerir_happy_hour", isNew: true },
        ],
      },
      {
        type: "group",
        key: "rest-restaurante",
        label: "Restaurante",
        icon: CalendarClock,
        children: [
          { type: "leaf", key: "rest-reservas", label: "Reservas", href: "/dashboard/restauracao/restaurante/reservas", permission: "restauracao.gerir_reservas", isNew: true },
        ],
      },
      {
        type: "group",
        key: "rest-churrasqueira",
        label: "Churrasqueira",
        icon: Package2,
        children: [
          { type: "leaf", key: "rest-combos",   label: "Combos",   href: "/dashboard/restauracao/churrasqueira/combos",   permission: "restauracao.gerir_combos",   isNew: true },
          { type: "leaf", key: "rest-producao", label: "Produção (KDS)", href: "/dashboard/restauracao/churrasqueira/producao", permission: "restauracao.operar_producao", isNew: true },
        ],
      },
    ],
  },

  { type: "divider", key: "div-3" },

  // ═══════════════════════════════════════════════════════
  // 📚 CONTABILIDADE (leitura Primavera — sem edição)
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "contabilidade",
    label: "Contabilidade",
    icon: BookMarked,
    permission: "contabilidade.ver",
    primavera: true,
    children: [
      {
        type: "group",
        key: "cont-geral",
        label: "Contabilidade Geral",
        icon: Calculator,
        children: [
          { type: "leaf", key: "cont-balancetes", label: "Balancetes",   href: "/dashboard/contabilidade/balancetes",  permission: "contabilidade.ver", readOnly: true, primavera: true },
          { type: "leaf", key: "cont-razao",      label: "Razão",        href: "/dashboard/contabilidade/razao",       permission: "contabilidade.ver", readOnly: true, primavera: true },
          { type: "leaf", key: "cont-diario",     label: "Diário",       href: "/dashboard/contabilidade/diario",      permission: "contabilidade.ver", readOnly: true, primavera: true },
        ],
      },
      {
        type: "group",
        key: "cont-analitica",
        label: "Contabilidade Analítica",
        icon: FileBarChart,
        children: [
          { type: "leaf", key: "cont-centros",    label: "Centros de Custo", href: "/dashboard/contabilidade/centros-custo", permission: "contabilidade.ver", readOnly: true, primavera: true },
          { type: "leaf", key: "cont-analises",   label: "Análises",         href: "/dashboard/contabilidade/analises",      permission: "contabilidade.ver", readOnly: true, primavera: true },
        ],
      },
      {
        type: "group",
        key: "cont-fiscal",
        label: "Fiscalidade",
        icon: Scale,
        children: [
          { type: "leaf", key: "fis-iva",         label: "IVA",              href: "/dashboard/contabilidade/iva",           permission: "contabilidade.ver", readOnly: true, primavera: true },
          { type: "leaf", key: "fis-obrigacoes",  label: "Obrigações Fiscais",href: "/dashboard/contabilidade/obrigacoes",   permission: "contabilidade.ver", readOnly: true, primavera: true },
        ],
      },
    ],
  },

  { type: "divider", key: "div-4" },

  // ═══════════════════════════════════════════════════════
  // 👥 RECURSOS HUMANOS (integrado Primavera RH)
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "rh",
    label: "Recursos Humanos",
    icon: Users2,
    permission: "rh.view",
    children: [
      {
        type: "group",
        key: "rh-colaboradores",
        label: "Colaboradores",
        icon: UserCheck,
        children: [
          { type: "leaf", key: "rh-cadastro",     label: "Cadastro",          href: "/dashboard/rh/colaboradores",        permission: "rh.view",   primavera: true },
          { type: "leaf", key: "rh-organograma",  label: "Organograma",       href: "/dashboard/rh/organograma",          permission: "rh.view",   isNew: true },
        ],
      },
      {
        type: "group",
        key: "rh-gestao",
        label: "Gestão RH",
        icon: Briefcase,
        children: [
          { type: "leaf", key: "rh-ferias",       label: "Férias",            href: "/dashboard/rh/ferias",               permission: "rh.view",   primavera: true },
          { type: "leaf", key: "rh-faltas",       label: "Faltas",            href: "/dashboard/rh/faltas",               permission: "rh.view",   primavera: true },
          { type: "leaf", key: "rh-horarios",     label: "Horários",          href: "/dashboard/rh/horarios",             permission: "rh.view",   primavera: true },
          { type: "leaf", key: "rh-avaliacoes",   label: "Avaliações",        href: "/dashboard/rh/avaliacoes",           permission: "rh.view",   isNew: true },
        ],
      },
      {
        type: "group",
        key: "rh-indicadores",
        label: "Indicadores RH",
        icon: BarChart2,
        children: [
          { type: "leaf", key: "rh-assiduidade",  label: "Assiduidade",       href: "/dashboard/rh/assiduidade",          permission: "rh.view" },
          { type: "leaf", key: "rh-produtividade",label: "Produtividade",     href: "/dashboard/rh/produtividade",        permission: "rh.view" },
          { type: "leaf", key: "rh-custos",       label: "Custos",            href: "/dashboard/rh/custos",               permission: "rh.view",   primavera: true },
        ],
      },
    ],
  },

  { type: "divider", key: "div-5" },

  // ═══════════════════════════════════════════════════════
  // 🛒 COMPRAS (integrado Primavera)
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "compras",
    label: "Compras",
    icon: ShoppingBag,
    permission: "compras.ver",
    children: [
      {
        type: "group",
        key: "cmp-fornecedores",
        label: "Fornecedores",
        icon: Building2,
        children: [
          { type: "leaf", key: "forn-lista",      label: "Cadastro",          href: "/dashboard/fornecedores",            permission: "fornecedores.listar",  primavera: true },
          { type: "leaf", key: "forn-avaliacao",  label: "Avaliação",         href: "/dashboard/fornecedores/avaliacao",  permission: "fornecedores.listar",  isNew: true },
        ],
      },
      {
        type: "group",
        key: "cmp-processo",
        label: "Processo de Compras",
        icon: ClipboardList,
        children: [
          { type: "leaf", key: "cmp-requisicoes", label: "Requisições",       href: "/dashboard/compras/requisicoes",     permission: "compras.ver",  isNew: true },
          { type: "leaf", key: "cmp-aprovacoes",  label: "Aprovações",        href: "/dashboard/compras/aprovacoes",      permission: "compras.ver",  isNew: true },
          { type: "leaf", key: "cmp-pedidos",     label: "Pedidos",           href: "/dashboard/compras/pedidos",         permission: "compras.ver",  isNew: true, primavera: true },
          { type: "leaf", key: "cmp-recepcao",    label: "Receção",           href: "/dashboard/compras/recepcao",        permission: "compras.ver",  isNew: true, primavera: true },
          { type: "leaf", key: "cmp-movimentos",  label: "Movimentos",        href: "/dashboard/movimentos",              permission: "movimentos.listar" },
        ],
      },
    ],
  },

  { type: "divider", key: "div-6" },

  // ═══════════════════════════════════════════════════════
  // 📦 ARMAZÉNS & INVENTÁRIO (integrado Primavera)
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "inventario",
    label: "Armazéns & Inventário",
    icon: Boxes,
    permission: "estoque.ver",
    children: [
      {
        type: "group",
        key: "inv-produtos",
        label: "Produtos",
        icon: Package,
        children: [
          { type: "leaf", key: "prod-lista",      label: "Catálogo",          href: "/dashboard/produtos",                permission: "produtos.listar",  primavera: true },
          { type: "leaf", key: "prod-categorias", label: "Categorias",        href: "/dashboard/produtos?tab=categorias", permission: "produtos.listar" },
        ],
      },
      {
        type: "group",
        key: "inv-armazens",
        label: "Armazéns",
        icon: Warehouse,
        children: [
          { type: "leaf", key: "arm-lista",       label: "Armazéns",          href: "/dashboard/estoque/armazens",        permission: "estoque.ver",      primavera: true },
          { type: "leaf", key: "arm-localizacoes",label: "Localizações",      href: "/dashboard/estoque/localizacoes",    permission: "estoque.ver",      isNew: true },
          { type: "leaf", key: "arm-inventarios", label: "Inventários",       href: "/dashboard/estoque/inventarios",     permission: "estoque.ver",      isNew: true },
        ],
      },
      {
        type: "group",
        key: "inv-stock",
        label: "Stock",
        icon: Layers,
        children: [
          { type: "leaf", key: "stk-atual",       label: "Stock Atual",       href: "/dashboard/estoque/saldos",          permission: "estoque.ver" },
          { type: "leaf", key: "stk-entradas",    label: "Entradas",          href: "/dashboard/estoque/movimentos?tipo=entrada", permission: "estoque.ver", primavera: true },
          { type: "leaf", key: "stk-saidas",      label: "Saídas",            href: "/dashboard/estoque/movimentos?tipo=saida",   permission: "estoque.ver", primavera: true },
          { type: "leaf", key: "stk-transferencias",label: "Transferências",  href: "/dashboard/estoque/movimentos",      permission: "estoque.ver" },
          { type: "leaf", key: "stk-alertas",     label: "Alertas",           href: "/dashboard/estoque/alertas",         permission: "estoque.ver", icon: AlertTriangle },
        ],
      },
    ],
  },

  { type: "divider", key: "div-7" },

  // ═══════════════════════════════════════════════════════
  // 🏭 PRODUÇÃO INDUSTRIAL (módulo diferencial)
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "producao",
    label: "Produção",
    icon: Factory,
    permission: "producao.ver",
    children: [
      {
        type: "group",
        key: "prod-planeamento",
        label: "Planeamento",
        icon: CalendarRange,
        children: [
          { type: "leaf", key: "plan-diario",     label: "Produção Diária",   href: "/dashboard/producao/planeamento/diario",  permission: "producao.planeamento.ver" },
          { type: "leaf", key: "plan-semanal",    label: "Produção Semanal",  href: "/dashboard/producao/planeamento/semanal", permission: "producao.planeamento.ver" },
        ],
      },
      {
        type: "group",
        key: "prod-ordens",
        label: "Ordens de Produção",
        icon: ClipboardList,
        children: [
          { type: "leaf", key: "ord-hipoclorito", label: "Hipoclorito de Sódio", href: "/dashboard/producao/ordens?produto=hipoclorito", permission: "producao.ordens.listar" },
          { type: "leaf", key: "ord-multiuso",    label: "Lixívia Multiuso",     href: "/dashboard/producao/ordens?produto=multiuso",     permission: "producao.ordens.listar" },
          { type: "leaf", key: "ord-nova",        label: "Nova Ordem",           href: "/dashboard/producao/ordens/nova",                 permission: "producao.ordens.criar" },
          { type: "leaf", key: "ord-lista",       label: "Todas as Ordens",      href: "/dashboard/producao/ordens",                      permission: "producao.ordens.listar" },
        ],
      },
      {
        type: "group",
        key: "prod-materias",
        label: "Matérias-Primas",
        icon: FlaskConical,
        children: [
          { type: "leaf", key: "mp-consumo",      label: "Registo de Consumo",href: "/dashboard/producao/consumo/registo",  permission: "producao.consumo.criar" },
          { type: "leaf", key: "mp-historico",    label: "Histórico",         href: "/dashboard/producao/consumo",          permission: "producao.consumo.ver" },
        ],
      },
      {
        type: "group",
        key: "prod-lotes",
        label: "Lotes",
        icon: Package2,
        children: [
          { type: "leaf", key: "lot-criar",       label: "Criar Lote",        href: "/dashboard/producao/lotes/novo",       permission: "producao.lotes.criar" },
          { type: "leaf", key: "lot-historico",   label: "Histórico",         href: "/dashboard/producao/lotes",            permission: "producao.lotes.ver" },
          { type: "leaf", key: "lot-rastreabilidade",label: "Rastreabilidade",href: "/dashboard/producao/lotes/rastreabilidade", permission: "producao.lotes.ver", isNew: true },
        ],
      },
      {
        type: "group",
        key: "prod-qualidade",
        label: "Qualidade",
        icon: BadgeCheck,
        children: [
          { type: "leaf", key: "qua-inspecoes",   label: "Inspeções",         href: "/dashboard/producao/qualidade/inspecoes",         permission: "producao.qualidade.ver" },
          { type: "leaf", key: "qua-nc",          label: "Não Conformidades", href: "/dashboard/producao/qualidade/nao-conformidades", permission: "producao.qualidade.ver" },
        ],
      },
      {
        type: "group",
        key: "prod-custos",
        label: "Custos Industriais",
        icon: DollarSign,
        children: [
          { type: "leaf", key: "cus-consumo",     label: "Consumo",           href: "/dashboard/producao/custos/consumo",   permission: "producao.ver", isNew: true },
          { type: "leaf", key: "cus-eficiencia",  label: "Eficiência",        href: "/dashboard/producao/custos/eficiencia",permission: "producao.ver", isNew: true },
          { type: "leaf", key: "cus-perdas",      label: "Perdas",            href: "/dashboard/producao/custos/perdas",    permission: "producao.ver", isNew: true },
        ],
      },
    ],
  },

  { type: "divider", key: "div-8" },

  // ═══════════════════════════════════════════════════════
  // 🚚 LOGÍSTICA
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "logistica",
    label: "Logística",
    icon: Truck,
    permission: "logistica.ver",
    children: [
      { type: "leaf", key: "log-entregas",    label: "Entregas",        href: "/dashboard/logistica/entregas",    permission: "logistica.ver", isNew: true },
      { type: "leaf", key: "log-rotas",       label: "Rotas",           href: "/dashboard/logistica/rotas",       permission: "logistica.ver", isNew: true, icon: MapPin },
      { type: "leaf", key: "log-frota",       label: "Frota",           href: "/dashboard/logistica/frota",       permission: "logistica.ver", isNew: true, icon: Car },
      { type: "leaf", key: "log-motoristas",  label: "Motoristas",      href: "/dashboard/logistica/motoristas",  permission: "logistica.ver", isNew: true, icon: UserCheck },
      { type: "leaf", key: "log-distribuicao",label: "Distribuição",    href: "/dashboard/logistica/distribuicao",permission: "logistica.ver", isNew: true },
    ],
  },

  { type: "divider", key: "div-9" },

  // ═══════════════════════════════════════════════════════
  // 📊 BI & ANALYTICS
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "bi",
    label: "BI & Analytics",
    icon: BarChart3,
    permission: "relatorios.ver",
    children: [
      {
        type: "group",
        key: "bi-financeiro",
        label: "Financeiro",
        icon: Landmark,
        children: [
          { type: "leaf", key: "bi-fluxo",        label: "Fluxo de Caixa",    href: "/dashboard/relatorios/conceito",     permission: "relatorios.ver" },
          { type: "leaf", key: "bi-fornecedor",   label: "Por Fornecedor",    href: "/dashboard/relatorios/fornecedor",   permission: "relatorios.ver" },
          { type: "leaf", key: "bi-movimentos",   label: "Movimentos",        href: "/dashboard/relatorios/movimentos",   permission: "relatorios.ver" },
          { type: "leaf", key: "bi-utilizador",   label: "Por Utilizador",    href: "/dashboard/relatorios/utilizador",   permission: "relatorios.ver" },
        ],
      },
      {
        type: "group",
        key: "bi-comercial",
        label: "Comercial",
        icon: Handshake,
        children: [
          { type: "leaf", key: "bic-vendas",      label: "Vendas",            href: "/dashboard/relatorios/vendas",       permission: "relatorios.ver", isNew: true },
          { type: "leaf", key: "bic-compras",     label: "Compras",           href: "/dashboard/relatorios/compras",      permission: "relatorios.ver", isNew: true },
        ],
      },
      {
        type: "group",
        key: "bi-producao",
        label: "Produção",
        icon: Factory,
        children: [
          { type: "leaf", key: "bip-diaria",      label: "Produção Diária",   href: "/dashboard/producao/planeamento/diario",  permission: "producao.ver" },
          { type: "leaf", key: "bip-eficiencia",  label: "Eficiência",        href: "/dashboard/producao/custos/eficiencia",   permission: "producao.ver", isNew: true },
          { type: "leaf", key: "bip-consumo",     label: "Consumo",           href: "/dashboard/producao/consumo",             permission: "producao.ver" },
        ],
      },
      {
        type: "group",
        key: "bi-inventario",
        label: "Inventário",
        icon: Boxes,
        children: [
          { type: "leaf", key: "bii-stock",       label: "Stock",             href: "/dashboard/estoque/saldos",          permission: "estoque.ver" },
          { type: "leaf", key: "bii-kardex",      label: "Kardex",            href: "/dashboard/estoque/movimentos",      permission: "estoque.ver" },
        ],
      },
      {
        type: "group",
        key: "bi-rh",
        label: "Recursos Humanos",
        icon: Users2,
        children: [
          { type: "leaf", key: "birh-assiduidade",label: "Assiduidade",       href: "/dashboard/rh/assiduidade",          permission: "rh.view", isNew: true },
          { type: "leaf", key: "birh-produtividade",label: "Produtividade",   href: "/dashboard/rh/produtividade",        permission: "rh.view", isNew: true },
        ],
      },
      {
        type: "group",
        key: "bi-executivo",
        label: "Executivos",
        icon: PieChart,
        children: [
          { type: "leaf", key: "bie-dashboard",   label: "Dashboard",         href: "/dashboard",                         permission: "dashboard.ver" },
          { type: "leaf", key: "bie-hub",         label: "Hub Relatórios",    href: "/dashboard/relatorios",              permission: "relatorios.ver" },
          { type: "leaf", key: "bie-kpis",        label: "KPIs",              href: "/dashboard/relatorios",              permission: "relatorios.ver" },
        ],
      },
    ],
  },

  { type: "divider", key: "div-10" },

  // ═══════════════════════════════════════════════════════
  // ⚙️ ADMINISTRAÇÃO
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "administracao",
    label: "Administração",
    icon: Shield,
    permission: "users.listar",
    children: [
      {
        type: "group",
        key: "adm-utilizadores",
        label: "Utilizadores",
        icon: UserCog,
        children: [
          { type: "leaf", key: "adm-lista",       label: "Lista",             href: "/dashboard/utilizadores",                     permission: "users.listar" },
          { type: "leaf", key: "adm-grupos",      label: "Perfis / Grupos",   href: "/dashboard/utilizadores?tab=grupos",           permission: "users.listar" },
          { type: "leaf", key: "adm-permissoes",  label: "Permissões",        href: "/dashboard/utilizadores?tab=permissoes",       permission: "users.listar" },
        ],
      },
      { type: "leaf", key: "adm-auditoria",   label: "Auditoria",         href: "/dashboard/auditoria",                        permission: "auditoria.ver", icon: ScrollText },
      {
        type: "group",
        key: "adm-integracoes",
        label: "Integrações",
        icon: Network,
        children: [
          { type: "leaf", key: "int-primavera",   label: "Primavera ERP",     href: "/dashboard/integracoes/primavera",             permission: "empresa.gerir", isNew: true, primavera: true },
          { type: "leaf", key: "int-catalogo",    label: "Catálogo API",      href: "/dashboard/configuracoes/catalogo",            permission: "empresa.gerir" },
        ],
      },
    ],
  },

  { type: "divider", key: "div-11" },

  // ═══════════════════════════════════════════════════════
  // 🔧 CONFIGURAÇÕES
  // ═══════════════════════════════════════════════════════
  {
    type: "section",
    key: "configuracoes",
    label: "Configurações",
    icon: Settings2,
    permission: "empresa.gerir",
    children: [
      {
        type: "group",
        key: "cfg-empresa",
        label: "Empresa",
        icon: Building,
        children: [
          { type: "leaf", key: "cfg-dados",       label: "Dados Gerais",      href: "/dashboard/configuracoes",                     permission: "empresa.gerir" },
          { type: "leaf", key: "cfg-filiais",     label: "Filiais",           href: "/dashboard/configuracoes/filiais",             permission: "empresa.gerir", isNew: true },
        ],
      },
      {
        type: "group",
        key: "cfg-fiscal",
        label: "Impostos",
        icon: Receipt,
        children: [
          { type: "leaf", key: "cfg-iva",         label: "IVA",               href: "/dashboard/configuracoes/iva",                 permission: "empresa.gerir", isNew: true },
          { type: "leaf", key: "cfg-taxas",       label: "Taxas",             href: "/dashboard/configuracoes/taxas",               permission: "empresa.gerir", isNew: true },
        ],
      },
      {
        type: "group",
        key: "cfg-integracoes",
        label: "Integrações",
        icon: Plug,
        children: [
          { type: "leaf", key: "cfg-apis",        label: "APIs",              href: "/dashboard/configuracoes/apis",                permission: "empresa.gerir", isNew: true },
          { type: "leaf", key: "cfg-webhooks",    label: "Webhooks",          href: "/dashboard/configuracoes/webhooks",            permission: "empresa.gerir", isNew: true, icon: Webhook },
        ],
      },
      { type: "leaf", key: "cfg-lixeira",     label: "Lixeira",           href: "/dashboard/lixeira",                           permission: "lixeira.ver",   icon: Trash2 },
    ],
  },
];
