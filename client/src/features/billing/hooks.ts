import { useMutation } from '@tanstack/react-query';
import { openBillingPortal, startCheckout } from '../../api/billing';
import type { BillingInterval, SubscriptionPlan } from '../../api/types';

export function useStartCheckout() {
  return useMutation({
    mutationFn: ({ plan, interval }: { plan: SubscriptionPlan; interval: BillingInterval }) =>
      startCheckout(plan, interval),
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: openBillingPortal,
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
}