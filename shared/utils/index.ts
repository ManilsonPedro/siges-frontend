import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "AOA"): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function estadoBadgeColor(estado: string): string {
  const map: Record<string, string> = {
    ativo: "bg-green-100 text-green-800",
    inativo: "bg-gray-100 text-gray-800",
    suspenso: "bg-yellow-100 text-yellow-800",
    pendente: "bg-yellow-100 text-yellow-800",
    pago: "bg-green-100 text-green-800",
    pago_parcial: "bg-blue-100 text-blue-800",
    pago_total: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
    devolvido: "bg-purple-100 text-purple-800",
    entrada: "bg-blue-100 text-blue-800",
    saida: "bg-orange-100 text-orange-800",
  };
  return map[estado] || "bg-gray-100 text-gray-800";
}

export function tipoMovimentoLabel(tipo: string): string {
  return tipo === "entrada" ? "Entrada" : "Saída";
}

export function estadoPagamentoLabel(estado: string): string {
  const map: Record<string, string> = {
    pendente: "Pendente",
    pago: "Pago",
    pago_parcial: "Pago Parcial",
    pago_total: "Pago Total",
    cancelado: "Cancelado",
    devolvido: "Devolvido",
  };
  return map[estado] || estado;
}

export function estadoMovimentoLabel(estado: string): string {
  const map: Record<string, string> = {
    criado: "Criado",
    pendente: "Pendente",
    fechado: "Fechado",
  };
  return map[estado] || estado;
}

export function estadoMovimentoBadge(estado: string): string {
  const map: Record<string, string> = {
    criado: "bg-gray-100 text-gray-700",
    pendente: "bg-yellow-100 text-yellow-800",
    fechado: "bg-green-100 text-green-800",
  };
  return map[estado] || "bg-gray-100 text-gray-700";
}
