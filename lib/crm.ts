import type { Interaction, Lead, LeadStage, SalesCostPeriod, SalesMetrics } from "@/lib/types";

export const stages: { id: LeadStage; label: string }[] = [
  { id: "new", label: "New" },
  { id: "talking", label: "Talking" },
  { id: "meeting_demo", label: "Meeting/demo" },
  { id: "proposal_sent", label: "Proposal sent" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" }
];

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: string) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export function todayKey() {
  return "2026-05-03";
}

export function daysBetween(start: string, end = todayKey()) {
  const startMs = new Date(`${start}T12:00:00`).getTime();
  const endMs = new Date(`${end}T12:00:00`).getTime();
  return Math.floor((endMs - startMs) / 86_400_000);
}

export function isActive(lead: Lead) {
  return lead.stage !== "won" && lead.stage !== "lost";
}

export function hasNextAction(lead: Lead) {
  return Boolean(lead.nextAction.trim() && lead.nextActionDate);
}

export function getLeadHealth(lead: Lead) {
  if (!isActive(lead)) return { label: lead.stage === "won" ? "Closed won" : "Closed lost", tone: "neutral" };
  if (!hasNextAction(lead)) return { label: "No next action", tone: "danger" };
  if (lead.nextActionDate < todayKey()) return { label: "Overdue", tone: "danger" };
  if (lead.nextActionDate === todayKey()) return { label: "Due today", tone: "warning" };
  if (daysBetween(lead.lastTouchDate) >= 7) return { label: "Quiet 7d", tone: "warning" };
  return { label: "On track", tone: "good" };
}

export function getTodayBuckets(leads: Lead[]) {
  const active = leads.filter(isActive);
  return {
    dueToday: active.filter((lead) => lead.nextActionDate === todayKey()),
    overdue: active.filter((lead) => hasNextAction(lead) && lead.nextActionDate < todayKey()),
    hotNoNextAction: active.filter((lead) => lead.temperature === "hot" && !hasNextAction(lead)),
    staleProposals: active.filter(
      (lead) => lead.stage === "proposal_sent" && daysBetween(lead.lastTouchDate) > 3 && !hasNextAction(lead)
    ),
    noActivitySevenDays: active.filter((lead) => daysBetween(lead.lastTouchDate) >= 7)
  };
}

export function computeSalesMetrics(
  leads: Lead[],
  interactions: Interaction[],
  period: SalesCostPeriod
): SalesMetrics {
  const spokenLeadIds = new Set(
    interactions
      .filter((interaction) => interaction.type !== "other")
      .map((interaction) => interaction.leadId)
  );
  const dealsWon = leads.filter((lead) => lead.stage === "won").length;
  const peopleSpokenTo = spokenLeadIds.size;
  const revenueWon = leads
    .filter((lead) => lead.stage === "won")
    .reduce((sum, lead) => sum + lead.dealValue, 0);
  const conversionRate = peopleSpokenTo > 0 ? dealsWon / peopleSpokenTo : 0;
  const pipelineRequired = conversionRate > 0 ? period.targetCustomers / conversionRate : 0;
  const totalCost = period.salesCost + period.marketingCost;
  const cac = dealsWon > 0 ? totalCost / dealsWon : 0;
  const cacPaybackMonths =
    period.averageMonthlyGrossProfitPerCustomer > 0 ? cac / period.averageMonthlyGrossProfitPerCustomer : 0;

  return {
    peopleSpokenTo,
    dealsWon,
    revenueWon,
    conversionRate,
    pipelineRequired,
    cac,
    cacPaybackMonths
  };
}

export function sortByNextAction(leads: Lead[]) {
  return [...leads].sort((a, b) => {
    const aDate = a.nextActionDate || "9999-12-31";
    const bDate = b.nextActionDate || "9999-12-31";
    return aDate.localeCompare(bDate);
  });
}
