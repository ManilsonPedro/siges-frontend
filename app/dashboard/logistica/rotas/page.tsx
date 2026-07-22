"use client";
import {
  Map,
  MapPin,
  User,
  Gauge,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

type Frequencia = "Diária" | "Semanal" | "Quinzenal";

interface Paragem {
  ordem: number;
  local: string;
  bairro: string;
  tempoParagem: string;
}

interface Rota {
  id: string;
  nome: string;
  zona: string;
  motorista: string;
  distanciaKm: number;
  tempoEstimado: string;
  frequencia: Frequencia;
  activa: boolean;
  paragens: Paragem[];
}

const ROTAS: Rota[] = [
  {
    id: "1",
    nome: "Rota Luanda Norte",
    zona: "Luanda Norte",
    motorista: "Armando Lopes",
    distanciaKm: 42,
    tempoEstimado: "3h 20min",
    frequencia: "Diária",
    activa: true,
    paragens: [
      { ordem: 1, local: "Fábrica Aquasan", bairro: "Viana", tempoParagem: "30min (carga)" },
      { ordem: 2, local: "Nosso Super Cacuaco", bairro: "Cacuaco", tempoParagem: "20min" },
      { ordem: 3, local: "Mercado Asa Branca", bairro: "Asa Branca", tempoParagem: "15min" },
      { ordem: 4, local: "Distribuidora Kikuxi", bairro: "Kikuxi", tempoParagem: "25min" },
      { ordem: 5, local: "Escola Cazenga", bairro: "Cazenga", tempoParagem: "10min" },
    ],
  },
  {
    id: "2",
    nome: "Rota Luanda Sul",
    zona: "Luanda Sul",
    motorista: "Carlos Domingos",
    distanciaKm: 38,
    tempoEstimado: "3h 00min",
    frequencia: "Diária",
    activa: true,
    paragens: [
      { ordem: 1, local: "Fábrica Aquasan", bairro: "Viana", tempoParagem: "30min (carga)" },
      { ordem: 2, local: "Nosso Super Talatona", bairro: "Talatona", tempoParagem: "25min" },
      { ordem: 3, local: "Mercado Benfica", bairro: "Benfica", tempoParagem: "20min" },
      { ordem: 4, local: "Kero Patriota", bairro: "Patriota", tempoParagem: "20min" },
    ],
  },
  {
    id: "3",
    nome: "Rota Luanda Centro",
    zona: "Luanda Centro",
    motorista: "Hélder Nascimento",
    distanciaKm: 28,
    tempoEstimado: "2h 30min",
    frequencia: "Diária",
    activa: true,
    paragens: [
      { ordem: 1, local: "Fábrica Aquasan", bairro: "Viana", tempoParagem: "30min (carga)" },
      { ordem: 2, local: "Hotel Trópico", bairro: "Alvalade", tempoParagem: "15min" },
      { ordem: 3, local: "Clínica Sagrada Esperança", bairro: "Miramar", tempoParagem: "15min" },
      { ordem: 4, local: "Supermercado Líder Ingombota", bairro: "Ingombota", tempoParagem: "20min" },
      { ordem: 5, local: "Hospital Josina Machel", bairro: "Sambizanga", tempoParagem: "15min" },
      { ordem: 6, local: "Distribuidora Rangel", bairro: "Rangel", tempoParagem: "20min" },
    ],
  },
  {
    id: "4",
    nome: "Rota Luanda Leste",
    zona: "Luanda Leste",
    motorista: "Félix Sebastião",
    distanciaKm: 55,
    tempoEstimado: "4h 00min",
    frequencia: "Semanal",
    activa: true,
    paragens: [
      { ordem: 1, local: "Fábrica Aquasan", bairro: "Viana", tempoParagem: "30min (carga)" },
      { ordem: 2, local: "Distribuidora Kilamba", bairro: "Kilamba", tempoParagem: "30min" },
      { ordem: 3, local: "Mercado Camama", bairro: "Camama", tempoParagem: "20min" },
      { ordem: 4, local: "Polo Industrial Viana", bairro: "Viana", tempoParagem: "25min" },
    ],
  },
  {
    id: "5",
    nome: "Rota Benguela",
    zona: "Benguela",
    motorista: "Tobias Ferreira",
    distanciaKm: 520,
    tempoEstimado: "6h 30min",
    frequencia: "Semanal",
    activa: true,
    paragens: [
      { ordem: 1, local: "Fábrica Aquasan", bairro: "Viana", tempoParagem: "45min (carga)" },
      { ordem: 2, local: "Distribuidora Benguela Central", bairro: "Centro Benguela", tempoParagem: "40min" },
      { ordem: 3, local: "Supermercado Benguela", bairro: "Bairro Popular", tempoParagem: "30min" },
      { ordem: 4, local: "Hospital Geral de Benguela", bairro: "Benguela", tempoParagem: "20min" },
    ],
  },
  {
    id: "6",
    nome: "Rota Huambo",
    zona: "Huambo",
    motorista: "Samuel Chitumba",
    distanciaKm: 610,
    tempoEstimado: "8h 00min",
    frequencia: "Quinzenal",
    activa: false,
    paragens: [
      { ordem: 1, local: "Fábrica Aquasan", bairro: "Viana", tempoParagem: "45min (carga)" },
      { ordem: 2, local: "Distribuidora Huambo Norte", bairro: "Huambo Centro", tempoParagem: "45min" },
      { ordem: 3, local: "Mercado Huambo", bairro: "Bairro Académico", tempoParagem: "30min" },
    ],
  },
];

const FREQ_CLASSES: Record<Frequencia, string> = {
  Diária: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Semanal: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Quinzenal: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

function RotaCard({ rota }: { rota: Rota }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 mt-0.5">
              <Map className="h-5 w-5 text-ink" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base">{rota.nome}</h3>
                {!rota.activa && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-surface text-ink-mid/70 dark:bg-ink-ghost/20 dark:text-ink-mid/50">
                    Inactiva
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-0.5">
                Zona: {rota.zona}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${FREQ_CLASSES[rota.frequencia]}`}
          >
            <RefreshCw className="h-3 w-3" />
            {rota.frequencia}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-ink-mid/50" />
            <span className="text-ink-mid dark:text-gray-300">{rota.motorista}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4 text-ink-mid/50" />
            <span className="text-ink-mid dark:text-gray-300">{rota.distanciaKm} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-ink-mid/50" />
            <span className="text-ink-mid dark:text-gray-300">{rota.tempoEstimado}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-ink-mid/50" />
            <span className="text-ink-mid dark:text-gray-300">
              {rota.paragens.length} paragens
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-xs text-ink hover:text-ink/80 transition-colors font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" /> Ocultar paragens
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> Ver paragens
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-ink-ghost/40 dark:border-ink-ghost/15 bg-surface dark:bg-gray-800/50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-mid/50 mb-3">
            Sequência de Paragens
          </p>
          <ol className="space-y-2">
            {rota.paragens.map((p) => (
              <li key={p.ordem} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink text-white text-xs flex items-center justify-center font-bold mt-0.5">
                  {p.ordem}
                </span>
                <div className="flex-1">
                  <span className="font-medium">{p.local}</span>
                  <span className="text-ink-mid/70 dark:text-ink-mid/60 ml-2">
                    — {p.bairro}
                  </span>
                </div>
                <span className="text-xs text-ink-mid/50 whitespace-nowrap">{p.tempoParagem}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function RotasPage() {
  const activas = ROTAS.filter((r) => r.activa).length;
  const totalKm = ROTAS.filter((r) => r.activa).reduce((s, r) => s + r.distanciaKm, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Map className="h-7 w-7 text-ink" />
          <div>
            <h1 className="text-2xl font-bold">Rotas de Distribuição</h1>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Planeamento e gestão das rotas de entrega da Aquasan Angola
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

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Rotas Activas", value: activas, color: "text-live" },
          { label: "Rotas Inactivas", value: ROTAS.length - activas, color: "text-ink-mid/70" },
          { label: "Total Rotas", value: ROTAS.length, color: "text-ink" },
          { label: "Km Totais/Dia", value: `${totalKm} km`, color: "text-amber" },
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

      {/* Lista de rotas */}
      <div className="space-y-4">
        {ROTAS.map((rota) => (
          <RotaCard key={rota.id} rota={rota} />
        ))}
      </div>
    </div>
  );
}
