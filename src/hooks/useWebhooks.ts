import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhookApi } from '../lib/api';
import type {
  CreateWebhookEndpointRequest,
  UpdateWebhookEndpointRequest,
} from '../lib/types';

// Query keys
export const webhookKeys = {
  all: ['webhooks'] as const,
  lists: () => [...webhookKeys.all, 'list'] as const,
  list: () => [...webhookKeys.lists()] as const,
  details: () => [...webhookKeys.all, 'detail'] as const,
  detail: (id: string) => [...webhookKeys.details(), id] as const,
  deliveries: (id: string) => [...webhookKeys.detail(id), 'deliveries'] as const,
  eventTypes: () => [...webhookKeys.all, 'eventTypes'] as const,
};

// Fetch all webhooks
export function useWebhooks() {
  return useQuery({
    queryKey: webhookKeys.list(),
    queryFn: () => webhookApi.getAll(),
  });
}

// Fetch single webhook
export function useWebhook(id: string) {
  return useQuery({
    queryKey: webhookKeys.detail(id),
    queryFn: () => webhookApi.getById(id),
    enabled: !!id,
  });
}

// Fetch webhook deliveries
export function useWebhookDeliveries(id: string, limit: number = 50) {
  return useQuery({
    queryKey: webhookKeys.deliveries(id),
    queryFn: () => webhookApi.getDeliveries(id, limit),
    enabled: !!id,
  });
}

// Fetch event types
export function useWebhookEventTypes() {
  return useQuery({
    queryKey: webhookKeys.eventTypes(),
    queryFn: () => webhookApi.getEventTypes(),
    staleTime: Infinity, // Event types don't change often
  });
}

// Create webhook mutation
export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebhookEndpointRequest) => webhookApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

// Update webhook mutation
export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookEndpointRequest }) =>
      webhookApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: webhookKeys.detail(variables.id) });
    },
  });
}

// Delete webhook mutation
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhookApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

// Test webhook mutation
export function useTestWebhook() {
  return useMutation({
    mutationFn: (id: string) => webhookApi.test(id),
  });
}
