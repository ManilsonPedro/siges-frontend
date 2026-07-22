"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atendimentoService } from "@/shared/services/crm.service";
import { useState } from "react";
import { toast } from "sonner";
import { Headphones, Plus, X, Loader2, CheckCircle2 } from "lucide-react";

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
  aberta: "bg-amber-100 text-amber-700", em_analise: "bg-ink/10 text-ink", resolvida: "bg-live-dim text-live", fechada: "bg-surface text-ink-mid",
  aberto: "bg-amber-100 text-amber-700", em_curso: "bg-ink/10 text-ink", resolvido: "bg-live-dim text-live",
};

export default function AtendimentoPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"reclamacoes" | "tickets">("reclamacoes");
  const [showForm, setShowForm] = useState(false);
  const [recForm, setRecForm] = useState({ assunto: "", descricao: "", canal: "telefone", gravidade: "media" });
  const [ticketForm, setTicketForm] = useState({ assunto: "", descricao: "", prioridade: "media" });

  const { data: reclamacoes = [] } = useQuery({ queryKey: ["reclamacoes"], queryFn: () => atendimentoService.listReclamacoes() });
  const { data: tickets = [] } = useQuery({ queryKey: ["tickets"], queryFn: () => atendimentoService.listTickets() });

  const createRecMut = useMutation({
    mutationFn: () => atendimentoService.createReclamacao(recForm),
    onSuccess: () => { toast.success("Reclamação registada"); qc.invalidateQueries({ queryKey: ["reclamacoes"] }); setShowForm(false); },
  });
  const createTicketMut = useMutation({
    mutationFn: () => atendimentoService.createTicket(ticketForm),
    onSuccess: () => { toast.success("Ticket criado"); qc.invalidateQueries({ queryKey: ["tickets"] }); setShowForm(false); },
  });
  const resolverRecMut = useMutation({
    mutationFn: (id: string) => atendimentoService.resolverReclamacao(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reclamacoes"] }),
  });
  const resolverTicketMut = useMutation({
    mutationFn: (id: string) => atendimentoService.resolverTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Headphones className="h-7 w-7 text-ink" />
          <h1 className="text-2xl font-bold text-ink dark:text-white">Atendimento</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink/90">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      <div className="flex gap-2 border-b border-ink-ghost/40 dark:border-ink-ghost/15">
        {(["reclamacoes", "tickets"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${tab === t ? "border-ink text-ink" : "border-transparent text-ink-mid/70"}`}>{t}</button>
        ))}
      </div>

      {tab === "reclamacoes" && (
        <div className="space-y-2">
          {reclamacoes.length === 0 && <p className="text-center text-ink-mid/70 py-8">Nenhuma reclamação</p>}
          {reclamacoes.map((r) => (
            <div key={r.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.assunto}</p>
                <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[r.estado]}`}>{r.estado}</span>
              </div>
              <p className="text-sm text-ink-mid mt-1">{r.descricao}</p>
              {r.estado !== "resolvida" && r.estado !== "fechada" && (
                <button onClick={() => resolverRecMut.mutate(r.id)} className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Resolver
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "tickets" && (
        <div className="space-y-2">
          {tickets.length === 0 && <p className="text-center text-ink-mid/70 py-8">Nenhum ticket</p>}
          {tickets.map((t) => (
            <div key={t.id} className="bg-panel dark:bg-panel rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{t.assunto}</p>
                <span className={`text-xs px-2 py-1 rounded ${ESTADO_COLOR[t.estado]}`}>{t.estado}</span>
              </div>
              <p className="text-sm text-ink-mid mt-1">{t.descricao}</p>
              {t.estado !== "resolvido" && t.estado !== "fechado" && (
                <button onClick={() => resolverTicketMut.mutate(t.id)} className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-lg hover:bg-surface">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Resolver
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={tab === "reclamacoes" ? "Nova reclamação" : "Novo ticket"}>
        {tab === "reclamacoes" ? (
          <form onSubmit={(e) => { e.preventDefault(); createRecMut.mutate(); }} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Assunto *</label><input value={recForm.assunto} onChange={(e) => setRecForm({ ...recForm, assunto: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-sm font-medium mb-1">Descrição *</label><textarea value={recForm.descricao} onChange={(e) => setRecForm({ ...recForm, descricao: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-sm font-medium mb-1">Canal</label>
              <select value={recForm.canal} onChange={(e) => setRecForm({ ...recForm, canal: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="telefone">Telefone</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="presencial">Presencial</option><option value="app">App</option>
              </select></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={createRecMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createRecMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
            </div>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); createTicketMut.mutate(); }} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Assunto *</label><input value={ticketForm.assunto} onChange={(e) => setTicketForm({ ...ticketForm, assunto: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-sm font-medium mb-1">Descrição *</label><textarea value={ticketForm.descricao} onChange={(e) => setTicketForm({ ...ticketForm, descricao: e.target.value })} required className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" /></div>
            <div><label className="block text-sm font-medium mb-1">Prioridade</label>
              <select value={ticketForm.prioridade} onChange={(e) => setTicketForm({ ...ticketForm, prioridade: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20">
                <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente</option>
              </select></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={createTicketMut.isPending} className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50">{createTicketMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
