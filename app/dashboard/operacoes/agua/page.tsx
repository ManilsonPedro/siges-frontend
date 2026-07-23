"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesAguaService, operacoesEstacaoService } from "@/shared/services/operacoes.service";
import { useState } from "react";
import { toast } from "sonner";
import { Waves, Plus, X, Loader2, Gauge, AlertTriangle, Pencil, Trash2, Droplets } from "lucide-react";
import type { TanqueAgua } from "@/shared/types";
import Link from "next/link";

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
const ESTADO_LABEL: Record<string, string> = { activo: "Activo", manutencao: "Em Manutenção", inactivo: "Inactivo" };
const ESTADO_COLOR: Record<string, string> = { activo: "bg-live-dim text-live", manutencao: "bg-amber-100 text-amber-700", inactivo: "bg-ink/10 text-ink-mid" };

export default function AguaPage() {
  const qc = useQueryClient();
  const [showTanque, setShowTanque] = useState(false);
  const [editTanque, setEditTanque] = useState<TanqueAgua | null>(null);
  const [leituraId, setLeituraId] = useState<string | null>(null);
  const [leituraForm, setLeituraForm] = useState({ nivel_litros: "", ph: "", turbidez: "" });

  const { data: tanques = [] } = useQuery({ queryKey: ["agua-tanques"], queryFn: operacoesAguaService.listTanques });
  const { data: indicadores } = useQuery({ queryKey: ["agua-indicadores"], queryFn: operacoesAguaService.indicadores });
  const { data: filiais = [] } = useQuery({ queryKey: ["filiais"], queryFn: operacoesEstacaoService.listFiliais });
  const [dimensao, setDimensao] = useState<"box" | "colaborador" | "equipa">("box");
  const { data: consumoDimensao } = useQuery({
    queryKey: ["agua-consumo-dimensao", dimensao],
    queryFn: () => operacoesAguaService.consumoPorDimensao(dimensao),
  });
  const { data: alertasData } = useQuery({ queryKey: ["agua-alertas"], queryFn: operacoesAguaService.alertas, refetchInterval: 60_000 });
  const { data: custosData } = useQuery({ queryKey: ["agua-custos"], queryFn: () => operacoesAguaService.custos() });

  const [tanqueForm, setTanqueForm] = useState({ codigo: "", nome: "", tipo: "limpa", capacidade_litros: 5000, nivel_atual_litros: 0, nivel_minimo_litros: 500, filial_id: "" });
  const [editForm, setEditForm] = useState({ estado: "activo", filial_id: "" });

  const createTanqueMut = useMutation({
    mutationFn: () => operacoesAguaService.createTanque({ ...tanqueForm, filial_id: tanqueForm.filial_id || undefined } as any),
    onSuccess: () => { toast.success("Tanque criado"); qc.invalidateQueries({ queryKey: ["agua-tanques"] }); setShowTanque(false); },
  });
  const updateTanqueMut = useMutation({
    mutationFn: () => operacoesAguaService.updateTanque(editTanque!.id, { estado: editForm.estado as any, filial_id: editForm.filial_id || null } as any),
    onSuccess: () => { toast.success("Tanque actualizado"); qc.invalidateQueries({ queryKey: ["agua-tanques"] }); setEditTanque(null); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const deleteTanqueMut = useMutation({
    mutationFn: (id: string) => operacoesAguaService.deleteTanque(id),
    onSuccess: () => { toast.success("Tanque removido"); qc.invalidateQueries({ queryKey: ["agua-tanques"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
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
        <div className="flex items-center gap-2">
          <Link href="/dashboard/operacoes/agua/abastecimentos" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-surface dark:hover:bg-ink-ghost/20">
            <Droplets className="h-4 w-4" /> Abastecimentos
          </Link>
          <button onClick={() => setShowTanque(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
            <Plus className="h-4 w-4" /> Novo tanque
          </button>
        </div>
      </div>

      {alertasData && alertasData.total > 0 && (
        <div className="bg-panel dark:bg-panel rounded-xl border border-danger/30 shadow overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-danger/8 border-b border-danger/20">
            <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
            <span className="text-sm font-semibold text-danger">Alertas de Água ({alertasData.total})</span>
          </div>
          <ul className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {alertasData.alertas.map((a, i) => (
              <li key={i} className="px-4 py-2.5 text-sm flex items-start gap-2">
                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 ${
                  a.severidade === "alta" ? "bg-danger/10 text-danger" : a.severidade === "media" ? "bg-amber-100 text-amber-700" : "bg-ink/10 text-ink-mid"
                }`}>{a.severidade}</span>
                <span className="text-ink-mid">{a.mensagem}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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

      <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Consumo por Dimensão Operacional</p>
          <div className="flex gap-1">
            {(["box", "colaborador", "equipa"] as const).map((d) => (
              <button key={d} onClick={() => setDimensao(d)}
                className={`text-xs px-3 py-1 rounded-lg ${dimensao === d ? "bg-ink text-white" : "border hover:bg-surface dark:hover:bg-ink-ghost/20"}`}>
                {d === "box" ? "Box" : d === "colaborador" ? "Colaborador" : "Equipa"}
              </button>
            ))}
          </div>
        </div>
        {!consumoDimensao || consumoDimensao.itens.length === 0 ? (
          <p className="text-xs text-ink-mid/70 py-4 text-center">Sem dados de consumo para esta dimensão</p>
        ) : (
          <ul className="text-sm space-y-1.5">
            {consumoDimensao.itens.map((i) => (
              <li key={i.chave} className="flex justify-between">
                <span>{i.label}</span>
                <span>{i.litros.toLocaleString("pt-AO")} L · {i.n_lavagens} lavagens</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {custosData && (custosData.por_fornecedor.length > 0 || custosData.por_filial.length > 0 || custosData.por_tanque.length > 0) && (
        <div className="grid md:grid-cols-3 gap-4">
          {custosData.por_fornecedor.length > 0 && (
            <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
              <p className="text-xs text-ink-mid/70 mb-2">Custo por Fornecedor</p>
              <ul className="text-sm space-y-1">
                {custosData.por_fornecedor.slice(0, 5).map((f) => (
                  <li key={f.fornecedor_id} className="flex justify-between">
                    <span>{f.fornecedor_nome}</span><span>{f.custo_total.toLocaleString("pt-AO")} Kz</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {custosData.por_filial.length > 0 && (
            <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
              <p className="text-xs text-ink-mid/70 mb-2">Custo por Filial</p>
              <ul className="text-sm space-y-1">
                {custosData.por_filial.map((f) => (
                  <li key={f.filial_id} className="flex justify-between">
                    <span>{f.filial_nome}</span><span>{f.custo_total.toLocaleString("pt-AO")} Kz</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {custosData.por_tanque.length > 0 && (
            <div className="bg-panel dark:bg-panel rounded-xl shadow p-4">
              <p className="text-xs text-ink-mid/70 mb-2">Custo por Tanque</p>
              <ul className="text-sm space-y-1">
                {custosData.por_tanque.map((t) => (
                  <li key={t.tanque_agua_id} className="flex justify-between">
                    <span>{t.tanque_codigo}</span><span>{t.custo_total.toLocaleString("pt-AO")} Kz</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tanques.length === 0 && <p className="text-ink-mid/70 col-span-2 text-center py-8">Nenhum tanque de água</p>}
        {tanques.map((t) => {
          const pct = t.capacidade_litros > 0 ? (t.nivel_atual_litros / t.capacidade_litros) * 100 : 0;
          const critico = t.nivel_atual_litros <= t.nivel_minimo_litros;
          const filial = filiais.find((f) => f.id === t.filial_id);
          return (
            <div key={t.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{t.codigo} — {TIPO_LABEL[t.tipo]}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_COLOR[t.estado]}`}>{ESTADO_LABEL[t.estado]}</span>
                  {critico && <AlertTriangle className="h-4 w-4 text-danger" />}
                </div>
              </div>
              {filial && <p className="text-xs text-ink-mid/70 mb-1">{filial.nome}</p>}
              <div className="h-3 w-full rounded-full bg-surface dark:bg-ink-ghost/20 mb-2">
                <div className={`h-3 rounded-full ${critico ? "bg-danger" : "bg-ink"}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <p className="text-sm text-ink-mid">{t.nivel_atual_litros.toLocaleString("pt-AO")}L / {t.capacidade_litros.toLocaleString("pt-AO")}L</p>
              {(t.ph || t.turbidez) && (
                <p className="text-xs text-ink-mid/70 mt-1">
                  {t.ph && `pH: ${t.ph}`} {t.turbidez && `· Turbidez: ${t.turbidez}`}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => setLeituraId(t.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                  <Gauge className="h-3.5 w-3.5" /> Registar leitura
                </button>
                <button onClick={() => { setEditTanque(t); setEditForm({ estado: t.estado, filial_id: t.filial_id || "" }); }} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <button onClick={() => confirm("Remover este tanque?") && deleteTanqueMut.mutate(t.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-danger/40 text-danger rounded-lg hover:bg-danger/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
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
          {filiais.length > 0 && (
            <div><label className="block text-sm font-medium mb-1">Filial</label>
              <select value={tanqueForm.filial_id} onChange={(e) => setTanqueForm({ ...tanqueForm, filial_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="">— Sem filial —</option>
                {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowTanque(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createTanqueMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createTanqueMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editTanque} onClose={() => setEditTanque(null)} title={`Editar tanque — ${editTanque?.codigo || ""}`}>
        <form onSubmit={(e) => { e.preventDefault(); updateTanqueMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Estado</label>
            <select value={editForm.estado} onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="activo">Activo</option><option value="manutencao">Em Manutenção</option><option value="inactivo">Inactivo</option>
            </select>
          </div>
          {filiais.length > 0 && (
            <div><label className="block text-sm font-medium mb-1">Filial</label>
              <select value={editForm.filial_id} onChange={(e) => setEditForm({ ...editForm, filial_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="">— Sem filial —</option>
                {filiais.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditTanque(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={updateTanqueMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{updateTanqueMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
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
