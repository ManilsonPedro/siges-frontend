"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { relatoriosService, estoqueService, caixaService } from "@/shared/services/financeiro.service";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatCurrency } from "@/shared/utils";
import { EvolucaoDiariaChart }  from "@/shared/ui/evolucao-diaria-chart";
import { EvolucaoSaldoChart }   from "@/shared/ui/evolucao-saldo-chart";
import { ProdutividadeUsersWidget } from "@/shared/ui/produtividade-users-widget";
import {
  WidgetRelatorioFundos,
  WidgetUltimosCarregamentos,
  WidgetPorFornecedor,
  WidgetPorConceito,
} from "@/shared/ui/dashboard-widgets";
import {
  Wallet, TrendingDown, TrendingUp, Clock, CheckCircle,
  AlertTriangle, ShoppingCart, ArrowUpRight, ArrowDownRight,
  Factory, Boxes, Users, CalendarDays, RefreshCw, Filter, X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/utils";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";

/* ── KPI Card ── */
function KpiCard({
  title, value, subtitle, icon: Icon, colorClass, trend, trendPct, href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  colorClass: string;
  trend?: number | null;
  trendPct?: number | null;
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
        {trend !== undefined && trend !== null && trendPct !== undefined && trendPct !== null && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium mt-1",
            trend >= 0 ? "text-live" : "text-danger"
          )}>
            {trend >= 0
              ? <ArrowUpRight className="h-3 w-3" />
              : <ArrowDownRight className="h-3 w-3" />}
            {trendPct > 0 ? "+" : ""}{trendPct}%
            <span className="text-ink-mid/50 font-normal ml-0.5">vs período ant.</span>
          </span>
        )}
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

/* ── Dashboard Page ── */
export default function DashboardPage() {
  const router = useRouter();
  const { has, isLoading: permsLoading } = usePermissions();

  const [dateFilter, setDateFilter] = useState({ data_inicio: "", data_fim: "" });
  const [applied,    setApplied]    = useState<{ data_inicio?: string; data_fim?: string }>({});
  const isFiltered = !!(applied.data_inicio || applied.data_fim);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", applied],
    queryFn:  () => relatoriosService.dashboard(applied.data_inicio, applied.data_fim),
  });

  const { data: mensal } = useQuery({
    queryKey: ["relatorio-mensal"],
    queryFn:  () => relatoriosService.mensal(new Date().getFullYear(), new Date().getMonth() + 1),
  });

  const chartData = (mensal?.resumo ?? []).map((r: any) => ({
    name: `${r.tipo}`,
    total: r.total,
  }));

  const mv = data?.movimentos;

  return (
    <div className="space-y-6 max-w-screen-2xl">

      {/* ── Cabeçalho ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Dashboard Executivo</h1>
          <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 mt-0.5">
            {data?.periodo?.data_inicio
              ? `${data.periodo.data_inicio.slice(0, 10)} → ${data.periodo.data_fim?.slice(0, 10)}`
              : new Date().toLocaleDateString("pt-AO", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex items-end gap-2 bg-panel dark:bg-panel border border-ink-ghost/60 dark:border-ink-ghost/20 rounded-xl px-3 py-2">
            <Filter className="h-3.5 w-3.5 text-ink-mid/50 mb-1.5" />
            <div>
              <label className="block text-[10px] text-ink-mid/50 mb-0.5">De</label>
              <input type="date" value={dateFilter.data_inicio}
                onChange={(e) => setDateFilter((f) => ({ ...f, data_inicio: e.target.value }))}
                className="text-xs bg-transparent text-ink dark:text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-ink-mid/50 mb-0.5">Até</label>
              <input type="date" value={dateFilter.data_fim}
                onChange={(e) => setDateFilter((f) => ({ ...f, data_fim: e.target.value }))}
                className="text-xs bg-transparent text-ink dark:text-white outline-none" />
            </div>
          </div>
          <button
            onClick={() => setApplied({ data_inicio: dateFilter.data_inicio || undefined, data_fim: dateFilter.data_fim || undefined })}
            className="flex items-center gap-1.5 bg-ink hover:bg-ink/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Filtrar
          </button>
          {isFiltered && (
            <button
              onClick={() => { setDateFilter({ data_inicio: "", data_fim: "" }); setApplied({}); }}
              className="flex items-center gap-1.5 px-4 py-2 border border-ink-ghost/60 dark:border-ink-ghost/20 rounded-xl text-sm text-ink-mid/70 hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Limpar
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 text-ink-mid/70 hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── KPIs Financeiros ── */}
      <div>
        <SectionHeader
          title="Fundos"
          subtitle="Posição financeira actual"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard title="Disponível BCS"   value={formatCurrency(data?.fundo?.bcs?.valor_disponivel ?? 0)} icon={Wallet}     colorClass="bg-ink"    href="/dashboard/fundos" />
              <KpiCard title="Saldo BCS"        value={formatCurrency(data?.fundo?.bcs?.saldo_atual ?? 0)}      icon={TrendingUp}  colorClass="bg-live" href="/dashboard/fundos" />
              <KpiCard title="Acumulado BCS"    value={formatCurrency(data?.fundo?.bcs?.acumulado ?? 0)}        icon={TrendingDown} colorClass="bg-orange-500"  href="/dashboard/fundos" />
              <KpiCard title="Disponível BFA"   value={formatCurrency(data?.fundo?.bfa?.valor_disponivel ?? 0)} icon={Wallet}     colorClass="bg-purple-600"  href="/dashboard/fundos" />
              <KpiCard title="Saldo BFA"        value={formatCurrency(data?.fundo?.bfa?.saldo_atual ?? 0)}      icon={TrendingUp}  colorClass="bg-live" href="/dashboard/fundos" />
              <KpiCard title="Acumulado BFA"    value={formatCurrency(data?.fundo?.bfa?.acumulado ?? 0)}        icon={TrendingDown} colorClass="bg-danger"     href="/dashboard/fundos" />
            </>
          )}
        </div>
      </div>

      {/* ── KPIs Movimentos ── */}
      <div>
        <SectionHeader
          title="Movimentos Financeiros"
          subtitle={isFiltered ? "Período seleccionado" : "Mês actual"}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                title="Total Entradas"
                value={formatCurrency(mv?.total_entradas?.valor ?? 0)}
                icon={TrendingUp}
                colorClass="bg-live"
                trend={mv?.total_entradas?.delta}
                trendPct={mv?.total_entradas?.pct}
                href="/dashboard/movimentos?tipo=entrada"
              />
              <KpiCard
                title="Total Saídas"
                value={formatCurrency(mv?.total_gastos?.valor ?? 0)}
                icon={TrendingDown}
                colorClass="bg-danger"
                trend={mv?.total_gastos?.delta ? -mv.total_gastos.delta : null}
                trendPct={mv?.total_gastos?.pct}
                href="/dashboard/movimentos?tipo=saida"
              />
              <KpiCard
                title="Valor Pendente"
                value={formatCurrency(mv?.valor_pendentes?.valor ?? 0)}
                subtitle={`${mv?.count_pendentes ?? 0} movimentos`}
                icon={Clock}
                colorClass="bg-amber"
                href="/dashboard/movimentos"
              />
              <KpiCard
                title="Movimentos Pagos"
                value={mv?.count_pagos ?? 0}
                icon={CheckCircle}
                colorClass="bg-ink"
                href="/dashboard/movimentos"
              />
            </>
          )}
        </div>
      </div>

      {/* ── KPIs Operacionais ── */}
      <div>
        <SectionHeader title="Operacional" subtitle="Estado geral da operação" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard title="Fornecedores Activos" value={data?.fornecedores ?? 0} icon={Users}    colorClass="bg-indigo-600"  href="/dashboard/fornecedores" />
              <KpiCard title="Conceitos"            value={data?.conceitos ?? 0}    icon={Factory}  colorClass="bg-pink-600"    href="/dashboard/conceitos" />
              <KpiCard title="Produtos em Stock"    value="—"                       icon={Boxes}    colorClass="bg-teal-600"    href="/dashboard/estoque/saldos" />
              <KpiCard title="Vendas do Mês"        value="—"                       icon={ShoppingCart} colorClass="bg-cyan-600" href="/dashboard/caixa/vendas" />
            </>
          )}
        </div>
      </div>

      {/* ── Linha principal: Gráficos + Widgets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda: Gráficos (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-5">
            <SectionHeader title="Evolução Diária" subtitle="BCS vs BFA — mês actual" />
            <EvolucaoDiariaChart />
          </div>

          <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-5">
            <SectionHeader title="Evolução de Saldo" subtitle="Últimos 6 meses" />
            <EvolucaoSaldoChart meses={6} />
          </div>

          {chartData.length > 0 && (
            <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-5">
              <SectionHeader title="Movimentos do Mês" />
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total (AOA)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Coluna direita: Widgets (1/3) */}
        <div className="space-y-4">
          <StockAlertsWidget />
          <RecentSalesWidget />

          <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
              <p className="text-sm font-semibold text-ink dark:text-white">Relatório de Fundos</p>
            </div>
            <WidgetRelatorioFundos />
          </div>

          <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
              <p className="text-sm font-semibold text-ink dark:text-white">Últimos Carregamentos</p>
            </div>
            <WidgetUltimosCarregamentos />
          </div>
        </div>
      </div>

      {/* ── Análises por Fornecedor / Conceito ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink dark:text-white">Top Fornecedores</p>
            <Link href="/dashboard/relatorios/fornecedor" className="text-xs text-ink hover:underline">Detalhe →</Link>
          </div>
          <WidgetPorFornecedor />
        </div>
        <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-ghost/40 dark:border-ink-ghost/15 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink dark:text-white">Por Conceito</p>
            <Link href="/dashboard/relatorios/conceito" className="text-xs text-ink hover:underline">Detalhe →</Link>
          </div>
          <WidgetPorConceito />
        </div>
      </div>

      {/* ── Produtividade ── */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 shadow-sm p-5">
        <SectionHeader title="Produtividade por Utilizador" subtitle="Actividade no sistema" />
        <ProdutividadeUsersWidget />
      </div>

    </div>
  );
}
