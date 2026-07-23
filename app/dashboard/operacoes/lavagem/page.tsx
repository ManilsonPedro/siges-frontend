"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operacoesLavagemService, operacoesEstacaoService } from "@/shared/services/operacoes.service";
import { useState } from "react";
import { toast } from "sonner";
import { Droplets, Plus, X, Loader2, PlayCircle, CheckCircle2, Star, Camera } from "lucide-react";
import type { OrdemLavagem } from "@/shared/types";

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

const ESTADO_LABEL: Record<string, string> = {
  rascunho: "Rascunho", agendada: "Agendada", confirmada: "Confirmada", checkin: "Check-in",
  em_curso: "Em Curso", controlo_qualidade: "Controlo de Qualidade", concluida: "Concluída", paga: "Paga",
};
const ESTADO_COLOR: Record<string, string> = {
  rascunho: "bg-surface text-ink-mid", agendada: "bg-ink/10 text-ink", confirmada: "bg-ink/10 text-ink",
  checkin: "bg-amber-100 text-amber-700", em_curso: "bg-amber-100 text-amber-700",
  controlo_qualidade: "bg-amber-100 text-amber-700", concluida: "bg-live-dim text-live", paga: "bg-live-dim text-live",
};
const ORIGEM_LABEL: Record<string, string> = {
  portal_cliente: "Portal do Cliente", backoffice_walkin: "Walk-in", backoffice_telefone: "Telefone",
};

export default function LavagemPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"tipos" | "boxes" | "ordens" | "categorias" | "extras">("ordens");
  const [showTipo, setShowTipo] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [showOrdem, setShowOrdem] = useState(false);
  const [showCategoria, setShowCategoria] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [qualidadeOrdem, setQualidadeOrdem] = useState<OrdemLavagem | null>(null);
  const [pontuacao, setPontuacao] = useState(5);

  const { data: tipos = [] } = useQuery({ queryKey: ["lavagem-tipos"], queryFn: operacoesLavagemService.listTipos });
  const { data: boxes = [] } = useQuery({ queryKey: ["lavagem-boxes"], queryFn: operacoesLavagemService.listBoxes });
  const { data: ordens = [] } = useQuery({ queryKey: ["lavagem-ordens"], queryFn: () => operacoesLavagemService.listOrdens() });
  const { data: categorias = [] } = useQuery({ queryKey: ["lavagem-categorias"], queryFn: operacoesLavagemService.listCategoriasVeiculo });
  const { data: extras = [] } = useQuery({ queryKey: ["lavagem-extras"], queryFn: operacoesLavagemService.listExtras });
  const { data: filiais = [] } = useQuery({ queryKey: ["filiais"], queryFn: operacoesEstacaoService.listFiliais });

  const [tipoForm, setTipoForm] = useState({ codigo: "", nome: "", preco_base: 2000, duracao_estimada_minutos: 30 });
  const [boxForm, setBoxForm] = useState({ codigo: "", nome: "", filial_id: "" });
  const [ordemForm, setOrdemForm] = useState<{ tipo_lavagem_id: string; extra_ids: string[] }>({ tipo_lavagem_id: "", extra_ids: [] });
  const [categoriaForm, setCategoriaForm] = useState({ codigo: "", nome: "", fator_preco: 1, fator_agua: 1, ordem: 0 });
  const [extraForm, setExtraForm] = useState({ codigo: "", nome: "", preco: 0, duracao_adicional_minutos: 0 });

  const createTipoMut = useMutation({
    mutationFn: () => operacoesLavagemService.createTipo(tipoForm),
    onSuccess: () => { toast.success("Tipo criado"); qc.invalidateQueries({ queryKey: ["lavagem-tipos"] }); setShowTipo(false); },
  });
  const createBoxMut = useMutation({
    mutationFn: () => operacoesLavagemService.createBox({ ...boxForm, filial_id: boxForm.filial_id || undefined }),
    onSuccess: () => { toast.success("Box criado"); qc.invalidateQueries({ queryKey: ["lavagem-boxes"] }); setShowBox(false); setBoxForm({ codigo: "", nome: "", filial_id: "" }); },
  });
  const createOrdemMut = useMutation({
    mutationFn: () => operacoesLavagemService.createOrdem({ ...ordemForm, origem: "backoffice_walkin" }),
    onSuccess: () => { toast.success("Ordem criada"); qc.invalidateQueries({ queryKey: ["lavagem-ordens"] }); setShowOrdem(false); setOrdemForm({ tipo_lavagem_id: "", extra_ids: [] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const createCategoriaMut = useMutation({
    mutationFn: () => operacoesLavagemService.createCategoriaVeiculo(categoriaForm),
    onSuccess: () => { toast.success("Categoria criada"); qc.invalidateQueries({ queryKey: ["lavagem-categorias"] }); setShowCategoria(false); setCategoriaForm({ codigo: "", nome: "", fator_preco: 1, fator_agua: 1, ordem: 0 }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const deleteCategoriaMut = useMutation({
    mutationFn: (id: string) => operacoesLavagemService.deleteCategoriaVeiculo(id),
    onSuccess: () => { toast.success("Categoria eliminada"); qc.invalidateQueries({ queryKey: ["lavagem-categorias"] }); },
  });
  const createExtraMut = useMutation({
    mutationFn: () => operacoesLavagemService.createExtra(extraForm),
    onSuccess: () => { toast.success("Extra criado"); qc.invalidateQueries({ queryKey: ["lavagem-extras"] }); setShowExtra(false); setExtraForm({ codigo: "", nome: "", preco: 0, duracao_adicional_minutos: 0 }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const deleteExtraMut = useMutation({
    mutationFn: (id: string) => operacoesLavagemService.deleteExtra(id),
    onSuccess: () => { toast.success("Extra eliminado"); qc.invalidateQueries({ queryKey: ["lavagem-extras"] }); },
  });
  const checkinMut = useMutation({
    mutationFn: (id: string) => operacoesLavagemService.checkin(id),
    onSuccess: () => { toast.success("Check-in efectuado"); qc.invalidateQueries({ queryKey: ["lavagem-ordens"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const iniciarMut = useMutation({
    mutationFn: (id: string) => operacoesLavagemService.iniciar(id, boxes[0]?.id),
    onSuccess: () => { toast.success("Lavagem iniciada"); qc.invalidateQueries({ queryKey: ["lavagem-ordens"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const { data: fotosOrdem } = useQuery({
    queryKey: ["lavagem-fotos", qualidadeOrdem?.id],
    queryFn: () => operacoesLavagemService.getFotos(qualidadeOrdem!.id),
    enabled: !!qualidadeOrdem,
  });
  const uploadFotoMut = useMutation({
    mutationFn: ({ momento, file }: { momento: "antes" | "depois"; file: File }) =>
      operacoesLavagemService.uploadFoto(qualidadeOrdem!.id, momento, file),
    onSuccess: () => { toast.success("Foto carregada"); qc.invalidateQueries({ queryKey: ["lavagem-fotos", qualidadeOrdem?.id] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao carregar foto"),
  });
  const qualidadeMut = useMutation({
    mutationFn: () => operacoesLavagemService.controloQualidade(qualidadeOrdem!.id, { pontuacao }),
    onSuccess: () => { toast.success("Controlo de qualidade registado"); qc.invalidateQueries({ queryKey: ["lavagem-ordens"] }); setQualidadeOrdem(null); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const concluirMut = useMutation({
    mutationFn: (id: string) => operacoesLavagemService.concluir(id),
    onSuccess: () => { toast.success("Lavagem concluída"); qc.invalidateQueries({ queryKey: ["lavagem-ordens"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  function tipoNome(id: string) { return tipos.find((t) => t.id === id)?.nome || id; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Lavagem Automóvel</h1>
        </div>
        <button onClick={() => {
          if (tab === "tipos") setShowTipo(true);
          else if (tab === "boxes") setShowBox(true);
          else if (tab === "categorias") setShowCategoria(true);
          else if (tab === "extras") setShowExtra(true);
          else setShowOrdem(true);
        }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      <div className="flex gap-2 border-b border-ink-ghost/40 dark:border-ink-ghost/15 flex-wrap">
        {(["ordens", "tipos", "categorias", "extras", "boxes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${tab === t ? "border-ink text-ink" : "border-transparent text-ink-mid/70"}`}>
            {t === "ordens" ? "Ordens" : t === "tipos" ? "Tipos de Lavagem" : t === "categorias" ? "Categorias de Veículo" : t === "extras" ? "Extras" : "Boxes"}
          </button>
        ))}
      </div>

      {tab === "ordens" && (
        <div className="space-y-3">
          {ordens.length === 0 && <p className="text-ink-mid/70 text-center py-8">Nenhuma ordem de lavagem</p>}
          {ordens.map((o) => (
            <div key={o.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{tipoNome(o.tipo_lavagem_id)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[o.estado]}`}>{ESTADO_LABEL[o.estado]}</span>
                  <span className="text-xs text-ink-mid/70">{ORIGEM_LABEL[o.origem] || o.origem}</span>
                  {o.preco_total != null && <span className="text-xs font-semibold text-ink">{o.preco_total.toLocaleString("pt-AO")} Kz</span>}
                  {o.extras.length > 0 && <span className="text-xs text-ink-mid/70">+{o.extras.length} extra(s)</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {(o.estado === "agendada" || o.estado === "confirmada") && (
                  <button onClick={() => checkinMut.mutate(o.id)} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-surface">Check-in</button>
                )}
                {o.estado === "checkin" && (
                  <button onClick={() => iniciarMut.mutate(o.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-ink text-white rounded-lg hover:bg-ink/90">
                    <PlayCircle className="h-3.5 w-3.5" /> Iniciar
                  </button>
                )}
                {o.estado === "em_curso" && (
                  <button onClick={() => { setQualidadeOrdem(o); setPontuacao(5); }} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-surface">Controlo de Qualidade</button>
                )}
                {o.estado === "controlo_qualidade" && (
                  <button onClick={() => concluirMut.mutate(o.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-live text-white rounded-lg hover:bg-live/90">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "tipos" && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Código</th><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Preço</th><th className="px-4 py-3">Duração</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {tipos.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-ink-mid/70">Nenhum tipo</td></tr>}
              {tipos.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-mono text-sm">{t.codigo}</td>
                  <td className="px-4 py-3 text-sm">{t.nome}</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{t.preco_base.toLocaleString("pt-AO")} Kz</td>
                  <td className="px-4 py-3 text-sm">{t.duracao_estimada_minutos} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "boxes" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {boxes.length === 0 && <p className="text-ink-mid/70 col-span-4 text-center py-8">Nenhum box</p>}
          {boxes.map((b) => (
            <div key={b.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4 text-center">
              <p className="font-semibold">{b.codigo}</p>
              <p className="text-sm text-ink-mid">{b.nome}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${b.estado === "disponivel" ? "bg-live-dim text-live" : "bg-amber-100 text-amber-700"}`}>{b.estado}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "categorias" && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Código</th><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Fator Preço</th><th className="px-4 py-3">Fator Água</th><th className="px-4 py-3 text-right">Acções</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {categorias.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink-mid/70">Nenhuma categoria</td></tr>}
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-sm">{c.codigo}</td>
                  <td className="px-4 py-3 text-sm">{c.nome}</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{c.fator_preco}×</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{c.fator_agua}×</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => confirm(`Eliminar "${c.nome}"?`) && deleteCategoriaMut.mutate(c.id)} className="p-2 text-ink-mid/70 hover:text-danger"><X className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "extras" && (
        <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
              <th className="px-4 py-3">Código</th><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Preço</th><th className="px-4 py-3">Duração extra</th><th className="px-4 py-3 text-right">Acções</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
              {extras.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink-mid/70">Nenhum extra</td></tr>}
              {extras.map((ex) => (
                <tr key={ex.id}>
                  <td className="px-4 py-3 font-mono text-sm">{ex.codigo}</td>
                  <td className="px-4 py-3 text-sm">{ex.nome}</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{ex.preco.toLocaleString("pt-AO")} Kz</td>
                  <td className="px-4 py-3 text-sm">{ex.duracao_adicional_minutos} min</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => confirm(`Eliminar "${ex.nome}"?`) && deleteExtraMut.mutate(ex.id)} className="p-2 text-ink-mid/70 hover:text-danger"><X className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showTipo} onClose={() => setShowTipo(false)} title="Novo tipo de lavagem">
        <form onSubmit={(e) => { e.preventDefault(); createTipoMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Código *</label><input value={tipoForm.codigo} onChange={(e) => setTipoForm({ ...tipoForm, codigo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={tipoForm.nome} onChange={(e) => setTipoForm({ ...tipoForm, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Preço (Kz)</label><input type="number" min={0} value={tipoForm.preco_base} onChange={(e) => setTipoForm({ ...tipoForm, preco_base: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Duração (min)</label><input type="number" min={1} value={tipoForm.duracao_estimada_minutos} onChange={(e) => setTipoForm({ ...tipoForm, duracao_estimada_minutos: parseInt(e.target.value) || 30 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowTipo(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createTipoMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createTipoMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={showBox} onClose={() => setShowBox(false)} title="Novo box">
        <form onSubmit={(e) => { e.preventDefault(); createBoxMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Código *</label><input value={boxForm.codigo} onChange={(e) => setBoxForm({ ...boxForm, codigo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={boxForm.nome} onChange={(e) => setBoxForm({ ...boxForm, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          {filiais.length > 0 && (
            <div><label className="block text-sm font-medium mb-1">Filial</label>
              <select value={boxForm.filial_id} onChange={(e) => setBoxForm({ ...boxForm, filial_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="">Não especificada</option>
                {filiais.filter((f) => f.activo).map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowBox(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createBoxMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createBoxMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={showOrdem} onClose={() => setShowOrdem(false)} title="Nova ordem de lavagem">
        <form onSubmit={(e) => { e.preventDefault(); createOrdemMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Tipo de lavagem *</label>
            <select value={ordemForm.tipo_lavagem_id} onChange={(e) => setOrdemForm({ ...ordemForm, tipo_lavagem_id: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="">Seleccionar…</option>{tipos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select></div>
          {extras.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Extras</label>
              <div className="space-y-1">
                {extras.filter((ex) => ex.activo).map((ex) => (
                  <label key={ex.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={ordemForm.extra_ids.includes(ex.id)}
                      onChange={(e) => setOrdemForm({
                        ...ordemForm,
                        extra_ids: e.target.checked ? [...ordemForm.extra_ids, ex.id] : ordemForm.extra_ids.filter((id) => id !== ex.id),
                      })} />
                    {ex.nome} — {ex.preco.toLocaleString("pt-AO")} Kz
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowOrdem(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createOrdemMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createOrdemMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={showCategoria} onClose={() => setShowCategoria(false)} title="Nova categoria de veículo">
        <form onSubmit={(e) => { e.preventDefault(); createCategoriaMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Código *</label><input value={categoriaForm.codigo} onChange={(e) => setCategoriaForm({ ...categoriaForm, codigo: e.target.value })} required placeholder="ex.: suv_pickup" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={categoriaForm.nome} onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })} required placeholder="ex.: SUV / Pickup" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Fator preço</label><input type="number" step="0.1" min={0.1} value={categoriaForm.fator_preco} onChange={(e) => setCategoriaForm({ ...categoriaForm, fator_preco: parseFloat(e.target.value) || 1 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Fator água</label><input type="number" step="0.1" min={0.1} value={categoriaForm.fator_agua} onChange={(e) => setCategoriaForm({ ...categoriaForm, fator_agua: parseFloat(e.target.value) || 1 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCategoria(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createCategoriaMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createCategoriaMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={showExtra} onClose={() => setShowExtra(false)} title="Novo extra">
        <form onSubmit={(e) => { e.preventDefault(); createExtraMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Código *</label><input value={extraForm.codigo} onChange={(e) => setExtraForm({ ...extraForm, codigo: e.target.value })} required placeholder="ex.: encerar" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={extraForm.nome} onChange={(e) => setExtraForm({ ...extraForm, nome: e.target.value })} required placeholder="ex.: Encerar" className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Preço (Kz)</label><input type="number" min={0} value={extraForm.preco} onChange={(e) => setExtraForm({ ...extraForm, preco: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Duração extra (min)</label><input type="number" min={0} value={extraForm.duracao_adicional_minutos} onChange={(e) => setExtraForm({ ...extraForm, duracao_adicional_minutos: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowExtra(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createExtraMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createExtraMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!qualidadeOrdem} onClose={() => setQualidadeOrdem(null)} title="Controlo de Qualidade">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1.5"><Camera className="h-4 w-4" /> Fotos Antes / Depois</label>
            <div className="grid grid-cols-2 gap-3">
              {(["antes", "depois"] as const).map((momento) => (
                <div key={momento}>
                  <p className="text-xs text-ink-mid/70 mb-1 capitalize">{momento}</p>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {(momento === "antes" ? fotosOrdem?.fotos_antes : fotosOrdem?.fotos_depois)?.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt={`Foto ${momento} ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-ink-ghost/40 dark:border-ink-ghost/20" />
                    ))}
                  </div>
                  <input
                    type="file" accept="image/png,image/jpeg,image/jpg"
                    id={`foto-${momento}`} className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFotoMut.mutate({ momento, file: f }); }}
                  />
                  <label htmlFor={`foto-${momento}`} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface dark:hover:bg-ink-ghost/20 cursor-pointer">
                    {uploadFotoMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />} Carregar
                  </label>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); qualidadeMut.mutate(); }} className="space-y-4 pt-2 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
            <div>
              <label className="block text-sm font-medium mb-2">Pontuação (1-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setPontuacao(n)}>
                    <Star className={`h-6 w-6 ${n <= pontuacao ? "fill-amber-400 text-amber-400" : "text-ink-ghost"}`} />
                  </button>
                ))}
              </div>
              {pontuacao < 3 && <p className="text-xs text-danger mt-2">Pontuação baixa — considere oferecer re-lavagem ao cliente.</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setQualidadeOrdem(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={qualidadeMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{qualidadeMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registar"}</button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
