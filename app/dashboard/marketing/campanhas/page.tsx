"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketingService } from "@/shared/services/crm.service";
import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, Plus, X, Loader2, Send } from "lucide-react";

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

const ESTADO_COLOR: Record<string, string> = {
  rascunho: "bg-surface text-ink-mid", agendada: "bg-amber-100 text-amber-700", enviada: "bg-live-dim text-live", cancelada: "bg-danger/10 text-danger",
};

export default function CampanhasPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", tipo: "email", conteudo: "" });

  const { data: campanhas = [], isLoading } = useQuery({ queryKey: ["campanhas"], queryFn: marketingService.listCampanhas });

  const createMut = useMutation({
    mutationFn: () => marketingService.createCampanha(form),
    onSuccess: () => { toast.success("Campanha criada"); qc.invalidateQueries({ queryKey: ["campanhas"] }); setShowForm(false); },
  });
  const enviarMut = useMutation({
    mutationFn: (id: string) => marketingService.enviarCampanha(id),
    onSuccess: () => { toast.success("Campanha enviada"); qc.invalidateQueries({ queryKey: ["campanhas"] }); },
  });
  const cancelarMut = useMutation({
    mutationFn: (id: string) => marketingService.cancelarCampanha(id),
    onSuccess: () => { toast.success("Campanha cancelada"); qc.invalidateQueries({ queryKey: ["campanhas"] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Campanhas</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Nova campanha
        </button>
      </div>

      <div className="bg-panel dark:bg-panel rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface dark:bg-ink-ghost/20"><tr className="text-left text-xs uppercase text-ink-mid/70">
            <th className="px-4 py-3">Nome</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Enviados</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acções</th>
          </tr></thead>
          <tbody className="divide-y divide-ink-ghost/40 dark:divide-ink-ghost/15">
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
            {!isLoading && campanhas.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-mid/70">Nenhuma campanha</td></tr>}
            {campanhas.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-sm">{c.nome}</td>
                <td className="px-4 py-3 text-sm uppercase">{c.tipo}</td>
                <td className="px-4 py-3 text-sm">{c.enviados_count}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[c.estado]}`}>{c.estado}</span></td>
                <td className="px-4 py-3 text-right space-x-2">
                  {c.estado === "rascunho" && (
                    <>
                      <button onClick={() => enviarMut.mutate(c.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-ink text-white rounded-lg hover:bg-ink/90">
                        <Send className="h-3.5 w-3.5" /> Enviar
                      </button>
                      <button onClick={() => cancelarMut.mutate(c.id)} className="text-xs px-2 py-1 border rounded-lg hover:bg-surface">Cancelar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova campanha">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nome *</label><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div><label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
              <option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="promocao">Promoção</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Conteúdo *</label><textarea value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
