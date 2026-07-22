"use client";
import { useQuery } from "@tanstack/react-query";
import { rhService } from "@/shared/services/rh.service";
import { Users, Loader2 } from "lucide-react";
import type { OrganogramaNode } from "@/shared/types";

function NodeCard({ node, depth }: { node: OrganogramaNode; depth: number }) {
  return (
    <div style={{ marginLeft: depth * 24 }} className="mb-2">
      <div className="inline-block bg-panel dark:bg-panel rounded-lg shadow px-4 py-2">
        <p className="font-medium text-sm">{node.nome}</p>
        {node.cargo && <p className="text-xs text-ink-mid">{node.cargo}</p>}
      </div>
      {node.subordinados.map((s) => <NodeCard key={s.id} node={s} depth={depth + 1} />)}
    </div>
  );
}

export default function OrganogramaPage() {
  const { data: nodes = [], isLoading } = useQuery({ queryKey: ["organograma"], queryFn: rhService.organograma });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-ink" />
        <h1 className="text-2xl font-bold text-ink dark:text-white">Organograma</h1>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-6">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && nodes.length === 0 && <p className="text-center text-ink-mid/70 py-8">Nenhum colaborador registado</p>}
        {nodes.map((n) => <NodeCard key={n.id} node={n} depth={0} />)}
      </div>
    </div>
  );
}
