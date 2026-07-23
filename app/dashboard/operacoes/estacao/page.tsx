"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesEstacaoService } from "@/shared/services/operacoes.service";
import { useState } from "react";
import { toast } from "sonner";
import { Building, Plus, Trash2, Wrench, X, Loader2 } from "lucide-react";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function EstacaoPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"areas" | "equipamentos" | "turnos">("areas");
  const [showForm, setShowForm] = useState(false);

  const { data: areas = [] } = useQuery({ queryKey: ["operacoes-areas"], queryFn: operacoesEstacaoService.listAreas });
  const { data: equipamentos = [] } = useQuery({ queryKey: ["operacoes-equipamentos"], queryFn: operacoesEstacaoService.listEquipamentos });
  const { data: turnos = [] } = useQuery({ queryKey: ["operacoes-turnos"], queryFn: operacoesEstacaoService.listTurnos });

  const [areaForm, setAreaForm] = useState({ nome: "", tipo: "lavagem" });
  const [equipForm, setEquipForm] = useState({ nome: "", tipo: "maquina_lavagem", area_servico_id: "" });
  const [turnoForm, setTurnoForm] = useState({ nome: "", hora_inicio: "08:00", hora_fim: "16:00" });

  const createAreaMut = useMutation({
    mutationFn: () => operacoesEstacaoService.createArea(areaForm),
    onSuccess: () => { toast.success("Área criada"); qc.invalidateQueries({ queryKey: ["operacoes-areas"] }); setShowForm(false); },
  });
  const createEquipMut = useMutation({
    mutationFn: () => operacoesEstacaoService.createEquipamento({ ...equipForm, area_servico_id: equipForm.area_servico_id || undefined }),
    onSuccess: () => { toast.success("Equipamento criado"); qc.invalidateQueries({ queryKey: ["operacoes-equipamentos"] }); setShowForm(false); },
  });
  const createTurnoMut = useMutation({
    mutationFn: () => operacoesEstacaoService.createTurno(turnoForm),
    onSuccess: () => { toast.success("Turno criado"); qc.invalidateQueries({ queryKey: ["operacoes-turnos"] }); setShowForm(false); },
  });
  const manutencaoMut = useMutation({
    mutationFn: (id: string) => operacoesEstacaoService.registarManutencao(id),
    onSuccess: () => { toast.success("Manutenção registada"); qc.invalidateQueries({ queryKey: ["operacoes-equipamentos"] }); },
  });
  const deleteAreaMut = useMutation({
    mutationFn: (id: string) => operacoesEstacaoService.deleteArea(id),
    onSuccess: () => { toast.success("Área eliminada"); qc.invalidateQueries({ queryKey: ["operacoes-areas"] }); },
  });
  const deleteTurnoMut = useMutation({
    mutationFn: (id: string) => operacoesEstacaoService.deleteTurno(id),
    onSuccess: () => { toast.success("Turno eliminado"); qc.invalidateQueries({ queryKey: ["operacoes-turnos"] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Gestão da Estação</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      <div className="flex gap-2 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
        {(["areas", "equipamentos", "turnos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-ink text-ink" : "border-transparent text-ink-mid/70"}`}>
            {t === "areas" ? "Áreas de Serviço" : t === "equipamentos" ? "Equipamentos" : "Turnos"}
          </button>
        ))}
      </div>

      {tab === "areas" && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {areas.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-ink-mid/70">Nenhuma área de serviço</td></tr>}
              {areas.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-sm">{a.nome}</td>
                  <td className="px-4 py-3 text-sm capitalize">{a.tipo}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${a.activo ? "bg-live-dim text-live" : "bg-surface text-ink-mid"}`}>{a.activo ? "Activo" : "Inactivo"}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => confirm("Eliminar?") && deleteAreaMut.mutate(a.id)} className="p-2 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "equipamentos" && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Última Manutenção</th><th className="px-4 py-3 text-right">Acções</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {equipamentos.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink-mid/70">Nenhum equipamento</td></tr>}
              {equipamentos.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-sm">{e.nome}</td>
                  <td className="px-4 py-3 text-sm">{e.tipo === "maquina_lavagem" ? "Máquina de Lavagem" : "Outro"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${e.estado === "operacional" ? "bg-live-dim text-live" : "bg-amber-100 text-amber-700"}`}>{e.estado}</span></td>
                  <td className="px-4 py-3 text-sm text-ink-mid">{e.ultima_manutencao ? new Date(e.ultima_manutencao).toLocaleDateString("pt-PT") : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => manutencaoMut.mutate(e.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      <Wrench className="h-3.5 w-3.5" /> Manutenção
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "turnos" && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Início</th><th className="px-4 py-3">Fim</th><th className="px-4 py-3 text-right">Acções</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {turnos.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-ink-mid/70">Nenhum turno</td></tr>}
              {turnos.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 text-sm">{t.nome}</td>
                  <td className="px-4 py-3 text-sm">{t.hora_inicio}</td>
                  <td className="px-4 py-3 text-sm">{t.hora_fim}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => confirm("Eliminar?") && deleteTurnoMut.mutate(t.id)} className="p-2 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={`Novo(a) ${tab === "areas" ? "área" : tab === "equipamentos" ? "equipamento" : "turno"}`}>
        {tab === "areas" && (
          <form onSubmit={(e) => { e.preventDefault(); createAreaMut.mutate(); }} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Nome *</label>
              <input value={areaForm.nome} onChange={(e) => setAreaForm({ ...areaForm, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={areaForm.tipo} onChange={(e) => setAreaForm({ ...areaForm, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="lavagem">Lavagem</option><option value="loja">Loja</option><option value="restauracao">Restauração</option>
              </select></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={createAreaMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createAreaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
            </div>
          </form>
        )}
        {tab === "equipamentos" && (
          <form onSubmit={(e) => { e.preventDefault(); createEquipMut.mutate(); }} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Nome *</label>
              <input value={equipForm.nome} onChange={(e) => setEquipForm({ ...equipForm, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={equipForm.tipo} onChange={(e) => setEquipForm({ ...equipForm, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="maquina_lavagem">Máquina de Lavagem</option><option value="outro">Outro</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Área de Serviço</label>
              <select value={equipForm.area_servico_id} onChange={(e) => setEquipForm({ ...equipForm, area_servico_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="">Nenhuma</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={createEquipMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createEquipMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
            </div>
          </form>
        )}
        {tab === "turnos" && (
          <form onSubmit={(e) => { e.preventDefault(); createTurnoMut.mutate(); }} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Nome *</label>
              <input value={turnoForm.nome} onChange={(e) => setTurnoForm({ ...turnoForm, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Início</label>
                <input type="time" value={turnoForm.hora_inicio} onChange={(e) => setTurnoForm({ ...turnoForm, hora_inicio: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
              <div><label className="block text-sm font-medium mb-1">Fim</label>
                <input type="time" value={turnoForm.hora_fim} onChange={(e) => setTurnoForm({ ...turnoForm, hora_fim: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={createTurnoMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createTurnoMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
