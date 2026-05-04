"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { LogView } from "@/components/log-view";

export default function LogPage() {
  return (
    <AppShell active="log">
      <Suspense fallback={null}>
        <LogView />
      </Suspense>
    </AppShell>
  );
}
