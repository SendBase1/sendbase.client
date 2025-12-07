import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { domainApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { CreateDomainRequest } from '../lib/types';

export function useDomains() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['domains', tenantId],
    queryFn: () => domainApi.getAll(),
    enabled: !!tenantId,
  });
}

export function useDomain(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['domains', tenantId, id],
    queryFn: () => domainApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDomainRequest) => domainApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
  });
}

export function useVerifyDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => domainApi.verify(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['domains', data.id] });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => domainApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
  });
}
