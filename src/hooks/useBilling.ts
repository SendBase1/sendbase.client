import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../lib/api';
import type {
  CreateCheckoutRequest,
  ChangePlanRequest,
  CancelSubscriptionRequest,
  CreatePortalSessionRequest,
} from '../lib/types';

export function useBillingPlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billingApi.getPlans(),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => billingApi.getSubscription(),
  });
}

export function useUsage() {
  return useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: () => billingApi.getUsage(),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => billingApi.getInvoices(),
  });
}

export function usePlanLimits() {
  return useQuery({
    queryKey: ['billing', 'limits'],
    queryFn: () => billingApi.getLimits(),
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (data: CreateCheckoutRequest) => billingApi.createCheckoutSession(data),
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePlanRequest) => billingApi.changePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'usage'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'limits'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelSubscriptionRequest) => billingApi.cancelSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => billingApi.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
    },
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: (data: CreatePortalSessionRequest) => billingApi.createPortalSession(data),
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.portalUrl;
    },
  });
}
