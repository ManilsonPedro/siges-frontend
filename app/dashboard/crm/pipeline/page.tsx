"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmService } from "@/shared/services/crm.service";
import { useState } from "react";
import { toast } from "sonner";
import { Kanban, Plus, X, Loader2 } from "lucide-react";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");

  const { data: etapas = [] } = useQuery({ queryKey: ["pipeline-etapas"], queryFn: crmService.listEtapas });
  const { data: oportunidades = [], isLoading } = useQuery({ queryKey: ["oportunidades", "aberta"], queryFn: () => crmService.listOportunidades("aberta") });

  const createEtapaMut = useMutation({
    mutationFn: () => crmService.createEtapa({ nome, ordem: etapas.length }),
    onSuccess: () => { toast.success("Etapa criada"); qc.invalidateQueries({ queryKey: ["pipeline-etapas"] }); setShowForm(false); setNome(""); },
  });
  const moverMut = useMutation({
    mutationFn: (vars: { id: string; etapaId: string }) => crmService.moverEtapa(vars.id, vars.etapaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oportunidades"] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Kanban className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Pipeline</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova etapa
        </button>
      </div>

      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {!isLoading && etapas.length === 0 && <p className="text-center text-ink-mid/70 py-8">Nenhuma etapa criada</p>}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {etapas.sort((a, b) => a.ordem - b.ordem).map((etapa) => {
          const oportunidadesEtapa = oportunidades.filter((o) => o.etapa_pipeline_id === etapa.id);
          return (
            <div key={etapa.id} className="min-w-[260px] bg-surface dark:bg-ink-ghost/10 rounded-xl p-3">
              <h3 className="font-semibold text-sm mb-3">{etapa.nome} ({oportunidadesEtapa.length})</h3>
              <div className="space-y-2">
                {oportunidadesEtapa.map((o) => (
                  <div key={o.id} className="bg-panel dark:bg-panel rounded-lg shadow p-3">
                    <p className="text-sm font-medium">{o.titulo}</p>
                    <p className="text-xs text-ink-mid">{o.valor_estimado.toLocaleString("pt-AO")} Kz</p>
                    <select
                      value={etapa.id}
                      onChange={(e) => moverMut.mutate({ id: o.id, etapaId: e.target.value })}
                      className="mt-2 w-full text-xs border rounded px-1 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20"
                    >
                      {etapas.map((e2) => <option key={e2.id} value={e2.id}>{e2.nome}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova etapa">
        <form onSubmit={(e) => { e.preventDefault(); createEtapaMut.mutate(); }} className="space-y-4">
          <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex.: Proposta" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createEtapaMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createEtapaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
