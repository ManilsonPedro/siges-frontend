"use client";
import {
  Truck,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Package,
  Info,
} from "lucide-react";

type EstadoVeiculo = "Disponível" | "Em rota" | "Manutenção";
type TipoVeiculo = "Caminhão" | "Furgão" | "Pick-up";

interface Veiculo {
  id: string;
  matricula: string;
  marca: string;
  modelo: string;
  ano: number;
  tipo: TipoVeiculo;
  capacidadeKg: number;
  estado: EstadoVeiculo;
  motoristaPrincipal: string;
  kmActuais: number;
  proximaRevisao: string;
  ultimaRevisao: string;
  observacoes?: string;
}

const FROTA: Veiculo[] = [
  {
    id: "1",
    matricula: "LD-45-78-XA",
    marca: "Mercedes-Benz",
    modelo: "Actros 1840",
    ano: 2021,
    tipo: "Caminhão",
    capacidadeKg: 18000,
    estado: "Em rota",
    motoristaPrincipal: "Armando Lopes",
    kmActuais: 87450,
    proximaRevisao: "2026-07-15",
    ultimaRevisao: "2026-04-15",
    observacoes: "Revisão de 90.000 km agendada",
  },
  {
    id: "2",
    matricula: "LD-12-33-MB",
    marca: "Toyota",
    modelo: "Dyna 150",
    ano: 2020,
    tipo: "Furgão",
    capacidadeKg: 3500,
    estado: "Em rota",
    motoristaPrincipal: "Carlos Domingos",
    kmActuais: 112300,
    proximaRevisao: "2026-06-30",
    ultimaRevisao: "2026-03-30",
  },
  {
    id: "3",
    matricula: "LD-88-21-KC",
    marca: "Mitsubishi",
    modelo: "Canter 7C15",
    ano: 2022,
    tipo: "Furgão",
    capacidadeKg: 4200,
    estado: "Disponível",
    motoristaPrincipal: "Hélder Nascimento",
    kmActuais: 45670,
    proximaRevisao: "2026-09-10",
    ultimaRevisao: "2026-06-10",
  },
  {
    id: "4",
    matricula: "LD-77-55-PB",
    marca: "Nissan",
    modelo: "Navara NP300",
    ano: 2023,
    tipo: "Pick-up",
    capacidadeKg: 1200,
    estado: "Disponível",
    motoristaPrincipal: "Félix Sebastião",
    kmActuais: 29800,
    proximaRevisao: "2026-12-01",
    ultimaRevisao: "2026-06-01",
  },
  {
    id: "5",
    matricula: "LD-33-90-TA",
    marca: "Isuzu",
    modelo: "NLR 150",
    ano: 2019,
    tipo: "Furgão",
    capacidadeKg: 3000,
    estado: "Manutenção",
    motoristaPrincipal: "Tobias Ferreira",
    kmActuais: 198500,
    proximaRevisao: "2026-07-01",
    ultimaRevisao: "2026-01-10",
    observacoes: "Troca de embraiagem — oficina parceira AutoLuanda",
  },
  {
    id: "6",
    matricula: "LD-60-14-HV",
    marca: "Mercedes-Benz",
    modelo: "Atego 1725",
    ano: 2020,
    tipo: "Caminhão",
    capacidadeKg: 12000,
    estado: "Disponível",
    motoristaPrincipal: "Samuel Chitumba",
    kmActuais: 134200,
    proximaRevisao: "2026-08-20",
    ultimaRevisao: "2026-05-20",
  },
  {
    id: "7",
    matricula: "LD-22-08-VQ",
    marca: "Toyota",
    modelo: "Hilux 2.8 GD",
    ano: 2024,
    tipo: "Pick-up",
    capacidadeKg: 1000,
    estado: "Disponível",
    motoristaPrincipal: "—",
    kmActuais: 8900,
    proximaRevisao: "2026-12-15",
    ultimaRevisao: "2026-06-15",
    observacoes: "Viatura nova — aguarda alocação de motorista",
  },
];

const ESTADO_CONFIG: Record<
  EstadoVeiculo,
  { classes: string; icon: React.ReactNode; dot: string }
> = {
  Disponível: {
    classes: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    dot: "bg-live",
  },
  "Em rota": {
    classes: "bg-amber/15 text-amber dark:bg-amber-900/40 dark:text-amber-300",
    icon: <Truck className="h-3.5 w-3.5" />,
    dot: "bg-amber",
  },
  Manutenção: {
    classes: "bg-danger/10 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    icon: <Wrench className="h-3.5 w-3.5" />,
    dot: "bg-danger",
  },
};

const TIPO_ICON: Record<TipoVeiculo, React.ReactNode> = {
  Caminhão: <Truck className="h-6 w-6 text-ink" />,
  Furgão: <Truck className="h-6 w-6 text-indigo-600" />,
  "Pick-up": <Truck className="h-6 w-6 text-teal-600" />,
};

function VeiculoCard({ veiculo }: { veiculo: Veiculo }) {
  const cfg = ESTADO_CONFIG[veiculo.estado];
  const revisaoProxima =
    new Date(veiculo.proximaRevisao) <= new Date("2026-07-01");

  return (
    <div className="bg-panel dark:bg-panel rounded-xl shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface dark:bg-surface">
            {TIPO_ICON[veiculo.tipo]}
          </div>
          <div>
            <p className="font-mono font-bold text-lg tracking-wider">
              {veiculo.matricula}
            </p>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              {veiculo.marca} {veiculo.modelo} ({veiculo.ano})
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}
        >
          {cfg.icon}
          {veiculo.estado}
        </span>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-0.5">
          <p className="text-xs text-ink-mid/50 uppercase tracking-wide">Tipo</p>
          <p className="font-medium">{veiculo.tipo}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-ink-mid/50 uppercase tracking-wide">Capacidade</p>
          <div className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5 text-ink-mid/50" />
            <p className="font-medium">{veiculo.capacidadeKg.toLocaleString("pt-AO")} kg</p>
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-ink-mid/50 uppercase tracking-wide">Motorista</p>
          <p className="font-medium truncate">{veiculo.motoristaPrincipal}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-ink-mid/50 uppercase tracking-wide">Km Actuais</p>
          <p className="font-medium tabular-nums">{veiculo.kmActuais.toLocaleString("pt-AO")} km</p>
        </div>
      </div>

      {/* Revisão */}
      <div
        className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
          revisaoProxima
            ? "bg-amber/8 text-amber dark:bg-amber/10 dark:text-amber"
            : "bg-surface text-ink-mid/70 dark:bg-surface dark:bg-ink-ghost/20 dark:text-ink-mid/60"
        }`}
      >
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          Próxima revisão: <span className="font-semibold">{veiculo.proximaRevisao}</span>
        </span>
        {revisaoProxima && (
          <span className="ml-auto font-semibold text-amber dark:text-amber">
            Em breve
          </span>
        )}
      </div>

      {/* Observações */}
      {veiculo.observacoes && (
        <div className="flex items-start gap-2 text-xs text-ink-mid/70 dark:text-ink-mid/60">
          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>{veiculo.observacoes}</span>
        </div>
      )}
    </div>
  );
}

export default function FrotaPage() {
  const disponiveis = FROTA.filter((v) => v.estado === "Disponível").length;
  const emRota = FROTA.filter((v) => v.estado === "Em rota").length;
  const manutencao = FROTA.filter((v) => v.estado === "Manutenção").length;
  const totalCapacidade = FROTA.reduce((s, v) => s + v.capacidadeKg, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Truck className="h-7 w-7 text-ink" />
          <div>
            <h1 className="text-2xl font-bold">Frota de Veículos</h1>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Gestão da frota de distribuição da Aquasan Angola
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

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Disponíveis", value: disponiveis, classes: "text-live" },
          { label: "Em Rota", value: emRota, classes: "text-amber" },
          { label: "Em Manutenção", value: manutencao, classes: "text-danger" },
          {
            label: "Cap. Total",
            value: `${(totalCapacidade / 1000).toFixed(0)}t`,
            classes: "text-ink",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-panel dark:bg-panel rounded-xl p-4 shadow text-center"
          >
            <p className={`text-2xl font-bold ${s.classes}`}>{s.value}</p>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards por viatura */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {FROTA.map((veiculo) => (
          <VeiculoCard key={veiculo.id} veiculo={veiculo} />
        ))}
      </div>
    </div>
  );
}
