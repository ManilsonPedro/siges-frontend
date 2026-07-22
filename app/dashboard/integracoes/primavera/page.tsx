"use client";

import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShoppingCart,
  Package,
  Users,
  Landmark,
  BookOpen,
  Boxes,
  Wifi,
} from "lucide-react";

const modulos = [
  {
    id: 1,
    nome: "Comercial",
    descricao: "Facturas, notas de crédito e clientes",
    icone: ShoppingCart,
    estado: "Activo",
    ultimaSincronizacao: "18/06/2026 às 22:45",
    totalRegistos: 1_482,
    erros: 0,
    cor: "blue",
  },
  {
    id: 2,
    nome: "Compras",
    descricao: "Ordens de compra, fornecedores e recepções",
    icone: Package,
    estado: "Activo",
    ultimaSincronizacao: "18/06/2026 às 22:45",
    totalRegistos: 374,
    erros: 0,
    cor: "blue",
  },
  {
    id: 3,
    nome: "Recursos Humanos",
    descricao: "Colaboradores, salários e contratos",
    icone: Users,
    estado: "Pendente",
    ultimaSincronizacao: "17/06/2026 às 08:00",
    totalRegistos: 47,
    erros: 2,
    cor: "yellow",
  },
  {
    id: 4,
    nome: "Tesouraria",
    descricao: "Recebimentos, pagamentos e caixa",
    icone: Landmark,
    estado: "Activo",
    ultimaSincronizacao: "18/06/2026 às 23:00",
    totalRegistos: 2_911,
    erros: 0,
    cor: "blue",
  },
  {
    id: 5,
    nome: "Contabilidade",
    descricao: "Lançamentos, plano de contas e balancetes",
    icone: BookOpen,
    estado: "Erro",
    ultimaSincronizacao: "16/06/2026 às 14:30",
    totalRegistos: 5_204,
    erros: 14,
    cor: "red",
  },
  {
    id: 6,
    nome: "Inventário",
    descricao: "Artigos, movimentos de stock e armazéns",
    icone: Boxes,
    estado: "Activo",
    ultimaSincronizacao: "18/06/2026 às 22:50",
    totalRegistos: 893,
    erros: 0,
    cor: "blue",
  },
];

const estadoConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  Activo: {
    label: "Activo",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Pendente: {
    label: "Pendente",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  Erro: {
    label: "Erro",
    className: "bg-danger/10 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = estadoConfig[estado] ?? estadoConfig["Pendente"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function formatRegistos(n: number) {
  return n.toLocaleString("pt-AO");
}

export default function PrimaveraPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-ink dark:text-white">
              Integração Primavera ERP
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
              <Wifi className="w-3 h-3" />
              Primavera
            </span>
          </div>
          <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
            Estado dos módulos sincronizados com o Primavera ERP
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" />
          Sincronizar Todos
        </button>
      </div>

      {/* Banner leitura */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
        <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Dados sincronizados do Primavera ERP</span> — apenas leitura. Para editar registos aceda directamente ao Primavera.
        </p>
      </div>

      {/* Resumo global */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Módulos Activos", valor: modulos.filter((m) => m.estado === "Activo").length, cor: "text-live dark:text-green-400" },
          { label: "Com Erro", valor: modulos.filter((m) => m.estado === "Erro").length, cor: "text-danger dark:text-red-400" },
          { label: "Pendentes", valor: modulos.filter((m) => m.estado === "Pendente").length, cor: "text-yellow-600 dark:text-yellow-400" },
          { label: "Total Registos", valor: formatRegistos(modulos.reduce((acc, m) => acc + m.totalRegistos, 0)), cor: "text-indigo-600 dark:text-indigo-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-4"
          >
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.cor}`}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Cards por módulo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {modulos.map((mod) => {
          const Icone = mod.icone;
          return (
            <div
              key={mod.id}
              className="rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 bg-panel dark:bg-panel p-5 flex flex-col gap-4"
            >
              {/* Topo */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <Icone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink dark:text-white text-sm">
                      {mod.nome}
                    </h3>
                    <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 leading-snug">
                      {mod.descricao}
                    </p>
                  </div>
                </div>
                <EstadoBadge estado={mod.estado} />
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface dark:bg-gray-700/50 px-3 py-2">
                  <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Registos sincronizados</p>
                  <p className="text-lg font-bold text-ink dark:text-white">
                    {formatRegistos(mod.totalRegistos)}
                  </p>
                </div>
                <div className="rounded-lg bg-surface dark:bg-gray-700/50 px-3 py-2">
                  <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">Erros detectados</p>
                  <p
                    className={`text-lg font-bold ${
                      mod.erros > 0
                        ? "text-danger dark:text-red-400"
                        : "text-live dark:text-green-400"
                    }`}
                  >
                    {mod.erros}
                  </p>
                </div>
              </div>

              {/* Última sinc */}
              <div className="flex items-center gap-1.5 text-xs text-ink-mid/50 dark:text-ink-mid/40">
                <Clock className="w-3.5 h-3.5" />
                Última sincronização: {mod.ultimaSincronizacao}
              </div>

              {/* Acções */}
              <div className="flex items-center gap-2 pt-1 border-t border-ink-ghost/40 dark:border-gray-700">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sincronizar agora
                </button>
                {mod.erros > 0 && (
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-danger/8 hover:bg-danger/10 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-danger dark:text-red-400 text-xs font-medium transition-colors">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Ver erros
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
