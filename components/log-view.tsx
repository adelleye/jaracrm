"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquarePlus, Send } from "lucide-react";
import { stages } from "@/lib/crm";
import { useCrm } from "@/lib/store";
import type { InteractionType } from "@/lib/types";
import { Button, Card, Field, inputClass } from "@/components/ui";

const interactionTypes: InteractionType[] = [
  "whatsapp",
  "call",
  "meeting",
  "referral_intro",
  "site_visit",
  "proposal_sent",
  "payment",
  "other"
];

export function LogView() {
  const { leads, logInteraction } = useCrm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLeadId = searchParams.get("leadId") ?? leads[0]?.id ?? "";
  const [leadId, setLeadId] = useState(initialLeadId);
  const [type, setType] = useState<InteractionType>("whatsapp");
  const [summary, setSummary] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [saved, setSaved] = useState(false);

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === leadId), [leadId, leads]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!leadId || !summary.trim()) return;

    logInteraction({
      leadId,
      type,
      summary: summary.trim(),
      nextAction: nextAction.trim(),
      nextActionDate
    });
    setSaved(true);
    setSummary("");
    setNextAction("");
    setNextActionDate("");
    setTimeout(() => router.push(`/leads/${leadId}`), 600);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <span className="label">Field note ledger</span>
        <span className="mono text-[10px] tracking-[0.05em] text-[#b8ab8c]">NEW ENTRY</span>
      </div>
      <div className="mt-5">
        <h1 className="display-title text-ink">Log.</h1>
        <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <p className="max-w-2xl font-medium leading-7 text-[#3d2f1b]">
            Capture the conversation and leave the lead with a next action.
          </p>
          <Link
            href="#log-entry"
            className="focus-ring ink-action min-h-12 px-5 text-xs font-bold uppercase tracking-[0.12em]"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Log update
          </Link>
        </div>
      </div>

      <div id="log-entry" className="scroll-mt-28">
        <Card className="mt-8 p-6">
          <form className="grid gap-6" onSubmit={onSubmit}>
          <Field label="Lead">
            <select className={inputClass} value={leadId} onChange={(event) => setLeadId(event.target.value)}>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} - {lead.company}
                </option>
              ))}
            </select>
          </Field>

          {selectedLead && (
            <div className="border-l-4 border-palm bg-calm p-4 text-sm text-[#3d2f1b]">
              Current stage: <span className="font-bold text-ink">{stages.find((stage) => stage.id === selectedLead.stage)?.label}</span>.
              Current next action: <span className="font-bold text-ink">{selectedLead.nextAction || "none"}</span>.
            </div>
          )}

          <Field label="Interaction type">
            <select className={inputClass} value={type} onChange={(event) => setType(event.target.value as InteractionType)}>
              {interactionTypes.map((item) => (
                <option key={item} value={item}>
                  {item.replace("_", " ")}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Summary">
            <textarea
              className={`${inputClass} min-h-32 py-3`}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Example: Spoke on WhatsApp. Finance manager wants final invoice terms before Friday."
              required
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Next action">
              <input
                className={inputClass}
                value={nextAction}
                onChange={(event) => setNextAction(event.target.value)}
                placeholder="Send pricing recap on WhatsApp"
              />
            </Field>
            <Field label="Next action date">
              <input
                className={inputClass}
                type="date"
                value={nextActionDate}
                onChange={(event) => setNextActionDate(event.target.value)}
              />
            </Field>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button type="submit" className="min-h-12">
              <Send className="h-4 w-4" />
              Save update
            </Button>
            {saved && <p className="text-sm font-semibold text-palm">Saved. Opening lead profile...</p>}
          </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
