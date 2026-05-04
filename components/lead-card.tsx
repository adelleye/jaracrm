import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, formatNaira } from "@/lib/crm";
import { owners } from "@/lib/seed-data";
import type { Lead } from "@/lib/types";
import { Badge, HealthBadge } from "@/components/ui";

export function LeadCard({ lead, compact = false }: { lead: Lead; compact?: boolean }) {
  const owner = owners.find((item) => item.id === lead.ownerId)?.name ?? "Unassigned";
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="focus-ring motion-row block border border-line bg-[#fbf6e7] p-4 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_5px_0_var(--ink)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-ink">{lead.name}</p>
          <p className="mt-1 text-sm text-[#8a7b5e]">{lead.company}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8a7b5e]" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <HealthBadge lead={lead} />
        <Badge tone={lead.temperature}>{lead.temperature}</Badge>
      </div>
      {!compact && (
        <div className="mt-4 grid gap-2 text-sm text-[#3d2f1b]">
          <p>
            <span className="mono font-semibold text-ink">{formatNaira(lead.dealValue)}</span> with {owner}
          </p>
          <p>{lead.nextAction || "No next action set"}</p>
          <p className="mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a7b5e]">{formatDate(lead.nextActionDate)}</p>
        </div>
      )}
    </Link>
  );
}
