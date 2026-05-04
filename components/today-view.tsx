"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, Flame, MessageCircleWarning, TimerReset } from "lucide-react";
import { formatTodayFolio, getTodayBuckets, sortByNextAction } from "@/lib/crm";
import { useCrm } from "@/lib/store";
import { Card, EmptyState } from "@/components/ui";
import { LeadCard } from "@/components/lead-card";
import type { Lead } from "@/lib/types";

const bucketMeta = [
  {
    key: "overdue",
    title: "Overdue follow-ups",
    description: "These should be handled before anything new.",
    icon: AlertTriangle
  },
  {
    key: "dueToday",
    title: "Follow-ups due today",
    description: "Today’s WhatsApp messages, calls, and visit nudges.",
    icon: CalendarClock
  },
  {
    key: "hotNoNextAction",
    title: "Hot leads with no next action",
    description: "Active opportunities that need a clear owner move.",
    icon: Flame
  },
  {
    key: "staleProposals",
    title: "Proposals older than 3 days",
    description: "Proposal sent, but no follow-up is waiting.",
    icon: MessageCircleWarning
  },
  {
    key: "noActivitySevenDays",
    title: "No activity in 7 days",
    description: "Quiet leads that may need a direct check-in.",
    icon: TimerReset
  }
] as const;

export function TodayView() {
  const { leads } = useCrm();
  const buckets = getTodayBuckets(leads);
  const activeCount = leads.filter((lead) => lead.stage !== "won" && lead.stage !== "lost").length;
  const noNextActionCount = leads.filter(
    (lead) => lead.stage !== "won" && lead.stage !== "lost" && (!lead.nextAction || !lead.nextActionDate)
  ).length;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <span className="label">Daily command folio</span>
        <span className="mono text-[10px] tracking-[0.05em] text-[#b8ab8c]">{formatTodayFolio()}</span>
      </div>
      <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="display-title text-ink">Today.</h1>
          <p className="mt-5 max-w-2xl font-medium leading-7 text-[#3d2f1b]">
            A daily command center for the follow-ups that move Nigerian B2B deals forward.
          </p>
        </div>
        <Link
          href="/log"
          className="focus-ring ink-action min-h-12 px-5 text-xs font-bold uppercase tracking-[0.12em]"
        >
          Log update
        </Link>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-3">
        <Stat label="Active leads" value={activeCount.toString()} />
        <Stat label="Need next action" value={noNextActionCount.toString()} />
        <Stat label="Due or overdue" value={(buckets.dueToday.length + buckets.overdue.length).toString()} />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        {bucketMeta.map((bucket) => (
          <Bucket
            key={bucket.key}
            title={bucket.title}
            description={bucket.description}
            icon={bucket.icon}
            leads={sortByNextAction(buckets[bucket.key])}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="label">{label}</p>
      <p className="mono mt-3 text-5xl font-medium tracking-[-0.05em] text-ink">{value}</p>
    </Card>
  );
}

function Bucket({
  title,
  description,
  icon: Icon,
  leads
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  leads: Lead[];
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center border border-line bg-[#f8f2e2] text-palm">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="serif text-2xl italic text-ink">{title}</h2>
            <p className="mt-1 text-sm text-[#3d2f1b]">{description}</p>
          </div>
        </div>
        <span className="mono grid h-9 min-w-9 shrink-0 place-items-center border border-line bg-calm px-2 text-xs font-black text-palm">
          {leads.length}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {leads.length ? leads.map((lead) => <LeadCard key={lead.id} lead={lead} />) : <EmptyState text="Clear for now." />}
      </div>
    </Card>
  );
}
