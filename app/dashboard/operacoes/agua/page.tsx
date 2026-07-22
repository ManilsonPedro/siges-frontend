"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesAguaService } from "@/shared/services/operacoes.service";
import { useState } from "react";
import { toast } from "sonner";
import { Waves, Plus, X, Loader2, Gauge, AlertTriangle } from "lucide-react";

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

const TIPO_LABEL: Record<string, string> = { limpa: "Limpa", reciclada: "Reciclada", tratada: "Tratada", pluvial: "Pluvial" };

export default function AguaPage() {
  const qc = useQueryClient();
  const [showTanque, setShowTanque] = useState(false);
  const [leituraId, setLeituraId] = useState<string | null>(null);
  const [leituraForm, setLeituraForm] = useState({ nivel_litros: "", ph: "", turbidez: "" });

  const { data: tanques = [] } = useQuery({ queryKey: ["agua-tanques"], queryFn: operacoesAguaService.listTanques });
  const { data: indicadores } = useQuery({ queryKey: ["agua-indicadores"], queryFn: operacoesAguaService.indicadores });

  const [tanqueForm, setTanqueForm] = useState({ codigo: "", nome: "", tipo: "limpa", capacidade_litros: 5000, nivel_atual_litros: 0, nivel_minimo_litros: 500 });

  const createTanqueMut = useMutation({
    mutationFn: () => operacoesAguaService.createTanque(tanqueForm as any),
    onSuccess: () => { toast.success("Tanque criado"); qc.invalidateQueries({ queryKey: ["agua-tanques"] }); setShowTanque(false); },
  });
  const leituraMut = useMutation({
    mutationFn: () => operacoesAguaService.registarLeitura(leituraId!, {
      nivel_litros: leituraForm.nivel_litros ? parseFloat(leituraForm.nivel_litros) : undefined,
      ph: leituraForm.ph ? parseFloat(leituraForm.ph) : undefined,
      turbidez: leituraForm.turbidez ? parseFloat(leituraForm.turbidez) : undefined,
    }),
    onSuccess: () => { toast.success("Leitura registada"); qc.invalidateQueries({ queryKey: ["agua-tanques"] }); setLeituraId(null); setLeituraForm({ nivel_litros: "", ph: "", turbidez: "" }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Waves className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Gestão da Água</h1>
        </div>
        <button onClick={() => setShowTanque(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo tanque
        </button>
      </div>

      {indicadores && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70">Consumo Total</p>
            <p className="text-xl font-bold">{indicadores.consumo_total_litros.toLocaleString("pt-AO")} L</p>
          </div>
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70">Custo Total</p>
            <p className="text-xl font-bold">{indicadores.custo_total.toLocaleString("pt-AO")} Kz</p>
          </div>
          <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <p className="text-xs text-ink-mid/70">% Reciclagem</p>
            <p className="text-xl font-bold">{indicadores.percentual_reciclagem}%</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tanques.length === 0 && <p className="text-ink-mid/70 col-span-2 text-center py-8">Nenhum tanque de água</p>}
        {tanques.map((t) => {
          const pct = t.capacidade_litros > 0 ? (t.nivel_atual_litros / t.capacidade_litros) * 100 : 0;
          const critico = t.nivel_atual_litros <= t.nivel_minimo_litros;
          return (
            <div key={t.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{t.codigo} — {TIPO_LABEL[t.tipo]}</span>
                {critico && <AlertTriangle className="h-4 w-4 text-danger" />}
              </div>
              <div className="h-3 w-full rounded-full bg-surface dark:bg-ink-ghost/20 mb-2">
                <div className={`h-3 rounded-full ${critico ? "bg-danger" : "bg-ink"}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <p className="text-sm text-ink-mid">{t.nivel_atual_litros.toLocaleString("pt-AO")}L / {t.capacidade_litros.toLocaleString("pt-AO")}L</p>
              {(t.ph || t.turbidez) && (
                <p className="text-xs text-ink-mid/70 mt-1">
                  {t.ph && `pH: ${t.ph}`} {t.turbidez && `· Turbidez: ${t.turbidez}`}
                </p>
              )}
              <button onClick={() => setLeituraId(t.id)} className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                <Gauge className="h-3.5 w-3.5" /> Registar leitura
              </button>
            </div>
          );
        })}
      </div>

      <Modal open={showTanque} onClose={() => setShowTanque(false)} title="Novo tanque de água">
        <form onSubmit={(e) => { e.preventDefault(); createTanqueMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Código *</label><input value={tanqueForm.codigo} onChange={(e) => setTanqueForm({ ...tanqueForm, codigo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={tanqueForm.nome} onChange={(e) => setTanqueForm({ ...tanqueForm, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={tanqueForm.tipo} onChange={(e) => setTanqueForm({ ...tanqueForm, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="limpa">Limpa</option><option value="reciclada">Reciclada</option><option value="tratada">Tratada</option><option value="pluvial">Pluvial</option>
            </select></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs mb-1">Capacidade (L)</label><input type="number" min={1} value={tanqueForm.capacidade_litros} onChange={(e) => setTanqueForm({ ...tanqueForm, capacidade_litros: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Nível Actual (L)</label><input type="number" min={0} value={tanqueForm.nivel_atual_litros} onChange={(e) => setTanqueForm({ ...tanqueForm, nivel_atual_litros: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Mínimo (L)</label><input type="number" min={0} value={tanqueForm.nivel_minimo_litros} onChange={(e) => setTanqueForm({ ...tanqueForm, nivel_minimo_litros: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowTanque(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createTanqueMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createTanqueMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!leituraId} onClose={() => setLeituraId(null)} title="Registar leitura">
        <form onSubmit={(e) => { e.preventDefault(); leituraMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nível (L)</label><input type="number" step="0.01" value={leituraForm.nivel_litros} onChange={(e) => setLeituraForm({ ...leituraForm, nivel_litros: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">pH</label><input type="number" step="0.01" value={leituraForm.ph} onChange={(e) => setLeituraForm({ ...leituraForm, ph: e.target.value })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Turbidez</label><input type="number" step="0.01" value={leituraForm.turbidez} onChange={(e) => setLeituraForm({ ...leituraForm, turbidez: e.target.value })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setLeituraId(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={leituraMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{leituraMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
