import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDeal, getDeals, transitionDeal } from '../../api/deals';
import type { CreateDealRequest, DealAction, DealStage } from '../../api/types';

const dealsKey = (stage?: DealStage) => ['deals', stage ?? 'all'] as const;

export function useDeals(stage?: DealStage) {
  return useQuery({
    queryKey: dealsKey(stage),
    queryFn: () => getDeals(stage),
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateDealRequest) => createDeal(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useTransitionDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: DealAction }) =>
      transitionDeal(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });
}
