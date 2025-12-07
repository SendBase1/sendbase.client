import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeyApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { CreateApiKeyRequest } from '../lib/types';

export function useApiKeys() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['apikeys', tenantId],
    queryFn: () => apiKeyApi.getAll(),
    enabled: !!tenantId,
  });
}

export function useApiKeyScopes() {
  return useQuery({
    queryKey: ['apikeys', 'scopes'],
    queryFn: () => apiKeyApi.getScopes(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => apiKeyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apikeys'] });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeyApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apikeys'] });
    },
  });
}
