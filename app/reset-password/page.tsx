"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound, Loader2, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { api } from "@/shared/services/api";

const schema = z.object({
  new_password: z.string().min(8, "Mínimo 8 caracteres").max(128),
  confirm: z.string(),
}).refine((d) => d.new_password === d.confirm, {
  path: ["confirm"],
  message: "As senhas não coincidem",
});

type FormData = z.infer<typeof schema>;

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string>("");
  const [userInfo, setUserInfo] = useState<{ email: string; full_name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      setTokenError("Token em falta no link.");
      setVerifying(false);
      return;
    }
    api.get(`/auth/verify-reset-token/${token}`)
      .then((r) => {
        setTokenValid(true);
        setUserInfo({ email: r.data.email, full_name: r.data.full_name });
      })
      .catch((e: { response?: { data?: { detail?: string } } }) => {
        setTokenError(e?.response?.data?.detail || "Link inválido ou expirado");
      })
      .finally(() => setVerifying(false));
  }, [token]);

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: data.new_password });
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Erro ao redefinir senha");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 mb-4">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Definir nova senha</h1>
        </div>

        {verifying ? (
          <div className="text-center text-gray-500 py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-600" />
            A validar link...
          </div>
        ) : tokenError ? (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium mb-1">Link inválido</p>
                <p>{tokenError}</p>
              </div>
            </div>
            <Link
              href="/forgot-password"
              className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Solicitar novo link
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
            </Link>
          </div>
        ) : done ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Senha redefinida com sucesso. A redireccionar para o login...
            </p>
            <Link href="/login" className="inline-block text-blue-600 hover:underline text-sm">
              Ir agora
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {userInfo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400">Conta:</p>
                <p className="font-medium text-gray-900 dark:text-white">{userInfo.full_name}</p>
                <p className="text-xs text-gray-500">{userInfo.email}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nova senha
              </label>
              <input
                {...register("new_password")}
                type="password"
                autoFocus
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 8 caracteres"
              />
              {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar senha
              </label>
              <input
                {...register("confirm")}
                type="password"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Redefinir senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
