import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smsTemplateApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { CreateSmsTemplateRequest, UpdateSmsTemplateRequest } from '../lib/types';

export function useSmsTemplates(page = 1, pageSize = 20) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['sms-templates', tenantId, page, pageSize],
    queryFn: () => smsTemplateApi.getAll(page, pageSize),
    enabled: !!tenantId,
  });
}

export function useSmsTemplate(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['sms-templates', tenantId, id],
    queryFn: () => smsTemplateApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateSmsTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (data: CreateSmsTemplateRequest) => smsTemplateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates', tenantId] });
    },
  });
}

export function useUpdateSmsTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSmsTemplateRequest }) =>
      smsTemplateApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['sms-templates', tenantId, id] });
    },
  });
}

export function useDeleteSmsTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (id: string) => smsTemplateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates', tenantId] });
    },
  });
}
