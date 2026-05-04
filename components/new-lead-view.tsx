"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { stages } from "@/lib/crm";
import { owners } from "@/lib/seed-data";
import { type AddLeadInput, useCrm } from "@/lib/store";
import type { LeadStage, LeadTemperature, RelationshipStrength } from "@/lib/types";
import { Button, Card, Field, inputClass } from "@/components/ui";

type NewLeadForm = {
  name: string;
  company: string;
  phone: string;
  email: string;
  stage: Extract<LeadStage, "new" | "talking" | "meeting_demo" | "proposal_sent">;
  temperature: LeadTemperature;
  source: string;
  referrerName: string;
  relationshipStrength: RelationshipStrength;
  ownerId: string;
  dealValue: string;
  probability: string;
  nextAction: string;
  nextActionDate: string;
  statusReason: string;
  tags: string;
  notes: string;
};

const activeStages = stages.filter((stage) => stage.id !== "won" && stage.id !== "lost");

function tomorrowKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function NewLeadView() {
  const router = useRouter();
  const { addLead } = useCrm();
  const [error, setError] = useState("");
  const [form, setForm] = useState<NewLeadForm>({
    name: "",
    company: "",
    phone: "",
    email: "",
    stage: "new",
    temperature: "warm",
    source: "Referral",
    referrerName: "",
    relationshipStrength: "medium",
    ownerId: owners[0]?.id ?? "owner-ife",
    dealValue: "",
    probability: "25",
    nextAction: "",
    nextActionDate: tomorrowKey(),
    statusReason: "New lead captured. First follow-up scheduled.",
    tags: "",
    notes: ""
  });

  function update<K extends keyof NewLeadForm>(key: K, value: NewLeadForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.company.trim()) {
      setError("Name and company are required.");
      return;
    }
    if (!form.nextAction.trim() || !form.nextActionDate) {
      setError("Every active lead needs a next action and date.");
      return;
    }

    const dealValue = Number(form.dealValue || 0);
    const probability = Number(form.probability || 0);
    if (Number.isNaN(dealValue) || dealValue < 0 || Number.isNaN(probability) || probability < 0 || probability > 100) {
      setError("Deal value and probability need valid numbers.");
      return;
    }

    const input: AddLeadInput = {
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      stage: form.stage,
      temperature: form.temperature,
      source: form.source.trim() || "Manual entry",
      referrerName: form.referrerName.trim(),
      relationshipStrength: form.relationshipStrength,
      ownerId: form.ownerId,
      dealValue,
      probability,
      nextAction: form.nextAction.trim(),
      nextActionDate: form.nextActionDate,
      statusReason: form.statusReason.trim() || "New lead captured. First follow-up scheduled.",
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes: form.notes.trim()
    };

    const leadId = addLead(input);
    router.push(`/leads/${leadId}`);
  }

  return (
    <div className="mx-auto max-w-[980px]">
      <Link href="/leads" className="focus-ring inline-flex items-center gap-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-palm transition hover:gap-3">
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      <div className="mt-7 flex items-baseline justify-between border-b border-line pb-2">
        <span className="label">Lead intake · First action required</span>
        <span className="mono text-[10px] tracking-[0.05em] text-[#b8ab8c]">NEW RECORD</span>
      </div>

      <div className="mt-5">
        <h1 className="display-title text-ink">New lead.</h1>
        <p className="mt-5 max-w-2xl font-medium leading-7 text-[#3d2f1b]">
          Add a lead to the pipeline with a clear next action. The record will appear in the table, stage board, Today queues, and lead ledger.
        </p>
      </div>

      <Card className="mt-8 p-6">
        <form className="grid gap-8" onSubmit={onSubmit}>
          {error && <p className="border-l-4 border-amber bg-[#f1d8c5] px-4 py-3 text-sm font-bold text-ink">{error}</p>}

          <section>
            <div className="mb-4 flex items-baseline justify-between border-b border-line pb-2">
              <h2 className="serif text-2xl italic text-ink">Who is this?</h2>
              <span className="label">Identity</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Lead name">
                <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Adaora Nwosu" required />
              </Field>
              <Field label="Company">
                <input className={inputClass} value={form.company} onChange={(event) => update("company", event.target.value)} placeholder="KoboMart Wholesale" required />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+234..." />
              </Field>
              <Field label="Email">
                <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="name@company.ng" />
              </Field>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-baseline justify-between border-b border-line pb-2">
              <h2 className="serif text-2xl italic text-ink">Pipeline position</h2>
              <span className="label">Commercials</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Stage">
                <select className={inputClass} value={form.stage} onChange={(event) => update("stage", event.target.value as NewLeadForm["stage"])}>
                  {activeStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Temperature">
                <select className={inputClass} value={form.temperature} onChange={(event) => update("temperature", event.target.value as LeadTemperature)}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </Field>
              <Field label="Owner">
                <select className={inputClass} value={form.ownerId} onChange={(event) => update("ownerId", event.target.value)}>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Relationship">
                <select className={inputClass} value={form.relationshipStrength} onChange={(event) => update("relationshipStrength", event.target.value as RelationshipStrength)}>
                  <option value="weak">Weak</option>
                  <option value="medium">Medium</option>
                  <option value="strong">Strong</option>
                </select>
              </Field>
              <Field label="Deal value">
                <input className={inputClass} type="number" min="0" value={form.dealValue} onChange={(event) => update("dealValue", event.target.value)} placeholder="2500000" />
              </Field>
              <Field label="Probability">
                <input className={inputClass} type="number" min="0" max="100" value={form.probability} onChange={(event) => update("probability", event.target.value)} />
              </Field>
              <Field label="Source">
                <input className={inputClass} value={form.source} onChange={(event) => update("source", event.target.value)} placeholder="Referral, trade fair, WhatsApp community" />
              </Field>
              <Field label="Referrer">
                <input className={inputClass} value={form.referrerName} onChange={(event) => update("referrerName", event.target.value)} placeholder="Optional" />
              </Field>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-baseline justify-between border-b border-line pb-2">
              <h2 className="serif text-2xl italic text-ink">First follow-up</h2>
              <span className="label text-palm">Required</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Next action">
                <input className={inputClass} value={form.nextAction} onChange={(event) => update("nextAction", event.target.value)} placeholder="Send WhatsApp intro and ask for demo slot" required />
              </Field>
              <Field label="Next action date">
                <input className={inputClass} type="date" value={form.nextActionDate} onChange={(event) => update("nextActionDate", event.target.value)} required />
              </Field>
              <div className="md:col-span-2">
                <Field label="Status reason">
                  <input className={inputClass} value={form.statusReason} onChange={(event) => update("statusReason", event.target.value)} />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-baseline justify-between border-b border-line pb-2">
              <h2 className="serif text-2xl italic text-ink">Context</h2>
              <span className="label">Notes</span>
            </div>
            <div className="grid gap-5">
              <Field label="Tags">
                <input className={inputClass} value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="lagos, wholesale, inventory" />
              </Field>
              <Field label="Notes">
                <textarea className={`${inputClass} min-h-32 py-3`} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="What matters about this account?" />
              </Field>
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
            <Button type="submit" className="min-h-12">
              <Plus className="h-4 w-4" />
              Create lead
            </Button>
            <Link href="/leads" className="focus-ring inline-flex min-h-12 items-center justify-center border border-line px-4 text-xs font-bold uppercase tracking-[0.12em] text-ink hover:bg-[#f8f2e2]">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
