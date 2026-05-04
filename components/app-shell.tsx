"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import { getTodayBuckets } from "@/lib/crm";
import { useCrm } from "@/lib/store";
import { Button } from "@/components/ui";

const navItems = [
  { id: "today", label: "Today", href: "/" },
  { id: "leads", label: "Leads", href: "/leads" },
  { id: "log", label: "Log", href: "/log" },
  { id: "numbers", label: "Numbers", href: "/numbers" }
] as const;

export function AppShell({
  active,
  children
}: {
  active: (typeof navItems)[number]["id"];
  children: React.ReactNode;
}) {
  return (
    <ShellContent active={active}>{children}</ShellContent>
  );
}

function ShellContent({
  active,
  children
}: {
  active: (typeof navItems)[number]["id"];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { interactions, leads, resetSeedData } = useCrm();
  const buckets = getTodayBuckets(leads);
  const todayLeadIds = new Set([
    ...buckets.dueToday.map((lead) => lead.id),
    ...buckets.overdue.map((lead) => lead.id),
    ...buckets.hotNoNextAction.map((lead) => lead.id),
    ...buckets.staleProposals.map((lead) => lead.id),
    ...buckets.noActivitySevenDays.map((lead) => lead.id)
  ]);
  const navCounts: Record<(typeof navItems)[number]["id"], string> = {
    today: String(todayLeadIds.size),
    leads: String(leads.length),
    log: String(interactions.length),
    numbers: ""
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] bg-paper">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-line bg-paper px-6 py-8 lg:flex lg:flex-col">
        <Link href="/" className="flex items-end gap-3 border-b border-line pb-7">
          <span className="serif text-[56px] italic leading-[0.75] tracking-[-0.04em] text-palm">J</span>
          <span>
            <span className="block text-lg font-black tracking-[-0.02em] text-ink">Jara</span>
            <span className="label mt-0.5 block text-[9px] tracking-[0.3em]">Lead Ledger</span>
          </span>
        </Link>
        <div className="label mt-7 text-[9px] tracking-[0.28em] text-[#b8ab8c]">Workspace</div>
        <nav className="mt-3 grid">
          {navItems.map((item) => {
            const selected = active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "focus-ring flex items-baseline justify-between border-l-2 px-3 py-2.5 text-[15px] font-medium transition",
                  selected ? "border-palm bg-calm text-palm" : "border-transparent text-[#3d2f1b] hover:bg-calm hover:text-ink"
                )}
              >
                <span>{item.label}</span>
                {navCounts[item.id] && (
                  <span className={clsx("mono text-[10px]", selected ? "text-palm" : "text-[#b8ab8c]")}>{navCounts[item.id]}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-line pt-5">
          <div className="flex items-center gap-3">
            <span className="serif grid h-9 w-9 place-items-center rounded-full bg-palm text-lg italic text-[#f8f2e2]">If</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink">Ife</span>
              <span className="block truncate text-[11px] tracking-[0.04em] text-[#8a7b5e]">Sales Manager · Lagos</span>
            </span>
            <ChevronDown className="h-4 w-4 text-[#b8ab8c]" />
          </div>
          <Button className="mt-4 w-full" variant="secondary" onClick={resetSeedData}>
            <RotateCcw className="h-4 w-4" />
            Reset data
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black">
            <span className="serif text-4xl italic leading-none text-palm">J</span>
            Jara CRM
          </Link>
          <Button variant="ghost" className="px-3" onClick={resetSeedData} aria-label="Reset demo data">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <nav className="mt-3 grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const selected = pathname === item.href || active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "focus-ring grid place-items-center gap-1 px-2 py-2 text-xs font-semibold",
                  selected ? "bg-calm text-palm" : "text-[#3d2f1b]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="px-4 py-5 lg:ml-60 lg:px-12 lg:py-9">{children}</main>
    </div>
  );
}
