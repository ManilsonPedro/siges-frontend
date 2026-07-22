"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { portalAuthService } from "@/shared/services/portal.service";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mut = useMutation({
    mutationFn: () => portalAuthService.login({ email, password }),
    onSuccess: () => {
      toast.success("Sessão iniciada");
      router.push("/portal/minhas-reservas");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Email ou senha incorrectos"),
  });

  return (
    <div className="max-w-sm mx-auto bg-panel dark:bg-panel rounded-xl shadow p-6">
      <h1 className="text-xl font-bold text-ink dark:text-white mb-1">Iniciar sessão</h1>
      <p className="text-sm text-ink-mid/70 mb-6">Aceda à sua conta para reservar uma lavagem.</p>

      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full border rounded-lg px-3 py-2 dark:bg-ink-ghost/20 dark:border-ink-ghost/20" />
        </div>
        <button type="submit" disabled={mut.isPending}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ink text-white rounded-lg disabled:opacity-50">
          {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Entrar
        </button>
      </form>

      <p className="text-sm text-ink-mid/70 mt-4 text-center">
        Ainda não tem conta? <Link href="/portal/registar" className="text-ink dark:text-white font-medium hover:underline">Registe-se</Link>
      </p>
    </div>
  );
}
