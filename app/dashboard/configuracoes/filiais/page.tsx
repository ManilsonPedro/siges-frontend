"use client";

import {
  Building2,
  Plus,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

const filiais = [
  {
    id: 1,
    nome: "Sede — Viana",
    cidade: "Luanda",
    morada: "Rua da Indústria, Zona Industrial de Viana, Luanda",
    responsavel: "Beatriz Venâncio",
    telefone: "+244 923 456 789",
    estado: "Activa",
    principal: true,
  },
  {
    id: 2,
    nome: "Filial Talatona",
    cidade: "Luanda",
    morada: "Av. Pedro de Van-Dúnem, Talatona, Luanda Sul",
    responsavel: "Carlos Domingos Neto",
    telefone: "+244 912 345 678",
    estado: "Activa",
    principal: false,
  },
  {
    id: 3,
    nome: "Filial Benguela",
    cidade: "Benguela",
    morada: "Rua Comandante Gika, n.º 42, Benguela",
    responsavel: "Maria Luísa Carvalho",
    telefone: "+244 934 567 890",
    estado: "Activa",
    principal: false,
  },
  {
    id: 4,
    nome: "Filial Lobito",
    cidade: "Benguela",
    morada: "Av. da Independência, Lobito",
    responsavel: "António Sebastião Lopes",
    telefone: "+244 945 678 901",
    estado: "Inactiva",
    principal: false,
  },
  {
    id: 5,
    nome: "Filial Huambo",
    cidade: "Huambo",
    morada: "Rua da República, n.º 115, Huambo",
    responsavel: "Fernanda Quissanga",
    telefone: "+244 956 789 012",
    estado: "Activa",
    principal: false,
  },
  {
    id: 6,
    nome: "Armazém Central",
    cidade: "Luanda",
    morada: "Zona Franca do Porto de Luanda, Galpão 7",
    responsavel: "João Muanda Silva",
    telefone: "+244 967 890 123",
    estado: "Activa",
    principal: false,
  },
];

const cidadeCor: Record<string, string> = {
  Luanda:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Benguela:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Huambo:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

export default function FiliaisPage() {
  const activas = filiais.filter((f) => f.estado === "Activa").length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Filiais da Empresa
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
              <Sparkles className="w-3 h-3" />
              Novo
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestão de filiais e locais da Aquasan Angola
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Nova Filial
        </button>
      </div>

      {/* Banner módulo novo */}
      <div className="flex items-start gap-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-4 py-3">
        <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-violet-700 dark:text-violet-300">
          <span className="font-semibold">Módulo em desenvolvimento</span> — funcionalidades de criação e edição serão activadas em breve.
        </p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total de Filiais", valor: filiais.length, cor: "text-gray-900 dark:text-white" },
          { label: "Activas", valor: activas, cor: "text-green-600 dark:text-green-400" },
          { label: "Inactivas", valor: filiais.length - activas, cor: "text-red-500 dark:text-red-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.cor}`}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Lista de Filiais ({filiais.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Nome
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Cidade
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">
                  Morada
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                  Responsável
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden xl:table-cell">
                  Telefone
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filiais.map((filial) => (
                <tr
                  key={filial.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {filial.nome}
                        </span>
                        {filial.principal && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            Principal
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        cidadeCor[filial.cidade] ?? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      {filial.cidade}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                    {filial.morada}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {filial.responsavel}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden xl:table-cell">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {filial.telefone}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {filial.estado === "Activa" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactiva
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
