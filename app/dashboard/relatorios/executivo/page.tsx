"use client";
import { useQuery } from "@tanstack/react-query";
import { biService } from "@/shared/services/bi.service";
import { BarChart3, Loader2, Wallet, ShoppingCart, Droplets, Users } from "lucide-react";

function Card({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-ink-mid/70" />
        <p className="text-xs text-ink-mid/70">{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs text-ink-mid/70 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardExecutivoPage() {
  const { data: financeiro, isLoading: l1 } = useQuery({ queryKey: ["bi-financeiro"], queryFn: biService.dashboardFinanceiro });
  const { data: comercial, isLoading: l2 } = useQuery({ queryKey: ["bi-comercial"], queryFn: biService.dashboardComercial });
  const { data: operacional, isLoading: l3 } = useQuery({ queryKey: ["bi-operacional"], queryFn: biService.dashboardOperacional });
  const { data: rh, isLoading: l4 } = useQuery({ queryKey: ["bi-rh"], queryFn: biService.dashboardRh });

  const isLoading = l1 || l2 || l3 || l4;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Dashboard Executivo</h1>
      </div>

      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}

      {!isLoading && (
        <>
          <div>
            <h2 className="text-sm font-semibold text-ink-mid/70 uppercase mb-2 flex items-center gap-2"><Wallet className="h-4 w-4" /> Financeiro</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {financeiro?.saldos_fundos.map((f) => (
                <Card key={f.tipo} icon={Wallet} label={`Fundo ${f.tipo}`} value={`${f.saldo_atual.toLocaleString("pt-AO")} Kz`} />
              ))}
              <Card icon={Wallet} label="Entradas do Mês" value={`${(financeiro?.movimentos_mes.entradas || 0).toLocaleString("pt-AO")} Kz`} />
              <Card icon={Wallet} label="Saídas do Mês" value={`${(financeiro?.movimentos_mes.saidas || 0).toLocaleString("pt-AO")} Kz`} />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink-mid/70 uppercase mb-2 flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Comercial</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card icon={ShoppingCart} label="Vendas Hoje" value={`${(comercial?.vendas_hoje.total || 0).toLocaleString("pt-AO")} Kz`} sub={`${comercial?.vendas_hoje.n_vendas || 0} vendas`} />
              <Card icon={ShoppingCart} label="Ticket Médio" value={`${(comercial?.vendas_hoje.ticket_medio || 0).toLocaleString("pt-AO")} Kz`} />
              <Card icon={ShoppingCart} label="Pedidos Online Pendentes" value={String(comercial?.pedidos_ecommerce_pendentes || 0)} />
            </div>
            {comercial && comercial.top_produtos.length > 0 && (
              <div className="mt-3 bg-panel dark:bg-panel rounded-xl shadow p-4">
                <p className="text-xs text-ink-mid/70 mb-2">Top Produtos</p>
                <ul className="text-sm space-y-1">
                  {comercial.top_produtos.map((p) => <li key={p.produto_id}>{p.nome} — {p.n_vendas} vendas</li>)}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink-mid/70 uppercase mb-2 flex items-center gap-2"><Droplets className="h-4 w-4" /> Operações · Lavagem</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card icon={Droplets} label="Lavagens Hoje" value={String(operacional?.lavagem_hoje || 0)} sub={`${operacional?.lavagem_agendadas_hoje || 0} agendadas · ${operacional?.lavagem_concluidas_hoje || 0} concluídas`} />
              <Card icon={Droplets} label="Lavagens em Curso" value={String(operacional?.ordens_lavagem_em_curso || 0)} />
              <Card icon={Droplets} label="Walk-ins Hoje" value={String(operacional?.lavagem_walkins_hoje || 0)} sub={`${operacional?.lavagem_reservas_hoje || 0} reservas hoje`} />
              <Card icon={Droplets} label="Ocupação de Boxes" value={`${operacional?.lavagem_taxa_ocupacao_boxes_pct || 0}%`} />
              <Card icon={Droplets} label="Avaliação Média" value={operacional?.lavagem_avaliacao_media ? `${operacional.lavagem_avaliacao_media.toFixed(1)} / 5` : "—"} />
              <Card icon={Droplets} label="Cancelamentos Hoje" value={String(operacional?.lavagem_cancelamentos_hoje || 0)} />
              <Card icon={Droplets} label="Taxa de Retrabalho" value={`${operacional?.lavagem_taxa_retrabalho_pct || 0}%`} sub="re-lavagens oferecidas" />
              <Card icon={Droplets} label="Tempo Médio de Atendimento" value={operacional?.lavagem_tempo_medio_atendimento_minutos ? `${operacional.lavagem_tempo_medio_atendimento_minutos.toFixed(0)} min` : "—"} sub="check-in → conclusão" />
              <Card icon={Droplets} label="Tempo Médio de Espera" value={operacional?.lavagem_tempo_medio_espera_minutos ? `${operacional.lavagem_tempo_medio_espera_minutos.toFixed(0)} min` : "—"} sub="na fila" />
              <Card icon={Droplets} label="Receita da Lavagem Hoje" value={`${(operacional?.lavagem_receita_hoje || 0).toLocaleString("pt-AO")} Kz`} />
              <Card icon={Droplets} label="Ticket Médio da Lavagem" value={`${(operacional?.lavagem_ticket_medio || 0).toLocaleString("pt-AO")} Kz`} />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-3">
              {operacional && Object.keys(operacional.lavagem_agua_por_categoria_litros).length > 0 && (
                <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
                  <p className="text-xs text-ink-mid/70 mb-2">Água Consumida por Categoria de Veículo</p>
                  <ul className="text-sm space-y-1">
                    {Object.entries(operacional.lavagem_agua_por_categoria_litros).map(([cat, litros]) => (
                      <li key={cat} className="flex justify-between">
                        <span>{cat}</span>
                        <span>{litros.toLocaleString("pt-AO")} L</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {operacional && operacional.lavagem_top_clientes.length > 0 && (
                <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
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
                <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
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
              {operacional && operacional.lavagem_produtividade_colaboradores.length > 0 && (
                <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
                  <p className="text-xs text-ink-mid/70 mb-2">Produtividade por Colaborador</p>
                  <ul className="text-sm space-y-1">
                    {operacional.lavagem_produtividade_colaboradores.map((c) => (
                      <li key={c.colaborador_id} className="flex justify-between">
                        <span>{c.colaborador_nome}</span>
                        <span>{c.n_lavagens} lavagens{c.tempo_medio_minutos != null ? ` · ${c.tempo_medio_minutos.toFixed(0)} min` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {operacional && operacional.lavagem_comparativo_filiais.length > 0 && (
                <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
                  <p className="text-xs text-ink-mid/70 mb-2">Comparativo entre Filiais</p>
                  <ul className="text-sm space-y-1">
                    {operacional.lavagem_comparativo_filiais.map((f) => (
                      <li key={f.filial_id} className="flex justify-between">
                        <span>{f.filial_nome}</span>
                        <span>{f.n_lavagens} lavagens · {f.receita.toLocaleString("pt-AO")} Kz</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink-mid/70 uppercase mb-2 flex items-center gap-2"><Users className="h-4 w-4" /> Recursos Humanos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card icon={Users} label="Colaboradores Activos" value={String(rh?.colaboradores_ativos || 0)} />
              <Card icon={Users} label="Férias em Curso" value={String(rh?.ferias_em_curso || 0)} />
              <Card icon={Users} label="Assiduidade Média" value={`${rh?.assiduidade_media_pct || 0}%`} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
