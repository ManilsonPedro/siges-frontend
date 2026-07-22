"use client";
import { EnterpriseSidebar } from "@/shared/ui/enterprise-sidebar";
import { EnterpriseHeader }  from "@/shared/ui/enterprise-header";
import { CommandPalette }    from "@/shared/ui/command-palette";
import { KeyboardShortcuts } from "@/shared/ui/keyboard-shortcuts";
import { ForcePasswordChangeModal } from "@/shared/ui/force-password-change-modal";
import { IdleLogout }        from "@/shared/ui/idle-logout";
import { useAuthStore }      from "@/shared/store/auth.store";
import { useEffect }         from "react";
import { useRouter }         from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => { loadUser(); }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      const t = setTimeout(() => {
        if (!useAuthStore.getState().isAuthenticated) router.push("/login");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, router]);

  const env = process.env.NEXT_PUBLIC_ENV;
  const banner =
    env === "development"
      ? { bg: "bg-amber-400 text-amber-950", text: "⚠ AMBIENTE DE DESENVOLVIMENTO · Não usar para operações reais" }
      : env === "preview"
      ? { bg: "bg-orange-400 text-orange-950", text: "⚠ AMBIENTE DE PREVIEW" }
      : null;

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-surface">
      {/* Sidebar enterprise fixa */}
      <EnterpriseSidebar />

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Banner de ambiente */}
        {banner && (
          <div className={`${banner.bg} text-xs font-bold text-center py-1 tracking-wider shrink-0`}>
            {banner.text}
          </div>
        )}

        {/* Header fixo */}
        <EnterpriseHeader />

        {/* Conteúdo scrollável */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Utilitários globais */}
      <CommandPalette />
      <KeyboardShortcuts />
      <ForcePasswordChangeModal />
      <IdleLogout />
    </div>
  );
}
