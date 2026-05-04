"use client";

import { AppShell } from "@/components/app-shell";
import { NumbersView } from "@/components/numbers-view";

export default function NumbersPage() {
  return (
    <AppShell active="numbers">
      <NumbersView />
    </AppShell>
  );
}
