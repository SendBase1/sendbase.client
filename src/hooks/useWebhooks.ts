import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhookApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type {
  CreateWebhookEndpointRequest,
  UpdateWebhookEndpointRequest,
} from '../lib/types';

// Query keys factory - includes tenantId for proper cache invalidation on tenant switch
export const createWebhookKeys = (tenantId: string | null) => ({
  all: ['webhooks', tenantId] as const,
  lists: () => [...createWebhookKeys(tenantId).all, 'list'] as const,
  list: () => [...createWebhookKeys(tenantId).lists()] as const,
  details: () => [...createWebhookKeys(tenantId).all, 'detail'] as const,
  detail: (id: string) => [...createWebhookKeys(tenantId).details(), id] as const,
  deliveries: (id: string) => [...createWebhookKeys(tenantId).detail(id), 'deliveries'] as const,
  eventTypes: () => ['webhooks', 'eventTypes'] as const, // Event types are global
});

// Legacy export for backwards compatibility
export const webhookKeys = createWebhookKeys(null);

// Fetch all webhooks
export function useWebhooks() {
  const { tenantId } = useAuth();
  const keys = createWebhookKeys(tenantId);
  return useQuery({
    queryKey: keys.list(),
    queryFn: () => webhookApi.getAll(),
    enabled: !!tenantId,
  });
}

// Fetch single webhook
export function useWebhook(id: string) {
  const { tenantId } = useAuth();
  const keys = createWebhookKeys(tenantId);
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => webhookApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}

// Fetch webhook deliveries
export function useWebhookDeliveries(id: string, limit: number = 50) {
  const { tenantId } = useAuth();
  const keys = createWebhookKeys(tenantId);
  return useQuery({
    queryKey: keys.deliveries(id),
    queryFn: () => webhookApi.getDeliveries(id, limit),
    enabled: !!id && !!tenantId,
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
