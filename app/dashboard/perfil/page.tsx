"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/shared/store/auth.store";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { authService } from "@/shared/services/auth.service";

const schema = z
  .object({
    current_password: z.string().min(1, "Password actual obrigatória"),
    new_password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm_password: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "As passwords não coincidem",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-panel text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function PerfilPage() {
  const { user } = useAuthStore();
  const { permissions, grupoId } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await authService.changePassword(data.current_password, data.new_password);
      toast.success("Password alterada com sucesso");
      reset();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao alterar password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Perfil</h1>
        <p className="text-ink-mid/70 dark:text-ink-mid/60 text-sm">Informações da conta e segurança</p>
      </div>

      {/* Info Card */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-ink flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-ink dark:text-white truncate">{user?.full_name}</p>
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <ShieldCheck className="h-3 w-3" />
                {grupoId ? "Com grupo" : "Sem grupo"}
              </span>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  user?.is_active
                    ? "bg-green-100 text-live"
                    : "bg-danger/10 text-danger"
                }`}
              >
                {user?.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
          <div>
            <p className="text-xs text-ink-mid/50 uppercase tracking-wide mb-1">Nome</p>
            <p className="text-sm font-medium text-ink dark:text-white">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-ink-mid/50 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm font-medium text-ink dark:text-white">{user?.email}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-ink-mid/50 uppercase tracking-wide mb-1">Acesso</p>
            <p className="text-sm font-medium text-ink dark:text-white">
              {grupoId ? `${permissions.length} permissão(ões) concedida(s) pelo grupo` : "Sem grupo atribuído"}
            </p>
          </div>
        </div>

        {/* Permissões */}
        <div className="mt-5 pt-4 border-t border-ink-ghost/40 dark:border-ink-ghost/15">
          <p className="text-xs text-ink-mid/50 uppercase tracking-wide mb-3">Permissões de acesso</p>
          {permissions.length === 0 ? (
            <p className="text-sm text-ink-mid/70 dark:text-ink-mid/60">
              Sem permissões. Contacte o administrador para lhe atribuir um grupo.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {permissions.map((perm) => (
                <li key={perm} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-mono text-xs">{perm}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <KeyRound className="h-4 w-4 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink dark:text-white">Alterar Password</h2>
            <p className="text-xs text-ink-mid/70 dark:text-ink-mid/60">A nova password deve ter pelo menos 8 caracteres</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelCls}>Password Actual</label>
            <input
              {...register("current_password")}
              type="password"
              placeholder="A sua password actual"
              className={inputCls}
            />
            {errors.current_password && (
              <p className="text-danger text-xs mt-1">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Nova Password</label>
            <input
              {...register("new_password")}
              type="password"
              placeholder="Mínimo 8 caracteres"
              className={inputCls}
            />
            {errors.new_password && (
              <p className="text-danger text-xs mt-1">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Confirmar Nova Password</label>
            <input
              {...register("confirm_password")}
              type="password"
              placeholder="Repita a nova password"
              className={inputCls}
            />
            {errors.confirm_password && (
              <p className="text-danger text-xs mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              Alterar Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
