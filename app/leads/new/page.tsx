"use client";

import { AppShell } from "@/components/app-shell";
import { NewLeadView } from "@/components/new-lead-view";

export default function NewLeadPage() {
  return (
    <AppShell active="leads">
      <NewLeadView />
    </AppShell>
  );
}
