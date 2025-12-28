import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { ListSmsParams, SendSmsRequest } from '../lib/types';

export function useSmsMessages(params: ListSmsParams = {}) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['sms-messages', tenantId, params],
    queryFn: () => smsApi.list(params),
    enabled: !!tenantId,
  });
}

export function useSmsMessage(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['sms-messages', tenantId, id],
    queryFn: () => smsApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}

export function useSendSms() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (data: SendSmsRequest) => smsApi.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-messages', tenantId] });
    },
  });
}

export function useCancelSms() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (id: string) => smsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-messages', tenantId] });
    },
  });
}
