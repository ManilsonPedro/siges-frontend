"use client";
import { useQuery } from "@tanstack/react-query";
import { biService } from "@/shared/services/bi.service";
import { estoqueService, caixaService } from "@/shared/services/financeiro.service";
import { formatCurrency, cn } from "@/shared/utils";
import {
  Droplets, ShoppingCart, Wallet, Users, AlertTriangle,
  Car, Star, RefreshCw, Clock, UserX, RotateCcw,
} from "lucide-react";
import Link from "next/link";

/* ── KPI Card ── */
function KpiCard({
  title, value, subtitle, icon: Icon, colorClass, href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  colorClass: string;
  href?: string;
}) {
  const content = (
    <div className={cn(
      "bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5 flex gap-4 shadow-sm transition-all",
      href && "hover:shadow-md hover:border-ink-ghost/80 dark:hover:border-gray-700 cursor-pointer"
    )}>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 truncate">{title}</p>
        <p className="text-xl font-bold text-ink dark:text-white mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-[11px] text-ink-mid/50 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

/* ── Section Header ── */
function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold text-ink dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Skeleton ── */
function KpiSkeleton() {
  return (
    <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-5 flex gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-ink-ghost/30 dark:bg-ink-ghost/20 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded w-2/3" />
        <div className="h-5 bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded w-4/5" />
        <div className="h-2.5 bg-ink-ghost/30 dark:bg-ink-ghost/20 rounded w-1/2" />
      </div>
    </div>
  );
}

/* ── Alertas de Stock ── */
function StockAlertsWidget() {
  const { data: alertas } = useQuery({
    queryKey: ["estoque-alertas"],
    queryFn: () => estoqueService.alertas(),
    staleTime: 2 * 60 * 1000,
  });
  const items = alertas?.slice(0, 5) ?? [];
  if (!items.length) return null;

  return (
    <div className="bg-panel dark:bg-panel rounded-xl border border-amber/30 dark:border-amber/30 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-amber/8 dark:bg-amber/10 border-b border-amber/20 dark:border-amber/30">
        <AlertTriangle className="h-4 w-4 text-amber shrink-0" />
        <span className="text-sm font-semibold text-amber dark:text-amber">
          Alertas de Stock ({items.length})
        </span>
      </div>
      <div className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
        {items.map((a: any) => (
          <div key={a.produto_id} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <p className="text-xs font-medium text-ink dark:text-white truncate max-w-[200px]">{a.nome}</p>
              <p className="text-[11px] text-ink-mid/50">{a.sku}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-danger">{a.qtd_disponivel} {a.unidade}</p>
              <p className="text-[11px] text-ink-mid/50">Mín: {a.stock_minimo}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
        <Link href="/dashboard/estoque/alertas" className="text-xs text-ink hover:underline">
          Ver todos →
        </Link>
      </div>
    </div>
  );
}

/* ── Vendas Recentes ── */
function RecentSalesWidget() {
  const { data: vendas = [] } = useQuery({
    queryKey: ["caixa-vendas-recentes"],
    queryFn: () => caixaService.listVendas({ page_size: 5 }),
    staleTime: 60_000,
  });

  return (
    <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-ink" />
          <span className="text-sm font-semibold text-ink dark:text-white">Vendas Recentes</span>
        </div>
        <Link href="/dashboard/caixa/vendas" className="text-xs text-ink hover:underline">Ver todas</Link>
      </div>
      {vendas.length === 0 ? (
        <p className="text-xs text-ink-mid/50 text-center py-6">Sem vendas registadas</p>
      ) : (
        <div className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
          {vendas.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-xs font-medium text-ink dark:text-white">{v.numero_proforma || "Rascunho"}</p>
                <p className="text-[11px] text-ink-mid/50">{new Date(v.data).toLocaleDateString("pt-AO")}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-ink dark:text-white">{formatCurrency(v.total_liquido)}</p>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  v.estado === "concluida" ? "bg-live-dim text-live" :
                  v.estado === "anulada"   ? "bg-danger/10 text-danger" :
                  "bg-surface text-ink-mid"
                )}>{v.estado}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Dashboard Page — foco na Operação (Lavagem) ── */
export default function DashboardPage() {
  const { data: operacional, isLoading: l1 } = useQuery({ queryKey: ["bi-operacional"], queryFn: biService.dashboardOperacional });
  const { data: comercial, isLoading: l2 } = useQuery({ queryKey: ["bi-comercial"], queryFn: biService.dashboardComercial });
  const { data: financeiro, isLoading: l3 } = useQuery({ queryKey: ["bi-financeiro"], queryFn: biService.dashboardFinanceiro });
  const { data: rh, isLoading: l4 } = useQuery({ queryKey: ["bi-rh"], queryFn: biService.dashboardRh });

  const isLoading = l1 || l2 || l3 || l4;

  return (
    <div className="space-y-6 max-w-screen-2xl">

      {/* ── Cabeçalho ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Dashboard Operacional</h1>
          <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 mt-0.5">
            {new Date().toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 text-ink-mid/70 hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors self-start sm:self-auto"
          title="Actualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* ── Operação · Lavagem ── */}
      <div>
        <SectionHeader title="Operação · Lavagem" subtitle="Estado geral da operação hoje" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                title="Lavagens Hoje"
                value={operacional?.lavagem_hoje ?? 0}
                subtitle={`${operacional?.lavagem_agendadas_hoje ?? 0} agendadas · ${operacional?.lavagem_concluidas_hoje ?? 0} concluídas`}
                icon={Droplets} colorClass="bg-ink"
                href="/dashboard/operacoes/lavagem"
              />
              <KpiCard
                title="Em Curso"
                value={operacional?.ordens_lavagem_em_curso ?? 0}
                subtitle="ordens neste momento"
                icon={Car} colorClass="bg-live"
                href="/dashboard/operacoes/lavagem/fila"
              />
              <KpiCard
                title="Ocupação de Boxes"
                value={`${operacional?.lavagem_taxa_ocupacao_boxes_pct ?? 0}%`}
                icon={Droplets} colorClass="bg-indigo-600"
                href="/dashboard/operacoes/estacao"
              />
              <KpiCard
                title="Walk-ins / Reservas"
                value={`${operacional?.lavagem_walkins_hoje ?? 0} / ${operacional?.lavagem_reservas_hoje ?? 0}`}
                icon={Clock} colorClass="bg-cyan-600"
                href="/dashboard/operacoes/lavagem/fila"
              />
              <KpiCard
                title="Avaliação Média"
                value={operacional?.lavagem_avaliacao_media ? `${operacional.lavagem_avaliacao_media.toFixed(1)} / 5` : "—"}
                icon={Star} colorClass="bg-amber-500"
              />
              <KpiCard
                title="Cancelamentos / No-Show"
                value={`${operacional?.lavagem_cancelamentos_hoje ?? 0} / ${operacional?.lavagem_no_show_hoje ?? 0}`}
                icon={UserX} colorClass="bg-danger"
              />
              <KpiCard
                title="Taxa de Retrabalho"
                value={`${operacional?.lavagem_taxa_retrabalho_pct ?? 0}%`}
                icon={RotateCcw} colorClass="bg-orange-500"
              />
              <KpiCard
                title="Receita da Lavagem Hoje"
                value={formatCurrency(operacional?.lavagem_receita_hoje ?? 0)}
                subtitle={`Ticket médio ${formatCurrency(operacional?.lavagem_ticket_medio ?? 0)}`}
                icon={Wallet} colorClass="bg-purple-600"
                href="/dashboard/relatorios/executivo"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Comercial ── */}
      <div>
        <SectionHeader title="Comercial" subtitle="Loja, restaurante, bar e e-commerce" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                title="Vendas Hoje"
                value={formatCurrency(comercial?.vendas_hoje.total ?? 0)}
                subtitle={`${comercial?.vendas_hoje.n_vendas ?? 0} vendas`}
                icon={ShoppingCart} colorClass="bg-cyan-600"
                href="/dashboard/caixa/vendas"
              />
              <KpiCard
                title="Ticket Médio"
                value={formatCurrency(comercial?.vendas_hoje.ticket_medio ?? 0)}
                icon={ShoppingCart} colorClass="bg-teal-600"
              />
              <KpiCard
                title="Pedidos Online Pendentes"
                value={comercial?.pedidos_ecommerce_pendentes ?? 0}
                icon={ShoppingCart} colorClass="bg-pink-600"
                href="/dashboard/ecommerce/pedidos"
              />
              <KpiCard
                title="Colaboradores Activos"
                value={rh?.colaboradores_ativos ?? 0}
                subtitle={`${rh?.ferias_em_curso ?? 0} em férias · ${rh?.assiduidade_media_pct ?? 0}% assiduidade`}
                icon={Users} colorClass="bg-indigo-600"
                href="/dashboard/rh"
              />
            </>
          )}
        </div>
        {comercial && comercial.top_produtos.length > 0 && (
          <div className="mt-4 bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-4">
            <p className="text-xs text-ink-mid/70 mb-2">Top Produtos</p>
            <ul className="text-sm space-y-1">
              {comercial.top_produtos.map((p) => <li key={p.produto_id}>{p.nome} — {p.n_vendas} vendas</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* ── Linha: Top Clientes / Extras + Widgets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {operacional && operacional.lavagem_top_clientes.length > 0 && (
              <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-4">
                <p className="text-xs text-ink-mid/70 mb-2">Top Clientes (nº de lavagens)</p>
                <ul className="text-sm space-y-1">
                  {operacional.lavagem_top_clientes.map((c) => (
                    <li key={c.cliente_id} className="flex justify-between">
                      <span>{c.cliente_nome}</span>
                      <span>{c.n_lavagens}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {operacional && operacional.lavagem_top_extras.length > 0 && (
              <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-4">
                <p className="text-xs text-ink-mid/70 mb-2">Extras Mais Vendidos</p>
                <ul className="text-sm space-y-1">
                  {operacional.lavagem_top_extras.map((e) => (
                    <li key={e.extra_id} className="flex justify-between">
                      <span>{e.extra_nome}</span>
                      <span>{e.n_vendas}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {financeiro && financeiro.saldos_fundos.length > 0 && (
            <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-4">
              <p className="text-xs text-ink-mid/70 mb-2">Tesouraria — Saldos por Fundo</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {financeiro.saldos_fundos.map((f) => (
                  <div key={f.tipo} className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-ink-mid/50" />
                    <div>
                      <p className="text-[11px] text-ink-mid/50">{f.tipo}</p>
                      <p className="text-sm font-semibold">{formatCurrency(f.saldo_atual)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-ink-mid/50 mt-2">
                Movimentos do mês: {formatCurrency(financeiro.movimentos_mes.entradas)} entradas / {formatCurrency(financeiro.movimentos_mes.saidas)} saídas
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <StockAlertsWidget />
          <RecentSalesWidget />
        </div>
      </div>

    </div>
  );
}
