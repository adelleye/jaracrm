"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { daysBetween, formatDate, formatNaira, getLeadHealth, stages } from "@/lib/crm";
import { owners } from "@/lib/seed-data";
import { useCrm } from "@/lib/store";
import { Badge, Card } from "@/components/ui";

export function LeadDetailView({ leadId }: { leadId: string }) {
  const { leads, interactions } = useCrm();
  const lead = leads.find((item) => item.id === leadId);

  if (!lead) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/leads" className="focus-ring inline-flex text-sm font-semibold text-palm">
          Back to leads
        </Link>
        <Card className="mt-4 p-6">
          <h1 className="serif text-3xl italic">Lead not found</h1>
        </Card>
      </div>
    );
  }

  const owner = owners.find((item) => item.id === lead.ownerId)?.name ?? "Unassigned";
  const stageLabel = stages.find((stage) => stage.id === lead.stage)?.label ?? lead.stage;
  const health = getLeadHealth(lead);
  const expectedValue = Math.round((lead.dealValue * lead.probability) / 100);
  const timeline = interactions
    .filter((interaction) => interaction.leadId === lead.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-[1180px]">
      <Link href="/leads" className="focus-ring inline-flex items-center gap-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-palm transition hover:gap-3">
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <span className="label">Lead № {lead.id.slice(-4).toUpperCase()} · {lead.source} pipeline</span>
            <span className="mono text-[10px] tracking-[0.05em] text-[#b8ab8c]">FY26 · Q2 · NIGERIA</span>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h1 className="display-title max-w-3xl text-ink">
              {lead.name.split(" ").slice(0, -1).join(" ") || lead.name}
              <br />
              {lead.name.split(" ").slice(-1)}.
            </h1>
            <Link
              href={`/log?leadId=${lead.id}`}
              className="focus-ring ink-action min-h-12 shrink-0 px-5 text-xs font-bold uppercase tracking-[0.12em]"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Log update
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="serif text-2xl italic text-[#3d2f1b]">of {lead.company}</span>
            <span className="text-xs tracking-[0.35em] text-[#b8ab8c]">· · ·</span>
            <span className="stage-chip">{stageLabel}</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4 border-y border-line py-4">
            <span className={health.tone === "danger" ? "label text-amber" : "label text-palm"}>{health.label}</span>
            <span className="text-[#b8ab8c]">/</span>
            <span className="label text-ink">{lead.temperature} lead</span>
            <span className="text-[#b8ab8c]">/</span>
            <span className="label">Last touched {daysBetween(lead.lastTouchDate)}d ago</span>
          </div>

          <section className="mt-10 grid items-end gap-8 border-b border-line pb-10 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <div className="label mb-3">Deal value · open</div>
              <div className="flex items-baseline gap-2">
                <span className="serif text-7xl italic leading-none text-palm">₦</span>
                <span className="mono text-5xl font-medium tracking-[-0.06em] text-ink md:text-6xl">
                  {lead.dealValue.toLocaleString("en-NG")}
                </span>
              </div>
              <div className="mt-5 flex gap-8">
                <Meta label="Source" value={lead.source} />
                <Meta label="Referrer" value={lead.referrerName || "None"} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="label">Probability to close</span>
                <span className="mono text-3xl font-medium tracking-[-0.03em] text-ink">
                  {lead.probability}<span className="text-xl text-[#8a7b5e]">%</span>
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden bg-calm">
                <div className="motion-meter h-full bg-palm" style={{ width: `${lead.probability}%` }} />
              </div>
              <p className="serif mt-3 italic text-[#8a7b5e]">
                Expected value <span className="mono not-italic text-[#3d2f1b]">{formatNaira(expectedValue)}</span>
              </p>
            </div>
          </section>

          <section className="mt-9 grid gap-7 md:grid-cols-2">
            <Meta label="Phone" value={lead.phone} mono />
            <Meta label="Email" value={lead.email} />
            <Meta label="Owner" value={`${owner} · you`} />
            <Meta label="Relationship" value={lead.relationshipStrength} />
          </section>

          <section className="relative mt-10 border-l-4 border-amber bg-[#fbf6e7] px-7 py-6">
            <span className="serif absolute right-5 top-0 text-7xl italic leading-none text-[#f1d8c5]">“</span>
            <div className="label mb-3">Why we&apos;re waiting</div>
            <p className="serif max-w-2xl text-2xl italic leading-snug text-ink">{lead.statusReason}</p>
          </section>

          <section className="mt-7 flex flex-col gap-4 border border-dashed border-line bg-calm px-6 py-5 md:flex-row md:items-center">
            <div>
              <div className={health.tone === "danger" ? "label text-amber" : "label text-palm"}>{health.label}</div>
              <p className="mt-1 text-sm font-bold text-ink">
                {lead.nextAction || "No follow-up booked."} <span className="font-normal text-[#8a7b5e]">{lead.nextActionDate ? formatDate(lead.nextActionDate) : "Don't let this one drift."}</span>
              </p>
            </div>
            <Link href={`/log?leadId=${lead.id}`} className="focus-ring ml-auto border border-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-[#f8f2e2]">
              Schedule
            </Link>
          </section>

          <section className="mt-10 border-t border-line pt-7">
            <div className="label mb-3">Notes from the field</div>
            <p className="serif max-w-3xl text-2xl leading-snug text-[#3d2f1b]">{lead.notes}</p>
          </section>

          <section className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#e3d9bc] pt-5">
            <span className="label mr-1">Tagged</span>
            {lead.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </section>
        </main>

        <aside className="border-l border-line pl-7">
          <div className="flex items-baseline justify-between border-b border-ink pb-4">
            <h2 className="serif text-3xl italic text-ink">Timeline</h2>
            <span className="label">Latest first</span>
          </div>

          <div className="mt-5">
            {timeline.length ? (
              timeline.map((interaction) => (
                <div key={interaction.id} className="border-b border-[#e3d9bc] py-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="bg-mint px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-palm">
                      {interaction.type.replace("_", " ")}
                    </span>
                    <span className="mono text-[10px] tracking-[0.05em] text-[#8a7b5e]">
                      {new Intl.DateTimeFormat("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }).format(new Date(interaction.createdAt))}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#3d2f1b]">{interaction.summary}</p>
                  {interaction.nextAction && (
                    <p className="mt-3 bg-[#e6dcc1] px-3 py-2 text-xs font-semibold text-ink">
                      Next: {interaction.nextAction}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="serif py-10 text-center italic text-[#8a7b5e]">
                — · —
                <br />
                No entries yet.
              </div>
            )}
          </div>

          <div className="mono mt-10 border-t border-dashed border-line pt-5 text-[9px] leading-6 tracking-[0.08em] text-[#b8ab8c]">
            JARA CRM
            <br />
            VOL. I · LEAD LEDGER
            <br />
            PRINTED IN LAGOS
          </div>
        </aside>
      </div>
    </div>
  );
}

function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="label mb-2">{label}</div>
      <div className={mono ? "mono text-sm font-semibold text-ink" : "text-base font-semibold text-ink"}>{value}</div>
    </div>
  );
}
