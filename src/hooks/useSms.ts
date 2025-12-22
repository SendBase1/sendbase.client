import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smsApi } from '../lib/api';
import type {
  SendSmsRequest,
  CreateSmsTemplateRequest,
  UpdateSmsTemplateRequest,
} from '../lib/types';

// SMS Messages
export function useSmsMessages(page = 1, pageSize = 50, status?: number) {
  return useQuery({
    queryKey: ['sms-messages', page, pageSize, status],
    queryFn: () => smsApi.getMessages(page, pageSize, status),
  });
}

export function useSmsMessage(id: string) {
  return useQuery({
    queryKey: ['sms-message', id],
    queryFn: () => smsApi.getMessage(id),
    enabled: !!id,
  });
}

export function useSendSms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendSmsRequest) => smsApi.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-messages'] });
    },
  });
}

export function useCancelSms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => smsApi.cancelMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-messages'] });
    },
  });
}

// SMS Templates
export function useSmsTemplates(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['sms-templates', page, pageSize],
    queryFn: () => smsApi.getTemplates(page, pageSize),
  });
}

export function useSmsTemplate(id: string) {
  return useQuery({
    queryKey: ['sms-template', id],
    queryFn: () => smsApi.getTemplate(id),
    enabled: !!id,
  });
}

export function useCreateSmsTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSmsTemplateRequest) => smsApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
    },
  });
}

export function useUpdateSmsTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSmsTemplateRequest }) =>
      smsApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
    },
  });
}

export function useDeleteSmsTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => smsApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
    },
  });
}
