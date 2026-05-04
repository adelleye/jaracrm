"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedCostPeriod, seedInteractions, seedLeads } from "@/lib/seed-data";
import type { Interaction, InteractionType, Lead, LeadStage, SalesCostPeriod } from "@/lib/types";

type LogInteractionInput = {
  leadId: string;
  type: InteractionType;
  summary: string;
  nextAction: string;
  nextActionDate: string;
};

export type AddLeadInput = Omit<Lead, "id" | "createdAt" | "updatedAt" | "lastTouchDate">;

type CrmStore = {
  leads: Lead[];
  interactions: Interaction[];
  costPeriod: SalesCostPeriod;
  hydrated: boolean;
  addLead: (input: AddLeadInput) => string;
  logInteraction: (input: LogInteractionInput) => void;
  moveLeadToStage: (leadId: string, stage: LeadStage) => void;
  resetSeedData: () => void;
};

const storageKey = "jara-crm-state-v1";

const CrmContext = createContext<CrmStore | null>(null);

type PersistedState = {
  leads: Lead[];
  interactions: Interaction[];
  costPeriod: SalesCostPeriod;
};

const initialState: PersistedState = {
  leads: seedLeads,
  interactions: seedInteractions,
  costPeriod: seedCostPeriod
};

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const hasHydrated = useRef(false);

  function persist(nextState: PersistedState) {
    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    return nextState;
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        hasHydrated.current = true;
        setHydrated(true);
        return;
      }
      try {
        setState(JSON.parse(raw) as PersistedState);
      } catch {
        setState(initialState);
      }
      hasHydrated.current = true;
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const value = useMemo<CrmStore>(
    () => ({
      leads: state.leads,
      interactions: state.interactions,
      costPeriod: state.costPeriod,
      hydrated,
      addLead: (input) => {
        const today = new Date().toISOString().slice(0, 10);
        const idBase = `${input.name}-${input.company}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 42);
        const lead: Lead = {
          ...input,
          id: `lead-${idBase || "new"}-${crypto.randomUUID().slice(0, 8)}`,
          createdAt: today,
          updatedAt: today,
          lastTouchDate: today
        };

        setState((current) =>
          persist({
            ...current,
            leads: [lead, ...current.leads]
          })
        );
        return lead.id;
      },
      logInteraction: (input) => {
        const now = new Date().toISOString();
        const today = now.slice(0, 10);
        const interaction: Interaction = {
          id: `int-${crypto.randomUUID()}`,
          leadId: input.leadId,
          type: input.type,
          summary: input.summary,
          nextAction: input.nextAction,
          nextActionDate: input.nextActionDate,
          createdAt: now,
          ownerId: state.leads.find((lead) => lead.id === input.leadId)?.ownerId ?? "owner-ife"
        };

        setState((current) =>
          persist({
            ...current,
            interactions: [interaction, ...current.interactions],
            leads: current.leads.map((lead) =>
              lead.id === input.leadId
                ? {
                    ...lead,
                    lastTouchDate: today,
                    nextAction: input.nextAction,
                    nextActionDate: input.nextActionDate,
                    stage: input.type === "proposal_sent" ? "proposal_sent" : lead.stage,
                    updatedAt: today
                  }
                : lead
            )
          })
        );
      },
      moveLeadToStage: (leadId, stage) => {
        const today = new Date().toISOString().slice(0, 10);
        setState((current) =>
          persist({
            ...current,
            leads: current.leads.map((lead) =>
              lead.id === leadId
                ? {
                    ...lead,
                    stage,
                    probability: stage === "won" ? 100 : stage === "lost" ? 0 : lead.probability,
                    nextAction: stage === "won" || stage === "lost" ? "" : lead.nextAction,
                    nextActionDate: stage === "won" || stage === "lost" ? "" : lead.nextActionDate,
                    statusReason: stage === "won" ? "Moved to won from the stage board." : stage === "lost" ? "Moved to lost from the stage board." : lead.statusReason,
                    updatedAt: today
                  }
                : lead
            )
          })
        );
      },
      resetSeedData: () => setState(persist(initialState))
    }),
    [hydrated, state]
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrm must be used inside CrmProvider");
  }
  return context;
}
