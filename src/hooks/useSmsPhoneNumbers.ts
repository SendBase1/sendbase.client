import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smsPhoneNumberApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { ProvisionPhoneNumberRequest } from '../lib/types';

export function useSmsPhoneNumbers() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['sms-phone-numbers', tenantId],
    queryFn: () => smsPhoneNumberApi.getAll(),
    enabled: !!tenantId,
  });
}

export function useSmsPhoneNumber(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['sms-phone-numbers', tenantId, id],
    queryFn: () => smsPhoneNumberApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}

export function useSetDefaultPhoneNumber() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (id: string) => smsPhoneNumberApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-phone-numbers', tenantId] });
    },
  });
}

export function useProvisionPhoneNumber() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (data: ProvisionPhoneNumberRequest) => smsPhoneNumberApi.provision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-phone-numbers', tenantId] });
    },
  });
}

export function useReleasePhoneNumber() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (id: string) => smsPhoneNumberApi.release(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-phone-numbers', tenantId] });
    },
  });
}
