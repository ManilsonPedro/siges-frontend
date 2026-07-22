"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/shared/services/auth.service";
import { useAuthStore } from "@/shared/store/auth.store";
import { toast } from "sonner";
import { KeyRound, Loader2, ShieldAlert, Eye, EyeOff } from "lucide-react";

export function ForcePasswordChangeModal() {
  const user = useAuthStore((s) => s.user);
  const loadUser = useAuthStore((s) => s.loadUser);

  const [senhaActual, setSenhaActual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showActual, setShowActual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const mut = useMutation({
    mutationFn: () => authService.changePassword(senhaActual, novaSenha),
    onSuccess: async () => {
      toast.success("Senha alterada com sucesso");
      await loadUser();
    },
    onError: (e: { response?: { data?: { detail?: string } } }) =>
      toast.error(e?.response?.data?.detail || "Erro ao alterar senha"),
  });

  if (!user?.must_change_password) return null;

  const valido = senhaActual.length > 0 && novaSenha.length >= 8 && novaSenha === confirmar && novaSenha !== user.email;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 border-2 border-amber-300 dark:border-amber-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-900/40">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Defina a sua nova senha</h2>
            <p className="text-xs text-gray-500">Primeiro acesso — é obrigatório definir uma senha pessoal antes de continuar.</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300 mb-4">
          Introduza a senha temporária que lhe foi fornecida e escolha uma senha pessoal forte para continuar.
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha actual *</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showActual ? "text" : "password"}
                value={senhaActual}
                onChange={(e) => setSenhaActual(e.target.value)}
                placeholder="Senha temporária fornecida"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-9 pr-10 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowActual((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova senha *</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showNova ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-9 pr-10 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowNova((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showNova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar nova senha *</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showConfirmar ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-9 pr-10 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmar((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmar && novaSenha !== confirmar && (
              <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
            )}
            {novaSenha && novaSenha === user.email && (
              <p className="text-xs text-red-500 mt-1">A nova senha não pode ser igual ao email.</p>
            )}
            {novaSenha && novaSenha.length < 8 && (
              <p className="text-xs text-red-500 mt-1">Mínimo 8 caracteres.</p>
            )}
          </div>

          <button
            onClick={() => mut.mutate()}
            disabled={!valido || mut.isPending}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm mt-2"
          >
            {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Definir nova senha e continuar
          </button>
        </div>
      </div>
    </div>
  );
}
