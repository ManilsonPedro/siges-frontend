"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmService } from "@/shared/services/crm.service";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, X, Loader2, ArrowRightCircle } from "lucide-react";

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

const ESTADO_COLOR: Record<string, string> = {
  novo: "bg-ink/10 text-ink", qualificado: "bg-amber-100 text-amber-700",
  descartado: "bg-danger/10 text-danger", convertido: "bg-live-dim text-live",
};

export default function LeadsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", empresa: "", telefone: "", email: "", origem: "outro" });

  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: () => crmService.listLeads() });
  const { data: etapas = [] } = useQuery({ queryKey: ["pipeline-etapas"], queryFn: crmService.listEtapas });

  const createMut = useMutation({
    mutationFn: () => crmService.createLead(form),
    onSuccess: () => { toast.success("Lead criado"); qc.invalidateQueries({ queryKey: ["leads"] }); setShowForm(false); setForm({ nome: "", empresa: "", telefone: "", email: "", origem: "outro" }); },
  });
  const converterMut = useMutation({
    mutationFn: (id: string) => crmService.converterLead(id, etapas[0]?.id || ""),
    onSuccess: () => { toast.success("Lead convertido em cliente + oportunidade"); qc.invalidateQueries({ queryKey: ["leads"] }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro"),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Leads</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo lead
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Origem</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && leads.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-mid/70">Nenhum lead</td></tr>}
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 text-sm">{l.nome}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{l.empresa || "—"}</td>
                <td className="px-4 py-3 text-sm text-ink-mid">{l.telefone || l.email || "—"}</td>
                <td className="px-4 py-3 text-sm capitalize">{l.origem}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[l.estado]}`}>{l.estado}</span></td>
                <td className="px-4 py-3 text-right">
                  {l.estado !== "convertido" && etapas.length > 0 && (
                    <button onClick={() => converterMut.mutate(l.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                      <ArrowRightCircle className="h-3.5 w-3.5" /> Converter
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo lead">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Empresa</label><input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs mb-1">Telefone</label><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-xs mb-1">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-2 py-1 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Origem</label>
            <select value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="indicacao">Indicação</option><option value="site">Site</option><option value="feira">Feira</option><option value="redes_sociais">Redes Sociais</option><option value="outro">Outro</option>
            </select></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
