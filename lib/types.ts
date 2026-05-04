export type LeadStage =
  | "new"
  | "talking"
  | "meeting_demo"
  | "proposal_sent"
  | "won"
  | "lost";

export type LeadTemperature = "hot" | "warm" | "cold";

export type RelationshipStrength = "weak" | "medium" | "strong";

export type InteractionType =
  | "whatsapp"
  | "call"
  | "meeting"
  | "referral_intro"
  | "site_visit"
  | "proposal_sent"
  | "payment"
  | "other";

export type Lead = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  stage: LeadStage;
  temperature: LeadTemperature;
  source: string;
  referrerName?: string;
  relationshipStrength: RelationshipStrength;
  ownerId: string;
  dealValue: number;
  probability: number;
  nextAction: string;
  nextActionDate: string;
  lastTouchDate: string;
  createdAt: string;
  updatedAt: string;
  statusReason: string;
  tags: string[];
  notes: string;
};

export type Interaction = {
  id: string;
  leadId: string;
  type: InteractionType;
  summary: string;
  nextAction: string;
  nextActionDate: string;
  createdAt: string;
  ownerId: string;
};

export type SalesCostPeriod = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  salesCost: number;
  marketingCost: number;
  targetCustomers: number;
  averageMonthlyGrossProfitPerCustomer: number;
};

export type SalesMetrics = {
  peopleSpokenTo: number;
  dealsWon: number;
  revenueWon: number;
  conversionRate: number;
  pipelineRequired: number;
  cac: number;
  cacPaybackMonths: number;
};

export type Owner = {
  id: string;
  name: string;
};
