"use client";
import {
  User,
  Phone,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Coffee,
  AlertCircle,
  PackageCheck,
} from "lucide-react";

type EstadoMotorista = "Disponível" | "Em rota" | "Folga";
type CategoriaCarita = "B" | "C" | "D" | "CE";

interface Motorista {
  id: string;
  nome: string;
  cartaConducao: string;
  categoria: CategoriaCarita;
  contacto: string;
  veiculoAlocado: string;
  matriculaVeiculo: string;
  estado: EstadoMotorista;
  entregasMes: number;
  dataAdmissao: string;
  bairro: string;
}

const MOTORISTAS: Motorista[] = [
  {
    id: "1",
    nome: "Armando Lopes",
    cartaConducao: "AO-LD-2018-045321",
    categoria: "CE",
    contacto: "+244 923 456 789",
    veiculoAlocado: "Mercedes-Benz Actros 1840",
    matriculaVeiculo: "LD-45-78-XA",
    estado: "Em rota",
    entregasMes: 28,
    dataAdmissao: "2020-03-15",
    bairro: "Cazenga",
  },
  {
    id: "2",
    nome: "Carlos Domingos",
    cartaConducao: "AO-LD-2015-012876",
    categoria: "C",
    contacto: "+244 912 345 678",
    veiculoAlocado: "Toyota Dyna 150",
    matriculaVeiculo: "LD-12-33-MB",
    estado: "Em rota",
    entregasMes: 34,
    dataAdmissao: "2018-07-01",
    bairro: "Rangel",
  },
  {
    id: "3",
    nome: "Hélder Nascimento",
    cartaConducao: "AO-LD-2019-098543",
    categoria: "C",
    contacto: "+244 934 567 890",
    veiculoAlocado: "Mitsubishi Canter 7C15",
    matriculaVeiculo: "LD-88-21-KC",
    estado: "Disponível",
    entregasMes: 22,
    dataAdmissao: "2021-01-10",
    bairro: "Maianga",
  },
  {
    id: "4",
    nome: "Félix Sebastião",
    cartaConducao: "AO-LD-2020-067234",
    categoria: "B",
    contacto: "+244 945 678 901",
    veiculoAlocado: "Nissan Navara NP300",
    matriculaVeiculo: "LD-77-55-PB",
    estado: "Disponível",
    entregasMes: 18,
    dataAdmissao: "2022-06-20",
    bairro: "Viana",
  },
  {
    id: "5",
    nome: "Tobias Ferreira",
    cartaConducao: "AO-LD-2012-034567",
    categoria: "CE",
    contacto: "+244 956 789 012",
    veiculoAlocado: "Isuzu NLR 150 (em manutenção)",
    matriculaVeiculo: "LD-33-90-TA",
    estado: "Folga",
    entregasMes: 15,
    dataAdmissao: "2015-04-12",
    bairro: "Cacuaco",
  },
  {
    id: "6",
    nome: "Samuel Chitumba",
    cartaConducao: "AO-LD-2017-089123",
    categoria: "CE",
    contacto: "+244 967 890 123",
    veiculoAlocado: "Mercedes-Benz Atego 1725",
    matriculaVeiculo: "LD-60-14-HV",
    estado: "Disponível",
    entregasMes: 10,
    dataAdmissao: "2023-09-05",
    bairro: "Kilamba",
  },
  {
    id: "7",
    nome: "Bernardo Afonso",
    cartaConducao: "AO-LD-2021-011890",
    categoria: "B",
    contacto: "+244 978 901 234",
    veiculoAlocado: "—",
    matriculaVeiculo: "—",
    estado: "Disponível",
    entregasMes: 0,
    dataAdmissao: "2026-05-01",
    bairro: "Talatona",
  },
  {
    id: "8",
    nome: "Pedro Maquengo",
    cartaConducao: "AO-LD-2016-056712",
    categoria: "D",
    contacto: "+244 989 012 345",
    veiculoAlocado: "Toyota Dyna 150 (reserva)",
    matriculaVeiculo: "LD-12-33-MB",
    estado: "Folga",
    entregasMes: 8,
    dataAdmissao: "2019-11-22",
    bairro: "Sambizanga",
  },
];

const ESTADO_CONFIG: Record<
  EstadoMotorista,
  { classes: string; icon: React.ReactNode }
> = {
  Disponível: {
    classes: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  "Em rota": {
    classes: "bg-amber/15 text-amber dark:bg-amber-900/40 dark:text-amber-300",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  Folga: {
    classes: "bg-surface text-ink-mid dark:bg-surface dark:bg-ink-ghost/20 dark:text-ink-mid/50",
    icon: <Coffee className="h-3.5 w-3.5" />,
  },
};

const CAT_CLASSES: Record<CategoriaCarita, string> = {
  B: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  C: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  D: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  CE: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function MotoristasPage() {
  const disponiveis = MOTORISTAS.filter((m) => m.estado === "Disponível").length;
  const emRota = MOTORISTAS.filter((m) => m.estado === "Em rota").length;
  const folga = MOTORISTAS.filter((m) => m.estado === "Folga").length;
  const totalEntregas = MOTORISTAS.reduce((s, m) => s + m.entregasMes, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <User className="h-7 w-7 text-ink" />
          <div>
            <h1 className="text-2xl font-bold">Motoristas</h1>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Equipa de condutores e distribuição da Aquasan Angola
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

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Disponíveis", value: disponiveis, classes: "text-live" },
          { label: "Em Rota", value: emRota, classes: "text-amber" },
          { label: "De Folga", value: folga, classes: "text-ink-mid/70" },
          { label: "Entregas no Mês", value: totalEntregas, classes: "text-ink" },
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

      {/* Tabela */}
      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-x-auto">
        <div className="px-5 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
          <h2 className="font-semibold text-sm">
            Lista de Motoristas{" "}
            <span className="text-ink-mid/50 font-normal">
              ({MOTORISTAS.length} registos)
            </span>
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface dark:bg-surface dark:bg-ink-ghost/20 text-left text-xs uppercase tracking-wide text-ink-mid/70">
            <tr>
              <th className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Nome
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Carta / Categoria
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Contacto
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Veículo Alocado
                </span>
              </th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">
                <span className="flex items-center gap-1">
                  <PackageCheck className="h-3 w-3" />
                  Entregas (Mês)
                </span>
              </th>
              <th className="px-4 py-3">Admissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {MOTORISTAS.map((m) => {
              const cfg = ESTADO_CONFIG[m.estado];
              return (
                <tr
                  key={m.id}
                  className="hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0">
                        {m.nome
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium">{m.nome}</p>
                        <p className="text-xs text-ink-mid/50">{m.bairro}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs">{m.cartaConducao}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${CAT_CLASSES[m.categoria]}`}
                    >
                      Cat. {m.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{m.contacto}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{m.veiculoAlocado}</p>
                    {m.matriculaVeiculo !== "—" && (
                      <p className="font-mono text-xs text-ink-mid/50 mt-0.5">
                        {m.matriculaVeiculo}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}
                    >
                      {cfg.icon}
                      {m.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">{m.entregasMes}</span>
                      {m.entregasMes >= 30 && (
                        <span className="text-xs text-live dark:text-live font-medium">
                          Top
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-xs text-ink-mid/70">
                    {m.dataAdmissao}
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
