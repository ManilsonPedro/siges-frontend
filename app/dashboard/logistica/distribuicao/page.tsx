"use client";
import {
  CalendarDays,
  Truck,
  User,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface EntregaPlano {
  id: string;
  cliente: string;
  produto: string;
  quantidade: string;
  motorista: string;
  veiculo: string;
  bairro: string;
  hora: string;
}

type DiaSemana =
  | "Segunda"
  | "Terça"
  | "Quarta"
  | "Quinta"
  | "Sexta"
  | "Sábado"
  | "Domingo";

const SEMANA: { dia: DiaSemana; data: string }[] = [
  { dia: "Segunda", data: "16/06" },
  { dia: "Terça", data: "17/06" },
  { dia: "Quarta", data: "18/06" },
  { dia: "Quinta", data: "19/06" },
  { dia: "Sexta", data: "20/06" },
  { dia: "Sábado", data: "21/06" },
  { dia: "Domingo", data: "22/06" },
];

const PLANO: Record<DiaSemana, EntregaPlano[]> = {
  Segunda: [
    {
      id: "s1",
      cliente: "Distribuidora Angocler",
      produto: "Hipoclorito 25L",
      quantidade: "40 bidões",
      motorista: "Carlos Domingos",
      veiculo: "LD-12-33-MB",
      bairro: "Ingombota",
      hora: "08:00",
    },
    {
      id: "s2",
      cliente: "Hospital Josina Machel",
      produto: "Hipoclorito 5L",
      quantidade: "60 un",
      motorista: "Hélder Nascimento",
      veiculo: "LD-88-21-KC",
      bairro: "Sambizanga",
      hora: "10:30",
    },
    {
      id: "s3",
      cliente: "Kero Viana",
      produto: "Lixívia KITOKA 1L",
      quantidade: "360 un",
      motorista: "Armando Lopes",
      veiculo: "LD-45-78-XA",
      bairro: "Viana",
      hora: "09:00",
    },
  ],
  Terça: [
    {
      id: "t1",
      cliente: "Hotel Trópico",
      produto: "Lixívia KITOKA 5L",
      quantidade: "80 un",
      motorista: "Hélder Nascimento",
      veiculo: "LD-88-21-KC",
      bairro: "Alvalade",
      hora: "08:30",
    },
    {
      id: "t2",
      cliente: "Nosso Super Rocha Pinto",
      produto: "Lixívia KITOKA 1L",
      quantidade: "240 un",
      motorista: "Carlos Domingos",
      veiculo: "LD-12-33-MB",
      bairro: "Rocha Pinto",
      hora: "10:00",
    },
  ],
  Quarta: [
    {
      id: "q1",
      cliente: "Supermercado Líder",
      produto: "Lixívia KITOKA 1L",
      quantidade: "240 un",
      motorista: "Armando Lopes",
      veiculo: "LD-45-78-XA",
      bairro: "Maianga",
      hora: "07:30",
    },
    {
      id: "q2",
      cliente: "Clínica São Lucas",
      produto: "Hipoclorito 5L",
      quantidade: "24 un",
      motorista: "Carlos Domingos",
      veiculo: "LD-12-33-MB",
      bairro: "Mutamba",
      hora: "11:00",
    },
    {
      id: "q3",
      cliente: "Escola Lar do Patriota",
      produto: "Lixívia KITOKA 1L",
      quantidade: "120 un",
      motorista: "Félix Sebastião",
      veiculo: "LD-77-55-PB",
      bairro: "Cazenga",
      hora: "09:30",
    },
    {
      id: "q4",
      cliente: "Distribuidora Central Kilamba",
      produto: "Hipoclorito 10L",
      quantidade: "50 un",
      motorista: "Samuel Chitumba",
      veiculo: "LD-60-14-HV",
      bairro: "Kilamba",
      hora: "08:00",
    },
  ],
  Quinta: [
    {
      id: "qu1",
      cliente: "Kero Hiper Viana",
      produto: "Lixívia KITOKA 1L",
      quantidade: "480 un",
      motorista: "Armando Lopes",
      veiculo: "LD-45-78-XA",
      bairro: "Viana",
      hora: "08:00",
    },
    {
      id: "qu2",
      cliente: "Mercado Livre Palanca",
      produto: "Lixívia KITOKA 500ml",
      quantidade: "600 un",
      motorista: "Félix Sebastião",
      veiculo: "LD-77-55-PB",
      bairro: "Rangel",
      hora: "09:00",
    },
  ],
  Sexta: [
    {
      id: "sx1",
      cliente: "Nosso Super Talatona",
      produto: "Lixívia KITOKA 5L",
      quantidade: "180 un",
      motorista: "Armando Lopes",
      veiculo: "LD-45-78-XA",
      bairro: "Talatona",
      hora: "08:30",
    },
    {
      id: "sx2",
      cliente: "Hospital Geral de Luanda",
      produto: "Hipoclorito 25L",
      quantidade: "30 bidões",
      motorista: "Carlos Domingos",
      veiculo: "LD-12-33-MB",
      bairro: "Ingombota",
      hora: "10:00",
    },
    {
      id: "sx3",
      cliente: "Escola 23 de Março",
      produto: "Lixívia KITOKA 1L",
      quantidade: "96 un",
      motorista: "Hélder Nascimento",
      veiculo: "LD-88-21-KC",
      bairro: "Sambizanga",
      hora: "11:30",
    },
  ],
  Sábado: [
    {
      id: "sb1",
      cliente: "Distribuidora Benguela Central",
      produto: "Hipoclorito 25L + Lixívia 5L",
      quantidade: "Misto",
      motorista: "Tobias Ferreira",
      veiculo: "LD-60-14-HV",
      bairro: "Benguela",
      hora: "05:00",
    },
  ],
  Domingo: [],
};

const DIA_HOJE = "Quarta";

function EntregaChip({
  entrega,
  expanded,
}: {
  entrega: EntregaPlano;
  expanded: boolean;
}) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-2 text-xs space-y-1">
      <p className="font-semibold text-blue-900 dark:text-blue-200 leading-tight truncate">
        {entrega.hora} — {entrega.cliente}
      </p>
      {expanded && (
        <>
          <p className="text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <Package className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {entrega.produto} ({entrega.quantidade})
            </span>
          </p>
          <p className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{entrega.motorista}</span>
          </p>
          <p className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Truck className="h-3 w-3 flex-shrink-0" />
            <span className="font-mono">{entrega.veiculo}</span>
          </p>
        </>
      )}
      {!expanded && (
        <p className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{entrega.motorista}</span>
        </p>
      )}
    </div>
  );
}

export default function DistribuicaoPage() {
  const [expanded, setExpanded] = useState(false);

  const totalSemana = Object.values(PLANO).reduce(
    (s, arr) => s + arr.length,
    0
  );
  const totalHoje = PLANO[DIA_HOJE as DiaSemana]?.length ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-ink" />
          <div>
            <h1 className="text-2xl font-bold">Plano de Distribuição</h1>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Calendário semanal de entregas — semana de 16 a 22 de Junho de 2026
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 w-fit">
          Novo
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-xl border border-violet-200 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-800 px-4 py-3 flex items-center gap-2 text-sm text-violet-800 dark:text-violet-300">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Módulo em desenvolvimento — dados de demonstração para validação.</span>
      </div>

      {/* Resumo semana */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Entregas na Semana", value: totalSemana, color: "text-ink" },
          { label: "Entregas Hoje (Qua)", value: totalHoje, color: "text-amber" },
          {
            label: "Dias com Entregas",
            value: Object.values(PLANO).filter((d) => d.length > 0).length,
            color: "text-live",
          },
          {
            label: "Dias Sem Entregas",
            value: Object.values(PLANO).filter((d) => d.length === 0).length,
            color: "text-ink-mid/70",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-panel dark:bg-panel rounded-xl p-4 shadow text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controlo de vista */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 text-sm text-ink hover:text-ink/80 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors bg-panel dark:bg-panel border border-ink-ghost/60 dark:border-ink-ghost/20 rounded-lg px-4 py-2 shadow-sm"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Vista compacta
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Vista expandida
            </>
          )}
        </button>
      </div>

      {/* Calendário semanal — tabela 7 colunas */}
      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr>
              {SEMANA.map(({ dia, data }) => (
                <th
                  key={dia}
                  className={`px-3 py-3 text-center border-b border-ink-ghost/40 dark:border-ink-ghost/15 font-semibold ${
                    dia === DIA_HOJE
                      ? "bg-ink text-white rounded-t-sm"
                      : "bg-surface dark:bg-ink-ghost/20 text-ink-mid dark:text-gray-300"
                  }`}
                >
                  <p className="text-xs font-bold">{dia}</p>
                  <p
                    className={`text-xs mt-0.5 ${
                      dia === DIA_HOJE
                        ? "text-blue-100"
                        : "text-ink-mid/50 dark:text-ink-mid/40"
                    }`}
                  >
                    {data}
                  </p>
                  <span
                    className={`inline-block text-xs rounded-full px-1.5 py-0.5 mt-1 font-normal ${
                      dia === DIA_HOJE
                        ? "bg-live text-white"
                        : "bg-ink-ghost/30 dark:bg-ink-ghost/20 text-ink-mid dark:text-gray-300"
                    }`}
                  >
                    {PLANO[dia].length} entrega{PLANO[dia].length !== 1 ? "s" : ""}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="align-top">
              {SEMANA.map(({ dia }) => (
                <td
                  key={dia}
                  className={`px-2 py-3 border-r last:border-r-0 border-ink-ghost/40 dark:border-ink-ghost/15 ${
                    dia === DIA_HOJE ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  {PLANO[dia].length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-300 dark:text-gray-600">
                        Sem entregas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {PLANO[dia].map((entrega) => (
                        <EntregaChip
                          key={entrega.id}
                          entrega={entrega}
                          expanded={expanded}
                        />
                      ))}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="bg-panel dark:bg-panel rounded-xl shadow px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-mid/50 mb-3">
          Legenda
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-ink" />
            <span className="text-ink-mid dark:text-gray-300">Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
            <span className="text-ink-mid dark:text-gray-300">Entrega agendada</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-ink-mid/50" />
            <span className="text-ink-mid dark:text-gray-300">Motorista</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-3 w-3 text-ink-mid/50" />
            <span className="text-ink-mid dark:text-gray-300">Matrícula do veículo</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3 text-ink-mid/50" />
            <span className="text-ink-mid dark:text-gray-300">Produto e quantidade (vista expandida)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
