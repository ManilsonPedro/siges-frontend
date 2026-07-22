"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { portalAuthService } from "@/shared/services/portal.service";

export default function PortalRegistarPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", password: "" });

  const mut = useMutation({
    mutationFn: () => portalAuthService.registar(form),
    onSuccess: () => {
      toast.success("Conta criada com sucesso");
      router.push("/portal/minhas-reservas");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Erro ao criar conta"),
  });

  return (
    <div className="max-w-sm mx-auto bg-panel dark:bg-panel rounded-xl shadow p-6">
      <h1 className="text-xl font-bold text-ink dark:text-white mb-1">Criar conta</h1>
      <p className="text-sm text-ink-mid/70 mb-6">Registe-se para reservar a lavagem do seu veículo.</p>

      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha *</label>
          <input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
            placeholder="Mínimo 8 caracteres"
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>
        <button type="submit" disabled={mut.isPending}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ink text-white rounded-lg disabled:opacity-50">
          {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Criar conta
        </button>
      </form>

      <p className="text-sm text-ink-mid/70 mt-4 text-center">
        Já tem conta? <Link href="/portal/login" className="text-ink dark:text-white font-medium hover:underline">Iniciar sessão</Link>
      </p>
    </div>
  );
}
