"use client";

import { use } from "react";
import { AppShell } from "@/components/app-shell";
import { LeadDetailView } from "@/components/lead-detail-view";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell active="leads">
      <LeadDetailView leadId={id} />
    </AppShell>
  );
}
