/** Mirrors ArvSaas.Application DTOs. Keep in sync with the backend. */

export const DealStage = {
  New: 0,
  Analyzing: 1,
  Approved: 2,
  Rejected: 3,
} as const;
export type DealStage = (typeof DealStage)[keyof typeof DealStage];

export const RiskLevel = {
  Unknown: 0,
  Low: 1,
  Medium: 2,
  High: 3,
} as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export interface ComparableSaleInput {
  address: string;
  salePrice: number;
  adjustmentFactor: number;
}

export interface CreateDealRequest {
  address: string;
  city: string;
  state: string | null;
  purchasePrice: number;
  renovationCost: number;
  holdingCosts: number;
  comparables: ComparableSaleInput[];
}

export interface Deal {
  id: string;
  address: string;
  city: string;
  purchasePrice: number;
  renovationCost: number;
  stage: DealStage;
  afterRepairValue: number | null;
  estimatedProfit: number | null;
  roiPercent: number | null;
  maxAllowableOffer: number | null;
  riskLevel: RiskLevel;
  aiRecommendation: string | null;
  createdAt: string;
}
export const SubscriptionPlan = {
  Free: 0,
  Pro: 1,
  Enterprise: 2,
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const BillingInterval = {
  Monthly: 0,
  Yearly: 1,
} as const;
export type BillingInterval = (typeof BillingInterval)[keyof typeof BillingInterval];
export type DealAction = 'analyze' | 'approve' | 'reject';
