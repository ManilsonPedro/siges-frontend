"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  movimentos: "Movimentos",
  fornecedores: "Fornecedores",
  conceitos: "Conceitos",
  fundos: "Fundos",
  orcamentos: "Orçamentos",
  periodos: "Períodos",
  relatorios: "Relatórios",
  auditoria: "Auditoria",
  utilizadores: "Utilizadores",
  lixeira: "Lixeira",
  configuracoes: "Configurações",
  perfil: "Perfil",
};

const GROUPS: Record<string, string> = {
  fornecedores: "Gestão",
  conceitos: "Gestão",
  fundos: "Gestão",
  orcamentos: "Gestão",
  periodos: "Gestão",
  utilizadores: "Gestão de Utilizadores",
  lixeira: "Configurações",
  configuracoes: "Configurações",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const current = segments[segments.length - 1];
  const currentLabel = LABELS[current] || current;
  const group = GROUPS[current];

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3" aria-label="Breadcrumb">
      <Link href="/dashboard" className="flex items-center hover:text-gray-700 dark:hover:text-gray-200">
        <Home className="h-3 w-3" />
      </Link>
      <ChevronRight className="h-3 w-3" />
      {group && (
        <>
          <span className="text-gray-500">{group}</span>
          <ChevronRight className="h-3 w-3" />
        </>
      )}
      <span className="font-medium text-gray-700 dark:text-gray-200">{currentLabel}</span>
    </nav>
  );
}
