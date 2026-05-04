"use client";

import { AppShell } from "@/components/app-shell";
import { LeadsView } from "@/components/leads-view";

export default function LeadsPage() {
  return (
    <AppShell active="leads">
      <LeadsView />
    </AppShell>
  );
}
