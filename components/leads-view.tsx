"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpDown,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Download,
  Filter,
  Info,
  Lightbulb,
  MessageSquarePlus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Upload,
  UserRound
} from "lucide-react";
import { clsx } from "clsx";
import { formatDate, formatNaira, getLeadHealth, stages } from "@/lib/crm";
import { owners } from "@/lib/seed-data";
import { useCrm } from "@/lib/store";
import type { LeadStage } from "@/lib/types";
import { Card, inputClass } from "@/components/ui";

type SortMode = "next_action" | "deal_value" | "company";

const stageColors: Record<LeadStage, string> = {
  new: "border-line bg-[#f8f2e2] text-[#3d2f1b]",
  talking: "border-line bg-[#d9e2d6] text-palm",
  meeting_demo: "border-line bg-[#f1d8c5] text-[#8d3516]",
  proposal_sent: "border-line bg-[#f8f2e2] text-[#3d2f1b]",
  won: "border-line bg-[#d9e2d6] text-palm",
  lost: "border-line bg-[#f1d8c5] text-[#8d3516]"
};

const avatarColors = [
  "bg-palm text-[#f8f2e2]",
  "bg-[#f1d8c5] text-[#8d3516]",
  "bg-[#d9e2d6] text-palm",
  "bg-[#e6dcc1] text-[#3d2f1b]",
  "bg-[#f8f2e2] text-[#3d2f1b]",
  "bg-[#b5481e] text-[#f8f2e2]"
];

export function LeadsView() {
  const { leads, moveLeadToStage } = useCrm();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStage | "all">("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("next_action");
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [actionNotice, setActionNotice] = useState("Use these local tools to prep this pipeline for review.");
  const boardRailRef = useRef<HTMLDivElement>(null);

  const filteredLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const searched = normalized
      ? leads.filter((lead) =>
          [lead.name, lead.company, lead.phone, lead.email, lead.source, lead.tags.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(normalized)
        )
      : leads;

    return searched
      .filter((lead) => stageFilter === "all" || lead.stage === stageFilter)
      .filter((lead) => ownerFilter === "all" || lead.ownerId === ownerFilter)
      .toSorted((a, b) => {
        if (sortMode === "deal_value") return b.dealValue - a.dealValue;
        if (sortMode === "company") return a.company.localeCompare(b.company);
        return (a.nextActionDate || "9999-12-31").localeCompare(b.nextActionDate || "9999-12-31");
      });
  }, [leads, ownerFilter, query, sortMode, stageFilter]);

  const totalPipeline = filteredLeads.reduce((sum, lead) => sum + lead.dealValue, 0);
  const stageCounts = stages.map((stage) => ({
    ...stage,
    count: filteredLeads.filter((lead) => lead.stage === stage.id).length
  }));
  const visibleStageCounts = stageCounts.filter((stage) => stage.count > 0);
  const noNextActionCount = filteredLeads.filter((lead) => !lead.nextAction || !lead.nextActionDate).length;
  const draggingLead = draggingLeadId ? leads.find((lead) => lead.id === draggingLeadId) : undefined;
  const sourceSummary = useMemo(() => {
    const counts = filteredLeads.reduce<Record<string, number>>((summary, lead) => {
      summary[lead.source] = (summary[lead.source] ?? 0) + 1;
      return summary;
    }, {});

    return Object.entries(counts)
      .toSorted(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([source, count]) => `${source}: ${count}`)
      .join(" · ");
  }, [filteredLeads]);

  function scrollBoard(direction: "left" | "right") {
    boardRailRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth"
    });
  }

  function exportLeadsCsv() {
    const headers = ["Name", "Company", "Stage", "Owner", "Deal value", "Next action", "Next action date", "Source"];
    const rows = filteredLeads.map((lead) => {
      const owner = owners.find((item) => item.id === lead.ownerId)?.name ?? "Unassigned";
      return [
        lead.name,
        lead.company,
        stages.find((stage) => stage.id === lead.stage)?.label ?? lead.stage,
        owner,
        String(lead.dealValue),
        lead.nextAction || "No next action set",
        lead.nextActionDate || "No date",
        lead.source
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jara-leads.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setActionNotice(`Exported ${filteredLeads.length} visible leads to CSV.`);
  }

  function moveDraggingLead(stage: LeadStage) {
    if (!draggingLeadId) return;
    const lead = leads.find((item) => item.id === draggingLeadId);
    if (!lead || lead.stage === stage) {
      setDraggingLeadId(null);
      setDragOverStage(null);
      return;
    }
    moveLeadToStage(draggingLeadId, stage);
    setDraggingLeadId(null);
    setDragOverStage(null);
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="folio rise flex items-baseline justify-between border-b border-line pb-2">
        <span className="label">Pipeline ledger · Active book</span>
        <span className="mono text-[10px] tracking-[0.05em] text-[#b8ab8c]">FY26 · Q2 · LAGOS</span>
      </div>
      <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="display-title text-ink">Leads.</h1>
          <p className="mt-5 max-w-xl font-medium leading-7 text-[#3d2f1b]">Search the pipeline, then scan by table or stage.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="focus-ring grid h-12 w-12 place-items-center border border-line bg-transparent text-[#3d2f1b] transition hover:bg-[#f8f2e2]"
            onClick={() => window.location.reload()}
            aria-label="Refresh leads"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <Link
            href="/log"
            className="focus-ring hidden h-12 items-center justify-center gap-2 border border-line px-4 text-xs font-bold uppercase tracking-[0.12em] text-ink hover:bg-[#f8f2e2] md:inline-flex"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Log update
          </Link>
          <Link
            href="/leads/new"
            className="focus-ring ink-action h-12 px-5 text-xs font-bold uppercase tracking-[0.12em]"
          >
            <Plus className="h-5 w-5" />
            New lead
          </Link>
        </div>
      </div>

      <Card className="mt-8 p-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_190px_190px_190px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-[#8a7b5e]" />
            <input
              className={`${inputClass} h-14 pl-12 text-base`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, company, source..."
            />
            <span className="pointer-events-none absolute right-4 top-4 border border-line bg-calm px-2 py-0.5 text-xs font-bold text-[#8a7b5e]">
              ⌘ K
            </span>
          </div>
          <ControlSelect
            icon={Filter}
            label="Stage"
            value={stageFilter}
            onChange={(value) => setStageFilter(value as LeadStage | "all")}
            options={[{ value: "all", label: "All stages" }, ...stages.map((stage) => ({ value: stage.id, label: stage.label }))]}
          />
          <ControlSelect
            icon={UserRound}
            label="Owner"
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={[{ value: "all", label: "All owners" }, ...owners.map((owner) => ({ value: owner.id, label: owner.name }))]}
          />
          <ControlSelect
            icon={ArrowUpDown}
            label="Sort"
            value={sortMode}
            onChange={(value) => setSortMode(value as SortMode)}
            options={[
              { value: "next_action", label: "Next action" },
              { value: "deal_value", label: "Deal value" },
              { value: "company", label: "Company" }
            ]}
          />
          <button className="focus-ring grid h-14 w-14 place-items-center border border-line bg-[#f8f2e2] text-[#3d2f1b] hover:bg-calm" aria-label="More filters">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_270px]">
        <Card className="overflow-hidden">
          <div className="flex items-baseline gap-4 border-b border-line px-5 py-5">
            <h2 className="serif text-3xl italic text-ink">Pipeline table</h2>
            <span className="mono text-xs font-semibold text-[#8a7b5e]">{filteredLeads.length} leads</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[#e6dcc1] text-[10px] font-black uppercase tracking-[0.2em] text-[#8a7b5e]">
                <tr>
                  <th className="px-5 py-4">Lead</th>
                  <th className="px-5 py-4">Stage</th>
                  <th className="px-5 py-4">Owner</th>
                  <th className="px-5 py-4">Deal value</th>
                  <th className="px-5 py-4">Next action</th>
                  <th className="w-12 px-5 py-4" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredLeads.map((lead, index) => {
                  const owner = owners.find((item) => item.id === lead.ownerId)?.name ?? "Unassigned";
                  const health = getLeadHealth(lead);
                  const actionMissing = !lead.nextAction || !lead.nextActionDate;
                  return (
                    <tr key={lead.id} className="align-middle transition hover:bg-[#f8f2e2]/70">
                      <td className="px-5 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar label={initials(lead.name)} index={index} />
                          <div>
                            <Link href={`/leads/${lead.id}`} className="focus-ring text-base font-black text-ink hover:text-palm">
                              {lead.name}
                            </Link>
                            <p className="mt-1 text-sm text-[#8a7b5e]">{lead.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-6">
                        <StagePill stage={lead.stage} />
                      </td>
                      <td className="px-5 py-6">
                        <div className="flex items-center gap-3">
                          <span className={clsx("serif grid h-9 w-9 place-items-center rounded-full text-base italic", avatarColors[index % avatarColors.length])}>
                            {initials(owner)}
                          </span>
                          <span className="font-medium text-[#3d2f1b]">{owner}</span>
                        </div>
                      </td>
                      <td className="mono px-5 py-6 text-base font-black text-ink">{formatNaira(lead.dealValue)}</td>
                      <td className="max-w-sm px-5 py-6">
                        <div className="flex items-start gap-3">
                          {actionMissing || health.tone === "danger" ? (
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                          ) : (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-palm" />
                          )}
                          <div>
                            <p className="line-clamp-2 text-sm leading-5 text-[#3d2f1b]">{lead.nextAction || "No next action set"}</p>
                            <p className="mono mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a7b5e]">{formatDate(lead.nextActionDate)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-6">
                        <Link href={`/leads/${lead.id}`} className="focus-ring grid h-9 w-9 place-items-center text-[#8a7b5e] hover:bg-calm hover:text-ink" aria-label={`Open ${lead.name}`}>
                          <MoreHorizontal className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-line px-6 py-5 text-sm text-[#8a7b5e]">
            <span>
              Showing 1 to {filteredLeads.length} of {filteredLeads.length} leads
            </span>
            <div className="flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center border border-line bg-[#f8f2e2] text-[#b8ab8c]" aria-label="Previous page">
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              <span className="mono grid h-10 w-10 place-items-center bg-mint text-sm font-black text-palm">1</span>
              <button className="grid h-10 w-10 place-items-center border border-line bg-[#f8f2e2] text-[#b8ab8c]" aria-label="Next page">
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>
        </Card>

        <aside className="grid gap-5 content-start">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <h2 className="serif text-2xl italic text-ink">Pipeline overview</h2>
              <Info className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-5 border border-line bg-[#f8f2e2] p-4">
              <p className="label">Total pipeline value</p>
              <p className="mono mt-2 text-2xl font-black text-ink">{formatNaira(totalPipeline)}</p>
              <p className="mt-3 text-sm font-semibold text-[#8a7b5e]">{filteredLeads.length} leads</p>
            </div>
            <div className="mt-4 border border-line p-4">
              <p className="label">By stage</p>
              <div className="mt-4 flex items-center gap-5">
                <div
                  className="h-20 w-20 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#60a5fa 0 25%, #8b5cf6 25% 43%, #67e8f9 43% 68%, #cbd5e1 68% 82%, #34d399 82% 100%)"
                  }}
                >
                  <div className="m-3 h-14 w-14 rounded-full bg-white" />
                </div>
                <div className="grid flex-1 gap-2">
                  {visibleStageCounts.map((stage, index) => (
                    <div key={stage.id} className="flex items-center gap-2 text-xs">
                      <span className={clsx("h-2 w-2 rounded-full", dotColor(index))} />
                      <span className="flex-1 text-slate-600">{stage.label}</span>
                      <span className="font-black text-ink">{stage.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="serif text-2xl italic text-ink">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              <QuickAction
                icon={Upload}
                label="Import leads"
                onClick={() => setActionNotice("Import is staged for the prototype. Add leads one-by-one with New lead, then export the working list.")}
              />
              <QuickAction icon={Download} label="Export leads" onClick={exportLeadsCsv} />
              <QuickAction
                icon={Settings2}
                label="Manage stages"
                onClick={() => {
                  document.getElementById("stage-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActionNotice("Stage management is live on the board. Drag cards or use the arrow controls to move leads.");
                }}
              />
              <QuickAction
                icon={Filter}
                label="View lead sources"
                onClick={() => setActionNotice(sourceSummary ? `Top visible sources · ${sourceSummary}` : "No visible lead sources yet.")}
              />
            </div>
            <div className="mt-5 border border-line bg-[#f8f2e2] p-3">
              <p className="label text-palm">Local action</p>
              <p className="mt-2 text-xs leading-5 text-[#3d2f1b]">{actionNotice}</p>
            </div>
          </Card>

          <Card className="border-palm bg-[#d9e2d6] p-5">
            <div className="flex gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 text-palm" />
              <div>
                <h2 className="label text-palm">Tip</h2>
                <p className="mt-3 text-sm leading-6 text-[#3d2f1b]">
                  Set next actions to keep your pipeline moving forward. {noNextActionCount} visible lead{noNextActionCount === 1 ? "" : "s"} need attention.
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <section id="stage-board" className="mt-7 scroll-mt-28">
        <div className="flex flex-col justify-between gap-4 border-t border-line pt-7 md:flex-row md:items-end">
          <div>
            <h2 className="serif text-3xl italic text-ink">Stage board</h2>
            <p className="mt-1 text-sm text-[#8a7b5e]">
              Drag a lead into a new stage. Columns scroll horizontally so the board stays roomy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {draggingLead && (
              <span className="label hidden text-palm md:inline">
                Moving {draggingLead.name}
              </span>
            )}
            <button
              type="button"
              className="focus-ring grid h-10 w-10 place-items-center border border-line bg-[#f8f2e2] text-ink hover:bg-calm"
              onClick={() => scrollBoard("left")}
              aria-label="Scroll stage board left"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="focus-ring grid h-10 w-10 place-items-center border border-line bg-[#f8f2e2] text-ink hover:bg-calm"
              onClick={() => scrollBoard("right")}
              aria-label="Scroll stage board right"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="relative mt-4">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-paper to-transparent" />
          <div
            ref={boardRailRef}
            className="flex snap-x scroll-pl-0 items-start gap-5 overflow-x-auto pb-4 pr-8 scroll-smooth [scrollbar-color:var(--rule)_transparent]"
            aria-label="Draggable stage board"
          >
            {stages.map((stage) => {
              const stageLeads = filteredLeads.filter((lead) => lead.stage === stage.id);
              const isDropTarget = dragOverStage === stage.id && draggingLeadId !== null;
              return (
                <div
                  key={stage.id}
                  className={clsx(
                    "min-h-[340px] w-[340px] shrink-0 snap-start overflow-visible border bg-[#fbf6e7] p-4 transition",
                    isDropTarget ? "border-palm bg-[#d9e2d6] shadow-[4px_5px_0_var(--ink)]" : "border-line"
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDragOverStage(stage.id);
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setDragOverStage(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    moveDraggingLead(stage.id);
                  }}
                >
                  <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
                    <h3 className="label text-ink">{stage.label}</h3>
                    <span className="mono text-xs font-bold text-[#8a7b5e]">{stageLeads.length}</span>
                  </div>
                  <div className="grid gap-4">
                    {stageLeads.length ? (
                      stageLeads.map((lead, index) => (
                        <KanbanLeadCard
                          key={lead.id}
                          lead={lead}
                          index={index}
                          stage={stage.id}
                          isDragging={draggingLeadId === lead.id}
                          onDragStart={() => setDraggingLeadId(lead.id)}
                          onDragEnd={() => {
                            setDraggingLeadId(null);
                            setDragOverStage(null);
                          }}
                          onMoveStage={moveLeadToStage}
                        />
                      ))
                    ) : (
                      <div className="border border-dashed border-line bg-[#f8f2e2] px-3 py-8 text-center">
                        <p className="serif text-lg italic text-[#8a7b5e]">Drop a lead here.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function KanbanLeadCard({
  lead,
  index,
  stage,
  isDragging,
  onDragStart,
  onDragEnd,
  onMoveStage
}: {
  lead: {
    id: string;
    name: string;
    company: string;
    dealValue: number;
    nextAction: string;
    nextActionDate: string;
  };
  index: number;
  stage: LeadStage;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMoveStage: (leadId: string, stage: LeadStage) => void;
}) {
  const stageIndex = stages.findIndex((item) => item.id === stage);
  const previousStage = stageIndex > 0 ? stages[stageIndex - 1] : null;
  const nextStage = stageIndex < stages.length - 1 ? stages[stageIndex + 1] : null;

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", lead.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={clsx(
        "group cursor-grab border border-line bg-[#f8f2e2] p-4 transition active:cursor-grabbing",
        isDragging ? "opacity-50 ring-2 ring-palm" : "hover:border-palm hover:bg-[#fbf6e7]"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar label={initials(lead.name)} index={index} />
        <div className="min-w-0 flex-1">
          <Link href={`/leads/${lead.id}`} className="focus-ring font-black text-ink hover:text-palm">
            {lead.name}
          </Link>
          <p className="mt-1 truncate text-sm text-[#8a7b5e]">{lead.company}</p>
        </div>
      </div>
      <p className="mono mt-4 text-sm font-bold text-ink">{formatNaira(lead.dealValue)}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-5 text-[#3d2f1b]">{lead.nextAction || "No next action set"}</p>
      <p className="mono mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a7b5e]">
        {formatDate(lead.nextActionDate)}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <p className="label text-[9px] text-[#b8ab8c]">Drag or move</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="focus-ring grid h-8 w-8 place-items-center border border-line bg-transparent text-[#3d2f1b] disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!previousStage}
            aria-label={previousStage ? `Move ${lead.name} to ${previousStage.label}` : `${lead.name} is in the first stage`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (previousStage) onMoveStage(lead.id, previousStage.id);
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="focus-ring grid h-8 w-8 place-items-center border border-line bg-transparent text-[#3d2f1b] disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!nextStage}
            aria-label={nextStage ? `Move ${lead.name} to ${nextStage.label}` : `${lead.name} is in the last stage`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (nextStage) onMoveStage(lead.id, nextStage.id);
            }}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ControlSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative block">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />
      <select
        className="focus-ring h-14 w-full appearance-none border border-line bg-[#f8f2e2] pl-12 pr-10 text-sm font-semibold text-[#3d2f1b]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
    </label>
  );
}

function StagePill({ stage }: { stage: LeadStage }) {
  return (
    <span className={clsx("inline-flex border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]", stageColors[stage])}>
      {stages.find((item) => item.id === stage)?.label}
    </span>
  );
}

function Avatar({ label, index }: { label: string; index: number }) {
  return <span className={clsx("serif grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg italic", avatarColors[index % avatarColors.length])}>{label}</span>;
}

function QuickAction({
  icon: Icon,
  label,
  onClick
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="focus-ring flex items-center gap-3 px-1 py-1.5 text-left text-sm font-medium text-[#3d2f1b] hover:text-palm"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-[#8a7b5e]" />
      {label}
    </button>
  );
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function dotColor(index: number) {
  return ["bg-blue-400", "bg-violet-400", "bg-cyan-300", "bg-slate-300", "bg-emerald-400", "bg-rose-300"][index % 6];
}
