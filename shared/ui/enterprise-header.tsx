"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/shared/store/auth.store";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { cn } from "@/shared/utils";
import {
  NAV_CONFIG,
  type NavItem,
  type NavLeaf,
} from "@/shared/config/navigation";
import {
  Search,
  Bell,
  ChevronRight,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";

/* ── Breadcrumb automático a partir do NAV_CONFIG ── */
function allLeaves(items: NavItem[]): NavLeaf[] {
  const out: NavLeaf[] = [];
  for (const item of items) {
    if (item.type === "leaf") out.push(item);
    else if (item.type === "section" || item.type === "group")
      out.push(...allLeaves((item as any).children));
  }
  return out;
}

function useBreadcrumb() {
  const pathname = usePathname();
  const leaves   = allLeaves(NAV_CONFIG);

  const active = leaves
    .filter((l) => {
      const base = l.href.split("?")[0];
      if (base === "/dashboard") return pathname === "/dashboard";
      return pathname === base || pathname.startsWith(base + "/");
    })
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (!active) return [];

  const crumbs: { label: string; href?: string }[] = [];
  for (const item of NAV_CONFIG) {
    if (item.type !== "section") continue;
    const found = allLeaves([item] as NavItem[]).find((l) => l.key === active.key);
    if (found) {
      crumbs.push({ label: item.label });
      break;
    }
  }
  crumbs.push({ label: active.label, href: active.href });
  return crumbs;
}

/* ── Global Search ── */
function GlobalSearch() {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const leaves  = allLeaves(NAV_CONFIG);
  const results = query.trim()
    ? leaves.filter((l) => l.label.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "hidden md:flex items-center gap-2 text-[0.8125rem]",
          "bg-surface dark:bg-ink-ghost/10 text-ink-mid/60 dark:text-ink-mid/50",
          "px-3 py-1.5 rounded-lg border border-ink-ghost/60 dark:border-ink-ghost/20",
          "hover:border-ink-mid/50 dark:hover:border-ink-mid/30 hover:text-ink-mid dark:hover:text-ink-mid",
          "transition-colors"
        )}
      >
        <Search style={{ width: 13, height: 13, strokeWidth: 1.5 }} />
        <span>Pesquisa global...</span>
        <kbd className="ml-2 text-[10px] bg-ink-ghost/40 dark:bg-ink-ghost/20 px-1.5 py-0.5 rounded text-ink-mid/50 font-mono">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-ink/20 dark:bg-black/50 backdrop-blur-[2px]"
        onClick={() => { setOpen(false); setQuery(""); }}
      />
      <div className="relative w-full max-w-lg bg-panel dark:bg-panel rounded-xl shadow-2xl border border-ink-ghost/60 dark:border-ink-ghost/20 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
          <Search
            style={{ width: 15, height: 15, strokeWidth: 1.5 }}
            className="text-ink-mid/50 shrink-0"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar páginas, módulos..."
            className="flex-1 text-[0.875rem] bg-transparent text-ink dark:text-white placeholder-ink-mid/40 outline-none"
          />
          <button
            onClick={() => { setOpen(false); setQuery(""); }}
            className="p-1 rounded hover:bg-surface dark:hover:bg-ink-ghost/20"
          >
            <X style={{ width: 14, height: 14, strokeWidth: 1.5 }} className="text-ink-mid/50" />
          </button>
        </div>

        {results.length > 0 ? (
          <div className="py-1 max-h-80 overflow-y-auto">
            {results.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.key}
                  href={l.href}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-[0.875rem] text-ink-mid dark:text-ink-mid hover:bg-surface dark:hover:bg-ink-ghost/20 hover:text-ink dark:hover:text-white transition-colors"
                >
                  {Icon && (
                    <Icon
                      style={{ width: 14, height: 14, strokeWidth: 1.5 }}
                      className="text-ink-mid/50 shrink-0"
                    />
                  )}
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>
        ) : query ? (
          <div className="py-8 text-center text-[0.875rem] text-ink-mid/60">
            Sem resultados para &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="py-8 text-center text-[0.875rem] text-ink-mid/60">
            Comece a escrever para pesquisar...
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Notificações ── */
function NotificationsButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificações"
        className="relative p-2 rounded-lg text-ink-mid dark:text-ink-mid hover:bg-surface dark:hover:bg-ink-ghost/20 hover:text-ink dark:hover:text-white transition-colors"
      >
        <Bell style={{ width: 16, height: 16, strokeWidth: 1.5 }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-panel dark:bg-panel rounded-xl shadow-xl border border-ink-ghost/60 dark:border-ink-ghost/20 z-50 p-4">
            <p className="text-[0.875rem] font-semibold text-ink dark:text-white mb-3">Notificações</p>
            <p className="text-[0.8125rem] text-ink-mid/60 text-center py-4">
              Sem notificações por enquanto
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ── User Menu ── */
function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = require("next/navigation").useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface dark:hover:bg-ink-ghost/20 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-surface dark:bg-ink-ghost/30 border border-ink-ghost/60 dark:border-ink-ghost/20 flex items-center justify-center">
          <User style={{ width: 14, height: 14, strokeWidth: 1.5 }} className="text-ink-mid" />
        </div>
        {user && (
          <span className="hidden md:block text-[0.8125rem] font-medium text-ink dark:text-white max-w-[120px] truncate">
            {user.full_name}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-panel dark:bg-panel rounded-xl shadow-xl border border-ink-ghost/60 dark:border-ink-ghost/20 z-50 overflow-hidden">
            {user && (
              <div className="px-4 py-3 border-b border-ink-ghost/60 dark:border-ink-ghost/20">
                <p className="text-[0.875rem] font-semibold text-ink dark:text-white truncate">
                  {user.full_name}
                </p>
                <p className="text-2xs text-ink-mid/60 truncate">{user.email}</p>
              </div>
            )}
            <div className="py-1">
              <Link
                href="/dashboard/perfil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[0.875rem] text-ink-mid dark:text-ink-mid hover:bg-surface dark:hover:bg-ink-ghost/20 hover:text-ink dark:hover:text-white transition-colors"
              >
                <User style={{ width: 14, height: 14, strokeWidth: 1.5 }} className="text-ink-mid/50" />
                Perfil
              </Link>
              <Link
                href="/dashboard/configuracoes"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[0.875rem] text-ink-mid dark:text-ink-mid hover:bg-surface dark:hover:bg-ink-ghost/20 hover:text-ink dark:hover:text-white transition-colors"
              >
                <Settings style={{ width: 14, height: 14, strokeWidth: 1.5 }} className="text-ink-mid/50" />
                Configurações
              </Link>
            </div>
            <div className="border-t border-ink-ghost/60 dark:border-ink-ghost/20 py-1">
              <button
                onClick={() => { setOpen(false); logout(); router.push("/login"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[0.875rem] text-danger hover:bg-danger/8 dark:hover:bg-danger/10 transition-colors"
              >
                <LogOut style={{ width: 14, height: 14, strokeWidth: 1.5 }} />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Header Principal ── */
export function EnterpriseHeader() {
  const crumbs = useBreadcrumb();

  return (
    <header className="h-12 shrink-0 flex items-center gap-4 px-4 bg-panel dark:bg-panel border-b border-ink-ghost/60 dark:border-ink-ghost/20 z-20">
      {/* Breadcrumb */}
      <nav className="flex-1 flex items-center gap-1.5 min-w-0 text-[0.8125rem] text-ink-mid/60 dark:text-ink-mid/50">
        <Link
          href="/dashboard"
          className="hover:text-ink dark:hover:text-white shrink-0 transition-colors font-medium"
        >
          SIGES BI JENNOS
        </Link>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight
              style={{ width: 12, height: 12, strokeWidth: 1.5 }}
              className="shrink-0 text-ink-ghost dark:text-ink-ghost/50"
            />
            {crumb.href && i === crumbs.length - 1 ? (
              <span className="font-semibold text-ink dark:text-white truncate">{crumb.label}</span>
            ) : crumb.href ? (
              <Link href={crumb.href} className="hover:text-ink dark:hover:text-white truncate transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Acções direita */}
      <div className="flex items-center gap-1 shrink-0">
        <GlobalSearch />
        <NotificationsButton />
        <UserMenu />
      </div>
    </header>
  );
}
