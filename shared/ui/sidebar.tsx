"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Tag,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCog,
  ShieldCheck,
  UserCircle,
  Building2,
  Trash2,
  Lock,
  Target,
  FolderKanban,
  Settings,
  Users2,
  Package,
  Boxes,
  Warehouse,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/store/auth.store";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { companyService } from "@/shared/services/financeiro.service";
import { cn } from "@/shared/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

interface NavLeaf {
  type: "leaf";
  label: string;
  href: string;
  icon: typeof Users;
  // Permissão sentinela necessária para ver o item; undefined = sempre visível.
  perm?: string;
}

interface NavGroup {
  type: "group";
  label: string;
  icon: typeof Users;
  children: NavLeaf[];
}

type NavItem = NavLeaf | NavGroup;

const NAV: NavItem[] = [
  { type: "leaf", label: "Dashboard",  href: "/dashboard",                icon: LayoutDashboard, perm: "dashboard.ver" },
  { type: "leaf", label: "Movimentos", href: "/dashboard/movimentos",     icon: ArrowLeftRight,  perm: "movimentos.listar" },
  {
    type: "group", label: "Gestão", icon: FolderKanban,
    children: [
      { type: "leaf", label: "Fornecedores", href: "/dashboard/fornecedores", icon: Users,  perm: "fornecedores.listar" },
      { type: "leaf", label: "Clientes",     href: "/dashboard/clientes",     icon: Users,  perm: "clientes.listar" },
      { type: "leaf", label: "Produtos",     href: "/dashboard/produtos",     icon: Package, perm: "produtos.listar" },
      { type: "leaf", label: "Estoque",      href: "/dashboard/estoque",      icon: Boxes,   perm: "estoque.ver" },
      { type: "leaf", label: "Caixa",        href: "/dashboard/caixa",        icon: ShoppingCart, perm: "caixa.ver" },
      { type: "leaf", label: "Conceitos",    href: "/dashboard/conceitos",    icon: Tag,    perm: "conceitos.listar" },
      { type: "leaf", label: "Fundos",       href: "/dashboard/fundos",       icon: Wallet, perm: "fundos.ver" },
      { type: "leaf", label: "Origens do Fundo", href: "/dashboard/origens-fundo", icon: Wallet, perm: "fundos.ver" },
      { type: "leaf", label: "Períodos",     href: "/dashboard/periodos",     icon: Lock,   perm: "periodos.ver" },
    ],
  },
  {
    type: "group", label: "Gestão de Utilizadores", icon: Users2,
    children: [
      { type: "leaf", label: "Utilizadores", href: "/dashboard/utilizadores", icon: UserCog, perm: "users.listar" },
    ],
  },
  { type: "leaf", label: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3,   perm: "relatorios.ver" },
  { type: "leaf", label: "Auditoria",  href: "/dashboard/auditoria",  icon: ShieldCheck, perm: "auditoria.ver" },
  { type: "leaf", label: "Perfil",     href: "/dashboard/perfil",     icon: UserCircle },
  {
    type: "group", label: "Configurações", icon: Settings,
    children: [
      { type: "leaf", label: "Empresa", href: "/dashboard/configuracoes", icon: Building2, perm: "empresa.gerir" },
      { type: "leaf", label: "Lixeira", href: "/dashboard/lixeira",       icon: Trash2,    perm: "lixeira.ver" },
    ],
  },
];

function visibleFor(has: (code: string) => boolean): NavItem[] {
  const ok = (leaf: NavLeaf) => !leaf.perm || has(leaf.perm);
  return NAV.filter((item) => {
    if (item.type === "group") return item.children.some(ok);
    return ok(item);
  }).map((item) => {
    if (item.type === "group") {
      return { ...item, children: item.children.filter(ok) };
    }
    return item;
  });
}

const GROUPS_STORAGE_KEY = "sidebar:expanded-groups";

function useExpandedGroups() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (raw) setExpanded(JSON.parse(raw));
    } catch {}
  }, []);

  function toggle(label: string) {
    // Accordion: ao abrir um menu, fecha todos os outros
    setExpanded((prev) => {
      const isCurrentlyOpen = !!prev[label];
      const next: Record<string, boolean> = isCurrentlyOpen ? {} : { [label]: true };
      try { localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function ensureOpen(label: string) {
    setExpanded((prev) => {
      if (prev[label]) return prev;
      // Accordion: ao garantir abertura de um, fecha os outros
      const next: Record<string, boolean> = { [label]: true };
      try { localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return { expanded, toggle, ensureOpen };
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { expanded, toggle, ensureOpen } = useExpandedGroups();
  const { data: company } = useQuery({
    queryKey: ["company-settings"],
    queryFn: companyService.get,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { has } = usePermissions();
  const items = visibleFor(has);

  // Auto-expandir grupo que contém a rota actual
  useEffect(() => {
    items.forEach((item) => {
      if (item.type === "group" && item.children.some((c) => isActive(pathname, c.href))) {
        ensureOpen(item.label);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success("Sessão terminada");
    router.push("/login");
  };

  function renderLeaf(leaf: NavLeaf, indented = false) {
    const Icon = leaf.icon;
    const active = isActive(pathname, leaf.href);
    return (
      <Link
        key={leaf.href}
        href={leaf.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          indented && !collapsed && "ml-3 pl-3 border-l border-gray-700",
          active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{leaf.label}</span>}
      </Link>
    );
  }

  function renderGroup(group: NavGroup) {
    const Icon = group.icon;
    const isOpen = expanded[group.label] ?? false;
    const hasActiveChild = group.children.some((c) => isActive(pathname, c.href));

    if (collapsed) {
      // Em modo colapsado: mostrar todos os children directamente (mais clicks visíveis)
      return (
        <div key={group.label} className="space-y-1">
          {group.children.map((c) => renderLeaf(c))}
        </div>
      );
    }

    return (
      <div key={group.label} className="space-y-1">
        <button
          onClick={() => toggle(group.label)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            hasActiveChild ? "text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
        </button>
        {isOpen && (
          <div className="space-y-0.5">
            {group.children.map((c) => renderLeaf(c, true))}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 border-r border-gray-800",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.nome || "Logo"}
                className="w-8 h-8 rounded-lg object-contain bg-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {(company?.nome || "F").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm truncate">{company?.nome || "SIGES BI JENNOS"}</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {items.map((item) =>
          item.type === "leaf" ? renderLeaf(item) : renderGroup(item)
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        {!collapsed && user && (
          <div className="mb-3">
            <p className="text-xs font-medium text-white truncate">{user.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <ThemeToggle collapsed={collapsed} />
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Terminar sessão"
        message="Tem a certeza que pretende sair? Será redirecionado para o início de sessão."
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
}
