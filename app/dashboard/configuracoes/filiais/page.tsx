"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Plus, X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { operacoesEstacaoService } from "@/shared/services/operacoes.service";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel dark:bg-panel rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-ink-mid/50 hover:text-ink-mid"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function FiliaisPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", morada: "", activo: true });

  const { data: filiais = [], isLoading } = useQuery({
    queryKey: ["filiais"],
    queryFn: operacoesEstacaoService.listFiliais,
  });

  const createMut = useMutation({
    mutationFn: () => operacoesEstacaoService.createFilial(form),
    onSuccess: () => {
      toast.success("Filial criada");
      qc.invalidateQueries({ queryKey: ["filiais"] });
      setShowForm(false);
      setForm({ nome: "", morada: "", activo: true });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => operacoesEstacaoService.deleteFilial(id),
    onSuccess: () => { toast.success("Filial eliminada"); qc.invalidateQueries({ queryKey: ["filiais"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  const activas = filiais.filter((f) => f.activo).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Filiais da Empresa</h1>
          <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">Gestão das unidades físicas da empresa.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90"
        >
          <Plus className="w-4 h-4" /> Nova Filial
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total de Filiais", valor: filiais.length },
          { label: "Activas", valor: activas },
          { label: "Inactivas", valor: filiais.length - activas },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel p-4">
            <p className="text-xs text-ink-mid/70 mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-ink dark:text-white">{item.valor}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-ink-ghost/60 bg-panel dark:border-ink-ghost/20 dark:bg-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-ghost/40 dark:border-ink-ghost/15 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-mid dark:text-gray-300">Lista de Filiais ({filiais.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface dark:bg-gray-700/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-mid/70 uppercase tracking-wide">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-mid/70 uppercase tracking-wide">Morada</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-mid/70 uppercase tracking-wide">Estado</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-ink-mid/70 uppercase tracking-wide">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-ghost/40 dark:divide-gray-700">
              {isLoading && <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
              {!isLoading && filiais.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-mid/70">Nenhuma filial cadastrada</td></tr>}
              {filiais.map((filial) => (
                <tr key={filial.id} className="hover:bg-surface dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-ink-mid/50 flex-shrink-0" />
                      <span className="font-medium text-ink dark:text-white">{filial.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-mid dark:text-gray-400">{filial.morada || "—"}</td>
                  <td className="px-5 py-3.5">
                    {filial.activo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-live-dim text-live">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger">
                        <XCircle className="w-3.5 h-3.5" /> Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => confirm(`Eliminar "${filial.nome}"?`) && deleteMut.mutate(filial.id)}
                      className="p-2 text-ink-mid/70 hover:text-danger"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova filial">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Morada</label>
            <input
              value={form.morada} onChange={(e) => setForm({ ...form, morada: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
