"use client";

import { AppShell } from "@/components/app-shell";
import { TodayView } from "@/components/today-view";

export default function Home() {
  return (
    <AppShell active="today">
      <TodayView />
    </AppShell>
  );
}
