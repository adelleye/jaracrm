import { clsx } from "clsx";
import type { Lead } from "@/lib/types";
import { getLeadHealth } from "@/lib/crm";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={clsx("ledger-card", className)}>{children}</section>;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex min-h-10 items-center justify-center gap-2 px-4 text-xs font-bold uppercase tracking-[0.12em] transition",
        variant === "primary" && "ink-action",
        variant === "secondary" && "border border-line bg-transparent text-ink hover:bg-[#f8f2e2]",
        variant === "ghost" && "text-ink hover:bg-[#e6dcc1]",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "focus-ring min-h-11 w-full border border-line bg-[#f8f2e2] px-3 text-sm text-ink placeholder:text-[#8a7b5e]";

export function HealthBadge({ lead }: { lead: Lead }) {
  const health = getLeadHealth(lead);
  return <Badge tone={health.tone}>{health.label}</Badge>;
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        tone === "good" && "bg-mint text-palm",
        tone === "warning" && "bg-[#f1d8c5] text-amber",
        tone === "danger" && "bg-[#f1d8c5] text-coral",
        tone === "neutral" && "bg-[#f8f2e2] text-[#3d2f1b]",
        tone === "hot" && "bg-[#f1d8c5] text-coral",
        tone === "warm" && "bg-[#f8f2e2] text-amber",
        tone === "cold" && "bg-[#e6dcc1] text-[#3d2f1b]"
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="border border-dashed border-line bg-calm px-4 py-5 text-sm text-[#3d2f1b]">{text}</p>;
}
