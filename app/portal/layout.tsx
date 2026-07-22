import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal do Cliente — SIGES BI JENNOS",
  description: "Reserve a lavagem do seu veículo online.",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface">
      <header className="border-b border-ink-ghost/40 dark:border-ink-ghost/15 bg-panel dark:bg-panel">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white" style={{ background: "#0b3b6f" }}>SB</div>
          <span className="font-semibold text-ink dark:text-white">Portal do Cliente</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
