import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { CreateTemplateRequest, UpdateTemplateRequest } from '../lib/types';

export function useTemplates() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['templates', tenantId],
    queryFn: () => templateApi.getAll(),
    enabled: !!tenantId,
  });
}

export function useTemplate(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['templates', tenantId, id],
    queryFn: () => templateApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => templateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
      templateApi.update(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', result.id] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables?: Record<string, string> }) =>
      templateApi.preview(id, variables),
  });
}
