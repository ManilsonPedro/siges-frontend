"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restauracaoChurrasqueiraService, restauracaoBaseService } from "@/shared/services/restauracao.service";
import { useState } from "react";
import { toast } from "sonner";
import { Beef, Plus, Trash2, X, Loader2 } from "lucide-react";

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

export default function CombosPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [precoCombo, setPrecoCombo] = useState(2000);
  const [itensSelecionados, setItensSelecionados] = useState<{ item_menu_id: string; quantidade: number }[]>([]);

  const { data: itensMenu = [] } = useQuery({ queryKey: ["itens-menu", "churrasqueira"], queryFn: () => restauracaoBaseService.listItensMenu("churrasqueira") });
  const { data: combos = [], isLoading } = useQuery({ queryKey: ["combos"], queryFn: restauracaoChurrasqueiraService.listCombos });

  const createMut = useMutation({
    mutationFn: () => restauracaoChurrasqueiraService.createCombo({ nome, itens: itensSelecionados, preco_combo: precoCombo }),
    onSuccess: () => { toast.success("Combo criado"); qc.invalidateQueries({ queryKey: ["combos"] }); setShowForm(false); setNome(""); setItensSelecionados([]); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => restauracaoChurrasqueiraService.deleteCombo(id),
    onSuccess: () => { toast.success("Combo eliminado"); qc.invalidateQueries({ queryKey: ["combos"] }); },
  });

  function itemNome(id: string) { return itensMenu.find((i) => i.id === id)?.nome || id; }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Beef className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Combos</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo combo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && combos.length === 0 && <p className="col-span-3 text-center text-ink-mid/70 py-8">Nenhum combo</p>}
        {combos.map((c) => (
          <div key={c.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{c.nome}</p>
              <button onClick={() => confirm("Eliminar?") && deleteMut.mutate(c.id)} className="p-1 text-ink-mid/70 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
            </div>
            <ul className="text-sm text-ink-mid mt-2 space-y-1">
              {c.itens.map((it, idx) => <li key={idx}>{itemNome(it.item_menu_id)} × {it.quantidade}</li>)}
            </ul>
            <p className="mt-2 font-bold">{c.preco_combo.toLocaleString("pt-AO")} Kz</p>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo combo">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nome *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div>
            <label className="block text-sm font-medium mb-2">Itens do combo</label>
            <div className="space-y-2 max-h-48 overflow-auto">
              {itensMenu.map((i) => {
                const sel = itensSelecionados.find((s) => s.item_menu_id === i.id);
                return (
                  <label key={i.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!sel} onChange={(e) => {
                      if (e.target.checked) setItensSelecionados([...itensSelecionados, { item_menu_id: i.id, quantidade: 1 }]);
                      else setItensSelecionados(itensSelecionados.filter((s) => s.item_menu_id !== i.id));
                    }} />
                    {i.nome}
                  </label>
                );
              })}
              {itensMenu.length === 0 && <p className="text-xs text-ink-mid/70">Crie itens de menu (tipo churrasqueira) primeiro.</p>}
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Preço do combo (Kz)</label>
            <input type="number" min={0} value={precoCombo} onChange={(e) => setPrecoCombo(parseFloat(e.target.value) || 0)} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending || itensSelecionados.length === 0} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
