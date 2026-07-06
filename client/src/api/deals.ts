import { api } from './client';
import type { CreateDealRequest, Deal, DealAction, DealStage } from './types';

export function getDeals(stage?: DealStage): Promise<Deal[]> {
  const query = stage !== undefined ? `?stage=${stage}` : '';
  return api<Deal[]>(`/api/deals${query}`);
}

export function createDeal(request: CreateDealRequest): Promise<Deal> {
  return api<Deal>('/api/deals', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function transitionDeal(id: string, action: DealAction): Promise<Deal> {
  return api<Deal>(`/api/deals/${id}/${action}`, { method: 'POST' });
}
