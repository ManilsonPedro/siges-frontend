"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/store/auth.store";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { companyService } from "@/shared/services/financeiro.service";
import { cn } from "@/shared/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import {
  NAV_CONFIG,
  type NavItem,
  type NavLeaf,
  type NavSection,
  type NavGroup,
} from "@/shared/config/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Search,
  X,
  User,
  Star,
  Clock,
} from "lucide-react";

/* ── Constantes ────────────────────────────────────────── */
const EXPANDED_KEY = "sidebar:enterprise:expanded";
const FAVORITES_KEY = "sidebar:enterprise:favorites";
const RECENTS_KEY  = "sidebar:enterprise:recents";
const MAX_RECENTS  = 5;

/* ── Helpers ───────────────────────────────────────────── */
function isActive(pathname: string, href: string) {
  const base = href.split("?")[0];
  if (base === "/dashboard") return pathname === "/dashboard";
  return pathname === base || pathname.startsWith(base + "/");
}

function allLeaves(items: NavItem[]): NavLeaf[] {
  const result: NavLeaf[] = [];
  for (const item of items) {
    if (item.type === "leaf") result.push(item);
    else if (item.type === "section" || item.type === "group") {
      result.push(...allLeaves(item.children as NavItem[]));
    }
  }
  return result;
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
  }, [key]);
  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  };
  return [value, set] as const;
}

/* ── Signature element: Pulso Financeiro ───────────────────────────
   Três segmentos proporcionais: entradas (verde), neutro (ghost),
   saídas (âmbar). Dados reais do dia virão via query; fallback estático.
   ─────────────────────────────────────────────────────────────────── */
function PulsoFinanceiro({ collapsed }: { collapsed: boolean }) {
  // Por agora usa proporção estática — ligação real ao endpoint /dashboard
  // em fase seguinte. Estrutura preparada para receber dados reais.
  const entradas = 62;
  const saidas   = 38;

  if (collapsed) return null;

  return (
    <div className="px-3 pb-2 mt-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xs font-semibold tracking-widest uppercase text-ink-mid/60 dark:text-ink-mid/50">
          Fluxo do dia
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-live animate-pulse"
          style={{ animationDuration: "2.4s" }}
        />
      </div>
      <div className="flex h-1 rounded-full overflow-hidden gap-px">
        <div
          className="bg-live transition-all duration-700"
          style={{ width: `${entradas}%` }}
        />
        <div
          className="bg-ink-ghost dark:bg-ink-ghost/30 transition-all duration-700"
          style={{ width: `${100 - entradas - saidas}%` }}
        />
        <div
          className="bg-amber transition-all duration-700"
          style={{ width: `${saidas}%` }}
        />
      </div>
    </div>
  );
}

/* ── Componente Principal ──────────────────────────────── */
export function EnterpriseSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();
  const { has, isLoading: permsLoading, permissions } = usePermissions();

  const [collapsed, setCollapsed]   = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [search, setSearch]         = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const [expanded,  setExpanded]  = useLocalStorage<Record<string, boolean>>(EXPANDED_KEY, {});
  const [favorites, setFavorites] = useLocalStorage<string[]>(FAVORITES_KEY, []);
  const [recents,   setRecents]   = useLocalStorage<string[]>(RECENTS_KEY, []);

  const { data: company } = useQuery({
    queryKey: ["company-settings"],
    queryFn: companyService.get,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const isSuperadmin = !!user?.is_superadmin;
  const applyPermFilter = !permsLoading && permissions.length > 0 && !isSuperadmin;

  const visibleItems = useMemo(() => {
    function filterLeaf(leaf: NavLeaf): boolean {
      if (!applyPermFilter) return true;
      return !leaf.permission || has(leaf.permission);
    }
    function filterItem(item: NavItem): NavItem | null {
      if (item.type === "divider") return item;
      if (item.type === "leaf") return filterLeaf(item) ? item : null;
      if (item.type === "group") {
        const children = item.children.filter(filterLeaf);
        if (children.length === 0) return null;
        return { ...item, children };
      }
      if (item.type === "section") {
        const children = item.children
          .map((c) => filterItem(c as NavItem))
          .filter(Boolean) as NavItem[];
        const hasVisible = children.some((c) => c.type !== "divider");
        if (!hasVisible) return null;
        if (applyPermFilter && item.permission && !has(item.permission)) {
          const anyChild = children.some(
            (c) => c.type === "leaf" && has((c as NavLeaf).permission ?? "")
          );
          if (!anyChild) return null;
        }
        return { ...item, children: children as (NavLeaf | NavGroup)[] };
      }
      return null;
    }
    return NAV_CONFIG.map(filterItem).filter(Boolean) as NavItem[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [has, applyPermFilter]);

  const leaves = useMemo(() => allLeaves(visibleItems), [visibleItems]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return leaves.filter((l) => l.label.toLowerCase().includes(q)).slice(0, 8);
  }, [search, leaves]);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    let changed = false;
    for (const item of visibleItems) {
      if (item.type !== "section") continue;
      const hasActive = allLeaves([item] as NavItem[]).some((l) => isActive(pathname, l.href));
      if (hasActive && !expanded[item.key]) {
        next[item.key] = true;
        changed = true;
      }
    }
    if (changed) setExpanded({ ...expanded, ...next });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const leaf = leaves.find((l) => isActive(pathname, l.href));
    if (!leaf) return;
    setRecents((prev) => {
      const filtered = prev.filter((k) => k !== leaf.key);
      return [leaf.key, ...filtered].slice(0, MAX_RECENTS);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleSection(key: string) {
    setExpanded((prev) => {
      const isOpen = !!prev[key];
      return isOpen ? {} : { [key]: true };
    });
  }

  function toggleGroup(sectionKey: string, groupKey: string) {
    setExpanded((prev) => ({
      ...prev,
      [`${sectionKey}:${groupKey}`]: !prev[`${sectionKey}:${groupKey}`],
    }));
  }

  function toggleFavorite(key: string) {
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleLogout() {
    logout();
    toast.success("Sessão terminada");
    router.push("/login");
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setCollapsed(false);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") setShowSearch(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Renderizadores ─── */

  function renderLeafItem(leaf: NavLeaf, opts?: { indent?: boolean; showFav?: boolean; sectionKey?: string }) {
    const { indent = false, showFav = true } = opts ?? {};
    const Icon   = leaf.icon;
    const active = isActive(pathname, leaf.href);
    const isFav  = favorites.includes(leaf.key);

    return (
      <div key={leaf.key} className="group/leaf relative flex items-center">
        <Link
          href={leaf.href}
          title={collapsed ? leaf.label : undefined}
          className={cn(
            "flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[0.8125rem] font-medium transition-colors duration-150",
            indent && !collapsed && "ml-4 pl-3 border-l border-ink-ghost/40 dark:border-ink-ghost/20",
            active
              ? "bg-ink text-white dark:bg-ink/90"
              : "text-ink-mid dark:text-ink-mid hover:bg-ink/8 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white"
          )}
        >
          {Icon && (
            <Icon
              className="flex-shrink-0"
              style={{ width: 15, height: 15, strokeWidth: 1.5 }}
            />
          )}
          {!collapsed && <span className="flex-1 truncate">{leaf.label}</span>}
          {!collapsed && leaf.isNew && (
            <span className="ml-1 text-[9px] font-semibold uppercase bg-live text-white px-1.5 py-0.5 rounded-full tracking-wide">
              Novo
            </span>
          )}
        </Link>
        {!collapsed && showFav && (
          <button
            onClick={() => toggleFavorite(leaf.key)}
            aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className={cn(
              "absolute right-1 p-1 rounded opacity-0 group-hover/leaf:opacity-100 transition-opacity",
              isFav ? "opacity-100 text-amber" : "text-ink-ghost hover:text-amber dark:hover:text-amber"
            )}
          >
            <Star
              style={{ width: 11, height: 11, strokeWidth: 1.5 }}
              className={cn(isFav && "fill-current")}
            />
          </button>
        )}
      </div>
    );
  }

  function renderGroup(group: NavGroup, sectionKey: string) {
    const GroupIcon = group.icon;
    const groupExpandKey = `${sectionKey}:${group.key}`;
    const isOpen    = !!expanded[groupExpandKey];
    const hasActive = group.children.some((l) => isActive(pathname, l.href));

    if (collapsed) return group.children.map((l) => renderLeafItem(l, { showFav: false }));

    return (
      <div key={group.key}>
        <button
          onClick={() => toggleGroup(sectionKey, group.key)}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors duration-150",
            "text-label-caps",
            hasActive ? "text-ink dark:text-white" : "hover:text-ink dark:hover:text-white"
          )}
        >
          {GroupIcon && (
            <GroupIcon
              className="flex-shrink-0 opacity-60"
              style={{ width: 12, height: 12, strokeWidth: 1.5 }}
            />
          )}
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown
            style={{ width: 11, height: 11, strokeWidth: 1.5 }}
            className={cn("opacity-50 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </button>
        {isOpen && (
          <div className="mt-0.5 space-y-0.5">
            {group.children.map((l) => renderLeafItem(l, { indent: true, sectionKey }))}
          </div>
        )}
      </div>
    );
  }

  function renderSection(section: NavSection) {
    const SectionIcon = section.icon;
    const isOpen      = !!expanded[section.key];
    const hasActive   = allLeaves([section] as NavItem[]).some((l) => isActive(pathname, l.href));

    if (collapsed) {
      return (
        <div key={section.key}>
          <button
            title={section.label}
            aria-label={section.label}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg mx-auto my-0.5 transition-colors duration-150",
              hasActive
                ? "bg-ink text-white dark:bg-ink/90"
                : "text-ink-mid hover:bg-ink/10 dark:hover:bg-white/8 hover:text-ink dark:hover:text-white"
            )}
            onClick={() => { setCollapsed(false); setExpanded({ [section.key]: true }); }}
          >
            <SectionIcon style={{ width: 16, height: 16, strokeWidth: 1.5 }} />
          </button>
        </div>
      );
    }

    return (
      <div key={section.key}>
        <button
          onClick={() => toggleSection(section.key)}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-[0.8125rem] font-semibold transition-colors duration-150 group",
            hasActive
              ? "text-ink dark:text-white"
              : "text-ink-mid dark:text-ink-mid hover:bg-ink/6 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white"
          )}
        >
          <SectionIcon
            style={{ width: 16, height: 16, strokeWidth: 1.5 }}
            className={cn("flex-shrink-0", hasActive && "text-ink dark:text-live")}
          />
          <span className="flex-1 text-left">{section.label}</span>
          <ChevronDown
            style={{ width: 13, height: 13, strokeWidth: 1.5 }}
            className={cn("opacity-40 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </button>

        {isOpen && (
          <div className="mt-0.5 ml-1 space-y-0.5 pl-3 border-l border-ink-ghost/50 dark:border-ink-ghost/20">
            {section.children.map((child) => {
              if (child.type === "leaf")  return renderLeafItem(child as NavLeaf, { sectionKey: section.key });
              if (child.type === "group") return renderGroup(child as NavGroup, section.key);
              return null;
            })}
          </div>
        )}
      </div>
    );
  }

  const favoriteLeaves = leaves.filter((l) => favorites.includes(l.key));
  const recentLeaves   = recents.map((k) => leaves.find((l) => l.key === k)).filter(Boolean) as NavLeaf[];

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-panel dark:bg-panel border-r border-ink-ghost/60 dark:border-ink-ghost/20",
        "transition-[width] duration-300 z-30 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Logo / Empresa ── */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-ink-ghost/60 dark:border-ink-ghost/20 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt=""
                className="w-8 h-8 rounded-lg object-contain bg-surface"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: "#0b3b6f" }}
              >
                {(company?.nome || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-semibold text-ink dark:text-white truncate leading-tight">
                {company?.nome || "SIGES BI JENNOS"}
              </p>
              <p className="text-2xs text-ink-mid/60 dark:text-ink-mid/50 truncate tracking-wide">
                ERP Industrial
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          className="p-1.5 rounded-lg hover:bg-surface dark:hover:bg-ink-ghost/20 text-ink-mid hover:text-ink dark:hover:text-white ml-auto transition-colors"
        >
          {collapsed
            ? <ChevronRight style={{ width: 15, height: 15, strokeWidth: 1.5 }} />
            : <ChevronLeft  style={{ width: 15, height: 15, strokeWidth: 1.5 }} />
          }
        </button>
      </div>

      {/* ── Pulso Financeiro (signature element) ── */}
      <PulsoFinanceiro collapsed={collapsed} />

      {/* ── Pesquisa ── */}
      {!collapsed && (
        <div className="px-3 pb-2 shrink-0">
          {showSearch ? (
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-mid/50"
                style={{ width: 13, height: 13, strokeWidth: 1.5 }}
              />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar menu..."
                autoFocus
                className={cn(
                  "w-full text-[0.8125rem] pl-7 pr-7 py-1.5 rounded-lg",
                  "bg-surface dark:bg-ink-ghost/20 text-ink dark:text-white",
                  "border border-ink-ghost dark:border-ink-ghost/30",
                  "focus:outline-none focus:border-ink dark:focus:border-ink-mid",
                  "placeholder-ink-mid/40"
                )}
              />
              <button
                onClick={() => { setSearch(""); setShowSearch(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-mid/50 hover:text-ink dark:hover:text-white"
              >
                <X style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
              </button>

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-panel dark:bg-panel border border-ink-ghost/60 dark:border-ink-ghost/20 rounded-lg shadow-lg z-50 overflow-hidden">
                  {searchResults.map((l) => {
                    const Icon = l.icon;
                    return (
                      <Link
                        key={l.key}
                        href={l.href}
                        onClick={() => { setSearch(""); setShowSearch(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 text-[0.8125rem] text-ink-mid dark:text-ink-mid hover:bg-surface dark:hover:bg-ink-ghost/20 hover:text-ink dark:hover:text-white transition-colors"
                      >
                        {Icon && <Icon style={{ width: 13, height: 13, strokeWidth: 1.5 }} className="text-ink-mid/60" />}
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50); }}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[0.8125rem]",
                "bg-surface dark:bg-ink-ghost/10 text-ink-mid/60 dark:text-ink-mid/50",
                "hover:text-ink-mid dark:hover:text-ink-mid transition-colors",
                "border border-ink-ghost/60 dark:border-ink-ghost/20"
              )}
            >
              <Search style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
              <span className="flex-1 text-left">Pesquisar...</span>
              <kbd className="text-[10px] bg-ink-ghost/40 dark:bg-ink-ghost/20 px-1.5 py-0.5 rounded text-ink-mid/50 font-mono">
                ⌘K
              </kbd>
            </button>
          )}
        </div>
      )}

      {/* ── Navegação principal ── */}
      <nav className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5 scrollbar-thin">

        {/* Favoritos */}
        {!collapsed && favoriteLeaves.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1">
              <Star style={{ width: 11, height: 11, strokeWidth: 1.5 }} className="text-amber" />
              <span className="text-label-caps">Favoritos</span>
            </div>
            <div className="space-y-0.5">
              {favoriteLeaves.map((l) => renderLeafItem(l, { showFav: true }))}
            </div>
          </div>
        )}

        {/* Recentes */}
        {!collapsed && recentLeaves.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1">
              <Clock style={{ width: 11, height: 11, strokeWidth: 1.5 }} className="text-ink-mid/50" />
              <span className="text-label-caps">Recentes</span>
            </div>
            <div className="space-y-0.5">
              {recentLeaves.map((l) => renderLeafItem(l, { showFav: false }))}
            </div>
          </div>
        )}

        {/* Itens principais */}
        {visibleItems.map((item) => {
          if (item.type === "divider") {
            return collapsed
              ? <div key={item.key} className="my-1 border-t border-ink-ghost/40 dark:border-ink-ghost/20" />
              : <div key={item.key} className="my-1 mx-2 border-t border-ink-ghost/40 dark:border-ink-ghost/20" />;
          }
          if (item.type === "leaf")    return renderLeafItem(item);
          if (item.type === "section") return renderSection(item as NavSection);
          return null;
        })}
      </nav>

      {/* ── Rodapé ── */}
      <div className="shrink-0 border-t border-ink-ghost/60 dark:border-ink-ghost/20 p-2 space-y-0.5">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-surface dark:bg-ink-ghost/30 border border-ink-ghost/60 dark:border-ink-ghost/20 flex items-center justify-center shrink-0">
              <User style={{ width: 14, height: 14, strokeWidth: 1.5 }} className="text-ink-mid" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-semibold text-ink dark:text-white truncate leading-tight">
                {user.full_name}
              </p>
              <p className="text-2xs text-ink-mid/60 dark:text-ink-mid/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <ThemeToggle collapsed={collapsed} />
        <button
          onClick={() => setShowLogout(true)}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[0.8125rem]",
            "text-ink-mid dark:text-ink-mid hover:bg-danger/8 dark:hover:bg-danger/10 hover:text-danger dark:hover:text-danger",
            "transition-colors duration-150",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut style={{ width: 15, height: 15, strokeWidth: 1.5 }} className="flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Terminar sessão"
        message="Tem a certeza que pretende sair?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </aside>
  );
}
