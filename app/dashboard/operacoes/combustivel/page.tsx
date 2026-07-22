"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesCombustivelService } from "@/shared/services/operacoes.service";
import { useState } from "react";
import { toast } from "sonner";
import { Fuel, Plus, Gauge, X, Loader2, AlertTriangle } from "lucide-react";

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

const TIPO_LABEL: Record<string, string> = { gasolina: "Gasolina", gasoleo: "Gasóleo", gpl: "GPL", outro: "Outro" };

export default function CombustivelPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"tanques" | "bombas" | "abastecimentos">("tanques");
  const [showTanque, setShowTanque] = useState(false);
  const [leituraId, setLeituraId] = useState<string | null>(null);
  const [leituraVal, setLeituraVal] = useState("");

  const { data: tanques = [] } = useQuery({ queryKey: ["combustivel-tanques"], queryFn: operacoesCombustivelService.listTanques });
  const { data: bombas = [] } = useQuery({ queryKey: ["combustivel-bombas"], queryFn: operacoesCombustivelService.listBombas });
  const { data: abastecimentos = [] } = useQuery({ queryKey: ["combustivel-abastecimentos"], queryFn: operacoesCombustivelService.listAbastecimentos });

  const [tanqueForm, setTanqueForm] = useState({ codigo: "", tipo_combustivel: "gasolina", capacidade_litros: 10000, nivel_atual_litros: 0, nivel_minimo_litros: 1000, nivel_reordenamento_litros: 2000 });

  const createTanqueMut = useMutation({
    mutationFn: () => operacoesCombustivelService.createTanque(tanqueForm),
    onSuccess: () => { toast.success("Tanque criado"); qc.invalidateQueries({ queryKey: ["combustivel-tanques"] }); setShowTanque(false); },
  });
  const leituraMut = useMutation({
    mutationFn: () => operacoesCombustivelService.registarLeitura(leituraId!, { nivel_litros: parseFloat(leituraVal) }),
    onSuccess: () => { toast.success("Leitura registada"); qc.invalidateQueries({ queryKey: ["combustivel-tanques"] }); setLeituraId(null); setLeituraVal(""); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fuel className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Combustível</h1>
        </div>
        {tab === "tanques" && (
          <button onClick={() => setShowTanque(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
            <Plus className="h-4 w-4" /> Novo tanque
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
        {(["tanques", "bombas", "abastecimentos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${tab === t ? "border-ink text-ink" : "border-transparent text-ink-mid/70"}`}>{t}</button>
        ))}
      </div>

      {tab === "tanques" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tanques.length === 0 && <p className="text-ink-mid/70 col-span-2 text-center py-8">Nenhum tanque</p>}
          {tanques.map((t) => {
            const pct = t.capacidade_litros > 0 ? (t.nivel_atual_litros / t.capacidade_litros) * 100 : 0;
            const critico = t.nivel_atual_litros <= t.nivel_minimo_litros;
            return (
              <div key={t.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{t.codigo} — {TIPO_LABEL[t.tipo_combustivel]}</span>
                  {critico && <AlertTriangle className="h-4 w-4 text-danger" />}
                </div>
                <div className="h-3 w-full rounded-full bg-surface dark:bg-ink-ghost/20 mb-2">
                  <div className={`h-3 rounded-full ${critico ? "bg-danger" : pct < 40 ? "bg-amber-500" : "bg-live"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <p className="text-sm text-ink-mid">{t.nivel_atual_litros.toLocaleString("pt-AO")}L / {t.capacidade_litros.toLocaleString("pt-AO")}L</p>
                <button onClick={() => { setLeituraId(t.id); setLeituraVal(String(t.nivel_atual_litros)); }} className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                  <Gauge className="h-3.5 w-3.5" /> Registar leitura
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "bombas" && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Código</th><th className="px-4 py-3">Estado</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {bombas.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-ink-mid/70">Nenhuma bomba</td></tr>}
              {bombas.map((b) => (
                <tr key={b.id}><td className="px-4 py-3 text-sm">{b.codigo}</td><td className="px-4 py-3 text-sm">{b.estado}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "abastecimentos" && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Data</th><th className="px-4 py-3">Combustível</th><th className="px-4 py-3">Litros</th><th className="px-4 py-3">Total</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {abastecimentos.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-ink-mid/70">Nenhum abastecimento</td></tr>}
              {abastecimentos.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-sm text-ink-mid">{new Date(a.created_at).toLocaleString("pt-PT")}</td>
                  <td className="px-4 py-3 text-sm">{TIPO_LABEL[a.tipo_combustivel] || a.tipo_combustivel}</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{a.volume_litros}L</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{a.total.toLocaleString("pt-AO")} Kz</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showTanque} onClose={() => setShowTanque(false)} title="Novo tanque">
        <form onSubmit={(e) => { e.preventDefault(); createTanqueMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Código *</label>
            <input value={tanqueForm.codigo} onChange={(e) => setTanqueForm({ ...tanqueForm, codigo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={tanqueForm.tipo_combustivel} onChange={(e) => setTanqueForm({ ...tanqueForm, tipo_combustivel: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="gasolina">Gasolina</option><option value="gasoleo">Gasóleo</option><option value="gpl">GPL</option><option value="outro">Outro</option>
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

      <Modal open={!!leituraId} onClose={() => setLeituraId(null)} title="Registar leitura de tanque">
        <form onSubmit={(e) => { e.preventDefault(); leituraMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nível actual (L) *</label>
            <input type="number" step="0.01" min={0} value={leituraVal} onChange={(e) => setLeituraVal(e.target.value)} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setLeituraId(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={leituraMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{leituraMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
