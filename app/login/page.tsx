"use client";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/store/auth.store";
import { permissoesService } from "@/shared/services/financeiro.service";
import { Loader2, LogIn, ShieldAlert, Clock, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Password obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface text-ink-mid/60 text-sm">
        A carregar…
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const suspended = sp.get("suspended") === "1";
  const idle = sp.get("idle") === "1";
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (suspended) toast.error("A sua conta foi suspensa pelo administrador.", { duration: 10000 });
    else if (idle) toast.warning("Sessão encerrada por inatividade.", { duration: 8000 });
  }, [suspended, idle]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success("Login efectuado com sucesso");
      let podeDashboard = false;
      try {
        const perms = await permissoesService.getMinhasPermissoes();
        podeDashboard = perms.permissions.includes("dashboard.ver");
      } catch {}
      router.push(podeDashboard ? "/dashboard" : "/dashboard/movimentos");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { detail: string } } }).response?.data?.detail
          : "Erro ao fazer login";
      toast.error(msg || "Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen flex bg-surface dark:bg-surface">
      {/* Painel esquerdo — identidade */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ background: "#0b3b6f" }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              SB
            </div>
            <div>
              <p className="text-white font-semibold text-[0.9375rem] leading-none">SIGES BI JENNOS</p>
              <p className="text-white/50 text-2xs tracking-widest uppercase mt-0.5">Sistema de Gestão</p>
            </div>
          </div>

          <h1
            className="text-white font-semibold leading-tight mb-4"
            style={{ fontSize: "1.875rem", letterSpacing: "-0.03em" }}
          >
            A sua estação de serviço,<br />numa só plataforma.
          </h1>
          <p className="text-white/50 text-[0.875rem] leading-relaxed">
            Lavagem automóvel, caixa e vendas, stocks, compras, RH e
            finanças — gestão completa e integrada da sua operação.
          </p>
        </div>

        {/* Pulso — versão expandida no login */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-2xs tracking-widest uppercase font-semibold">
              Sistema activo
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-live"
              style={{ animation: "pulse 2.4s ease-in-out infinite" }}
            />
          </div>
          <div className="h-px w-full bg-white/10" />
          <p className="text-white/30 text-2xs mt-3">
            SIGES BI JENNOS &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
              style={{ background: "#0b3b6f" }}
            >
              SB
            </div>
            <div>
              <p className="font-semibold text-ink dark:text-white text-[0.9375rem] leading-none">SIGES BI JENNOS</p>
              <p className="text-ink-mid/60 text-2xs tracking-widest uppercase mt-0.5">Sistema de Gestão</p>
            </div>
          </div>

          <h2 className="text-ink dark:text-white font-semibold text-[1.375rem] mb-1"
              style={{ letterSpacing: "-0.02em" }}>
            Iniciar sessão
          </h2>
          <p className="text-ink-mid/60 text-[0.875rem] mb-7">
            Introduza as suas credenciais para continuar.
          </p>

          {/* Alertas */}
          {suspended && (
            <div className="mb-5 flex items-start gap-2.5 bg-danger/8 border border-danger/20 rounded-lg p-3 text-[0.875rem] text-danger">
              <ShieldAlert style={{ width: 15, height: 15, strokeWidth: 1.5 }} className="shrink-0 mt-0.5" />
              <p>A sua conta foi <strong>suspensa</strong>. Contacte o administrador.</p>
            </div>
          )}
          {idle && !suspended && (
            <div className="mb-5 flex items-start gap-2.5 bg-amber/8 border border-amber/20 rounded-lg p-3 text-[0.875rem] text-amber">
              <Clock style={{ width: 15, height: 15, strokeWidth: 1.5 }} className="shrink-0 mt-0.5" />
              <p>Sessão encerrada após <strong>inatividade</strong>. Inicie sessão novamente.</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[0.8125rem] font-medium text-ink dark:text-white mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-[0.875rem]",
                  "bg-panel dark:bg-ink-ghost/10 text-ink dark:text-white",
                  "border border-ink-ghost/80 dark:border-ink-ghost/30",
                  "focus:outline-none focus:border-ink dark:focus:border-ink-mid",
                  "placeholder-ink-mid/40 transition-colors"
                )}
                placeholder="utilizador@empresa.ao"
              />
              {errors.email && (
                <p className="text-danger text-2xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[0.8125rem] font-medium text-ink dark:text-white mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={cn(
                    "w-full rounded-lg px-3 pr-10 py-2.5 text-[0.875rem]",
                    "bg-panel dark:bg-ink-ghost/10 text-ink dark:text-white",
                    "border border-ink-ghost/80 dark:border-ink-ghost/30",
                    "focus:outline-none focus:border-ink dark:focus:border-ink-mid",
                    "placeholder-ink-mid/40 transition-colors"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mid/50 hover:text-ink-mid dark:hover:text-ink-mid transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff style={{ width: 15, height: 15, strokeWidth: 1.5 }} />
                    : <Eye    style={{ width: 15, height: 15, strokeWidth: 1.5 }} />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-danger text-2xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "py-2.5 rounded-lg text-[0.875rem] font-semibold text-white",
                "transition-colors duration-150",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
              style={{ background: "#0b3b6f" }}
            >
              {isLoading
                ? <Loader2 style={{ width: 15, height: 15, strokeWidth: 1.5 }} className="animate-spin" />
                : <LogIn   style={{ width: 15, height: 15, strokeWidth: 1.5 }} />
              }
              {isLoading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-[0.8125rem] text-ink-mid/60 hover:text-ink dark:hover:text-white transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
