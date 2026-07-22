"use client";
import {
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  User,
} from "lucide-react";

type EstadoEntrega = "Agendada" | "Em rota" | "Entregue" | "Falhou";

interface Entrega {
  id: string;
  numero: string;
  cliente: string;
  endereco: string;
  bairro: string;
  produto: string;
  quantidade: string;
  motorista: string;
  veiculo: string;
  dataPrevista: string;
  estado: EstadoEntrega;
}

const ENTREGAS: Entrega[] = [
  {
    id: "1",
    numero: "ENT-2026-0412",
    cliente: "Supermercado Líder",
    endereco: "Rua da Missão, 45",
    bairro: "Maianga",
    produto: "Lixívia KITOKA 1L",
    quantidade: "240 un",
    motorista: "Armando Lopes",
    veiculo: "LD-45-78-XA",
    dataPrevista: "2026-06-18",
    estado: "Em rota",
  },
  {
    id: "2",
    numero: "ENT-2026-0413",
    cliente: "Distribuidora Angocler",
    endereco: "Av. Murtala Mohammed, 12",
    bairro: "Ingombota",
    produto: "Hipoclorito de Sódio 25L",
    quantidade: "40 bidões",
    motorista: "Carlos Domingos",
    veiculo: "LD-12-33-MB",
    dataPrevista: "2026-06-18",
    estado: "Entregue",
  },
  {
    id: "3",
    numero: "ENT-2026-0414",
    cliente: "Hotel Trópico",
    endereco: "Rua da Liberdade, 1",
    bairro: "Alvalade",
    produto: "Lixívia KITOKA 5L",
    quantidade: "60 un",
    motorista: "Hélder Nascimento",
    veiculo: "LD-88-21-KC",
    dataPrevista: "2026-06-18",
    estado: "Agendada",
  },
  {
    id: "4",
    numero: "ENT-2026-0415",
    cliente: "Kero Hiper Viana",
    endereco: "Estrada de Viana, 200",
    bairro: "Viana",
    produto: "Lixívia KITOKA 1L",
    quantidade: "480 un",
    motorista: "Armando Lopes",
    veiculo: "LD-45-78-XA",
    dataPrevista: "2026-06-19",
    estado: "Agendada",
  },
  {
    id: "5",
    numero: "ENT-2026-0416",
    cliente: "Clínica São Lucas",
    endereco: "Av. 4 de Fevereiro, 67",
    bairro: "Mutamba",
    produto: "Hipoclorito de Sódio 5L",
    quantidade: "24 un",
    motorista: "Carlos Domingos",
    veiculo: "LD-12-33-MB",
    dataPrevista: "2026-06-18",
    estado: "Falhou",
  },
  {
    id: "6",
    numero: "ENT-2026-0417",
    cliente: "Mercado Livre Palanca",
    endereco: "Rua Amílcar Cabral, 88",
    bairro: "Rangel",
    produto: "Lixívia KITOKA 500ml",
    quantidade: "600 un",
    motorista: "Félix Sebastião",
    veiculo: "LD-77-55-PB",
    dataPrevista: "2026-06-19",
    estado: "Agendada",
  },
  {
    id: "7",
    numero: "ENT-2026-0418",
    cliente: "Hospital Josina Machel",
    endereco: "Av. Ho Chi Min, 101",
    bairro: "Sambizanga",
    produto: "Hipoclorito de Sódio 25L",
    quantidade: "20 bidões",
    motorista: "Hélder Nascimento",
    veiculo: "LD-88-21-KC",
    dataPrevista: "2026-06-20",
    estado: "Agendada",
  },
  {
    id: "8",
    numero: "ENT-2026-0419",
    cliente: "Escola Lar do Patriota",
    endereco: "Rua Che Guevara, 14",
    bairro: "Cazenga",
    produto: "Lixívia KITOKA 1L",
    quantidade: "120 un",
    motorista: "Félix Sebastião",
    veiculo: "LD-77-55-PB",
    dataPrevista: "2026-06-20",
    estado: "Agendada",
  },
  {
    id: "9",
    numero: "ENT-2026-0420",
    cliente: "Nosso Super Talatona",
    endereco: "Av. Pedro de Castro Van-Dúnem, 5",
    bairro: "Talatona",
    produto: "Lixívia KITOKA 5L",
    quantidade: "180 un",
    motorista: "Armando Lopes",
    veiculo: "LD-45-78-XA",
    dataPrevista: "2026-06-20",
    estado: "Agendada",
  },
  {
    id: "10",
    numero: "ENT-2026-0421",
    cliente: "Distribuidora Central Kilamba",
    endereco: "Bloco D, Rua 4",
    bairro: "Kilamba",
    produto: "Hipoclorito de Sódio 10L",
    quantidade: "50 un",
    motorista: "Carlos Domingos",
    veiculo: "LD-12-33-MB",
    dataPrevista: "2026-06-21",
    estado: "Agendada",
  },
];

const ESTADO_CONFIG: Record<
  EstadoEntrega,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  Agendada: {
    label: "Agendada",
    classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    icon: <Calendar className="h-3 w-3" />,
  },
  "Em rota": {
    label: "Em rota",
    classes:
      "bg-amber/15 text-amber dark:bg-amber-900/40 dark:text-amber-300",
    icon: <Clock className="h-3 w-3" />,
  },
  Entregue: {
    label: "Entregue",
    classes:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  Falhou: {
    label: "Falhou",
    classes: "bg-danger/10 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    icon: <XCircle className="h-3 w-3" />,
  },
};

function KPICard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-panel dark:bg-panel rounded-xl p-4 shadow flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && (
          <p className="text-xs text-ink-mid/50 dark:text-ink-mid/40 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

const HOJE = "2026-06-18";

export default function EntregasPage() {
  const hoje = ENTREGAS.filter((e) => e.dataPrevista === HOJE);
  const emRota = ENTREGAS.filter((e) => e.estado === "Em rota").length;
  const entregues = ENTREGAS.filter((e) => e.estado === "Entregue").length;
  const falhadas = ENTREGAS.filter((e) => e.estado === "Falhou").length;
  const agendadas = ENTREGAS.filter((e) => e.estado === "Agendada").length;

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Truck className="h-7 w-7 text-ink" />
          <div>
            <h1 className="text-2xl font-bold">Entregas</h1>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Gestão e acompanhamento de todas as entregas ao cliente
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 w-fit">
          <AlertCircle className="h-3 w-3" />
          Módulo em desenvolvimento
        </span>
      </div>

      {/* Banner */}
      <div className="rounded-xl border border-violet-200 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-800 px-4 py-3 flex items-center gap-2 text-sm text-violet-800 dark:text-violet-300">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Módulo em desenvolvimento — dados de demonstração para validação.</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Hoje"
          value={hoje.length}
          sub={`entregas para ${HOJE}`}
          color="bg-blue-100 text-ink dark:bg-blue-900/40"
          icon={<Calendar className="h-5 w-5" />}
        />
        <KPICard
          label="Em rota"
          value={emRota}
          sub="em trânsito agora"
          color="bg-amber/15 text-amber dark:bg-amber-900/40"
          icon={<Truck className="h-5 w-5" />}
        />
        <KPICard
          label="Entregues"
          value={entregues}
          sub="confirmadas hoje"
          color="bg-green-100 text-live dark:bg-green-900/40"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KPICard
          label="Falhadas"
          value={falhadas}
          sub="requerem reação"
          color="bg-danger/10 text-danger dark:bg-red-900/40"
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Tabela */}
      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-x-auto">
        <div className="px-5 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15 flex items-center justify-between">
          <h2 className="font-semibold text-sm">
            Todas as Entregas{" "}
            <span className="text-ink-mid/50 font-normal">
              ({ENTREGAS.length} registos)
            </span>
          </h2>
          <span className="text-xs text-ink-mid/50">
            {agendadas} agendadas pendentes
          </span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface dark:bg-ink-ghost/20 text-left text-xs uppercase tracking-wide text-ink-mid/70">
            <tr>
              <th className="px-4 py-3">Nº Entrega</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Endereço / Bairro
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Produto
                </span>
              </th>
              <th className="px-4 py-3">Qtd</th>
              <th className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Motorista
                </span>
              </th>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Data Prevista</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {ENTREGAS.map((entrega) => {
              const cfg = ESTADO_CONFIG[entrega.estado];
              return (
                <tr
                  key={entrega.id}
                  className="hover:bg-surface dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-ink font-medium">
                    {entrega.numero}
                  </td>
                  <td className="px-4 py-3 font-medium">{entrega.cliente}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-ink-mid/70">{entrega.endereco}</p>
                    <p className="font-medium text-xs mt-0.5">{entrega.bairro}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{entrega.produto}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{entrega.quantidade}</td>
                  <td className="px-4 py-3">{entrega.motorista}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {entrega.veiculo}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-xs">
                    {entrega.dataPrevista}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
