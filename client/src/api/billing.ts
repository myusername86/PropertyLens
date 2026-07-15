import { api } from './client';
import type { BillingInterval, SubscriptionPlan } from './types';

interface RedirectResponse {
  url: string;
}

export async function startCheckout(
  plan: SubscriptionPlan,
  interval: BillingInterval,
): Promise<string> {
  const response = await api<RedirectResponse>('/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan, interval }),
  });
  return response.url;
}

export async function openBillingPortal(): Promise<string> {
  const response = await api<RedirectResponse>('/api/billing/portal', { method: 'POST' });
  return response.url;
}