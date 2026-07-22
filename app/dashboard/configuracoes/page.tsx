"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Loader2,
  Upload,
  Trash2,
  Save,
  AlertCircle,
  Layers,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { companyService, type CompanySettings } from "@/shared/services/financeiro.service";
import { usePermissions } from "@/shared/hooks/use-permissions";

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(255),
  nif: z.string().max(20).optional().or(z.literal("")),
  morada: z.string().max(500).optional().or(z.literal("")),
  telefone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  iban_bcs: z.string().max(50).optional().or(z.literal("")),
  iban_bfa: z.string().max(50).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { has, isLoading: permsLoading } = usePermissions();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!permsLoading && !has("empresa.gerir")) router.replace("/dashboard");
  }, [permsLoading, has, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: companyService.get,
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", nif: "", morada: "", telefone: "", email: "", iban_bcs: "", iban_bfa: "" },
  });

  useEffect(() => {
    if (data) {
      reset({
        nome: data.nome || "",
        nif: data.nif || "",
        morada: data.morada || "",
        telefone: data.telefone || "",
        email: data.email || "",
        iban_bcs: data.iban_bcs || "",
        iban_bfa: data.iban_bfa || "",
      });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: companyService.update,
    onSuccess: (updated) => {
      qc.setQueryData(["company-settings"], updated);
      toast.success("Configurações actualizadas");
    },
    onError: () => toast.error("Erro ao guardar configurações"),
  });

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo demasiado grande (máx 2 MB)");
      return;
    }
    setIsUploading(true);
    try {
      const updated = await companyService.uploadLogo(file);
      qc.setQueryData(["company-settings"], updated);
      toast.success("Logo carregado");
    } catch {
      toast.error("Erro ao carregar logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogoDelete() {
    if (!confirm("Remover o logo actual?")) return;
    try {
      const updated = await companyService.deleteLogo();
      qc.setQueryData(["company-settings"], updated);
      toast.success("Logo removido");
    } catch {
      toast.error("Erro ao remover logo");
    }
  }

  if (!permsLoading && !has("empresa.gerir")) return null;
  if (isLoading) return <div className="p-8 text-center text-ink-mid/50 animate-pulse">A carregar...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Building2 className="h-5 w-5 text-ink" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Configurações da Empresa</h1>
          <p className="text-ink-mid/70 text-sm">Dados que aparecem nos exports e relatórios</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2 text-sm">
        <AlertCircle className="h-4 w-4 text-ink flex-shrink-0 mt-0.5" />
        <p className="text-blue-700 dark:text-blue-300">
          Apenas administradores podem alterar estas configurações. As mudanças aplicam-se a todos os exports Excel e relatórios.
        </p>
      </div>

      <Link href="/dashboard/configuracoes/catalogo" className="block bg-panel dark:bg-panel hover:border-blue-400 border border-ink-ghost/60 dark:border-ink-ghost/20 rounded-xl p-5 shadow-sm transition-all group">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Layers className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-ink dark:text-white">Catálogo do Sistema</h3>
            <p className="text-xs text-ink-mid/70 mt-0.5">Gerir Módulos, Páginas, Permissões e Grupos de Permissões</p>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-mid/50 group-hover:translate-x-1 group-hover:text-ink transition-all mt-1" />
        </div>
      </Link>

      <div className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ink dark:text-white mb-4">Logótipo</h2>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-ink-ghost/80 dark:border-gray-700 flex items-center justify-center bg-surface dark:bg-ink-ghost/20 overflow-hidden">
            {data?.logo_url ? (
              <img src={data.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <Building2 className="h-10 w-10 text-ink-mid/50" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-ink-mid dark:text-gray-400">
              Formatos aceites: PNG, JPG, WEBP, SVG. Tamanho máximo: 2 MB.
              Recomendado: 200×200 px com fundo transparente.
            </p>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {data?.logo_url ? "Trocar logo" : "Carregar logo"}
              </button>
              {data?.logo_url && (
                <button
                  onClick={handleLogoDelete}
                  className="flex items-center gap-2 border border-ink-ghost/80 dark:border-gray-600 hover:bg-surface dark:hover:bg-ink-ghost/20 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((d) => {
          const cleaned = Object.fromEntries(
            Object.entries(d).map(([k, v]) => [k, v === "" ? undefined : v])
          );
          updateMutation.mutate(cleaned, { onSuccess: () => setEditMode(false) });
        })}
        className="bg-panel dark:bg-panel rounded-xl border border-ink-ghost/60 dark:border-ink-ghost/20 p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink dark:text-white">Dados Fiscais e de Contacto</h2>
          {!editMode ? (
            <button type="button" onClick={() => setEditMode(true)} className="flex items-center gap-1.5 bg-ink hover:bg-ink/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
          ) : (
            <button type="button" onClick={() => { setEditMode(false); if (data) reset({ nome: data.nome||"", nif: data.nif||"", morada: data.morada||"", telefone: data.telefone||"", email: data.email||"", iban_bcs: data.iban_bcs||"", iban_bfa: data.iban_bfa||"" }); }} className="text-xs text-ink-mid/70 hover:text-gray-700 underline">
              Cancelar edição
            </button>
          )}
        </div>
        {!editMode && (
          <div className="bg-surface dark:bg-gray-800/30 border border-ink-ghost/60 dark:border-ink-ghost/20 rounded-lg p-2.5 text-xs text-ink-mid dark:text-gray-400">
            🔒 Modo de visualização. Clique em <strong>Editar</strong> para alterar os dados.
          </div>
        )}

        <fieldset disabled={!editMode} className={!editMode ? "opacity-70 pointer-events-none" : ""}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da empresa *</label>
            <input
              {...register("nome")}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
              placeholder="Nome da Empresa, Lda"
            />
            {errors.nome && <p className="text-danger text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIF</label>
            <input
              {...register("nif")}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
              placeholder="5000000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
            <input
              {...register("telefone")}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
              placeholder="+244 923 000 000"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
              placeholder="geral@empresa.co.ao"
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Morada</label>
            <textarea
              {...register("morada")}
              rows={2}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink"
              placeholder="Rua Principal, Luanda, Angola"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN BCS</label>
            <input
              {...register("iban_bcs")}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink font-mono"
              placeholder="AO06.0000.0000.0000.0000.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN BFA</label>
            <input
              {...register("iban_bfa")}
              className="w-full rounded-lg border border-ink-ghost/80 dark:border-gray-600 px-3 py-2.5 text-sm bg-panel dark:bg-ink-ghost/20 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-ink font-mono"
              placeholder="AO06.0000.0000.0000.0000.0"
            />
          </div>
        </div>

        </fieldset>
        <div className="pt-4 border-t border-ink-ghost/40 dark:border-ink-ghost/15 flex items-center justify-between">
          <p className="text-xs text-ink-mid/50">
            {data?.updated_at && `Última actualização: ${new Date(data.updated_at).toLocaleString("pt-PT")}`}
          </p>
          {editMode && (
            <button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="flex items-center gap-2 bg-ink hover:bg-ink/90 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Alterações
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
