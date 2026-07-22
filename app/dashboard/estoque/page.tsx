"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { estoqueService } from "@/shared/services/financeiro.service";
import { Boxes, Warehouse, History, AlertTriangle } from "lucide-react";

export default function EstoquePage() {
  const { data: alertas = [] } = useQuery({
    queryKey: ["estoque", "alertas"],
    queryFn: estoqueService.alertas,
  });

  const cards = [
    { href: "/dashboard/estoque/saldos", icon: Boxes, title: "Saldos", desc: "Matriz produto × armazém com alertas de stock mínimo." },
    { href: "/dashboard/estoque/movimentos", icon: History, title: "Movimentos", desc: "Kardex, entradas, saídas, transferências e estornos." },
    { href: "/dashboard/estoque/armazens", icon: Warehouse, title: "Armazéns", desc: "Gerir armazéns/localizações físicas." },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Estoque</h1>
      {alertas.length > 0 && (
        <div className="bg-amber/8 border border-amber/30 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">{alertas.length} produto(s) abaixo do stock mínimo</h3>
            <Link href="/dashboard/estoque/saldos" className="text-sm text-amber underline">Ver detalhes</Link>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}
            className="block bg-panel dark:bg-panel rounded-xl p-6 shadow hover:shadow-md transition border border-transparent hover:border-blue-200">
            <c.icon className="h-8 w-8 text-ink mb-3" />
            <h3 className="font-semibold text-lg">{c.title}</h3>
            <p className="text-sm text-ink-mid dark:text-ink-mid/60 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
