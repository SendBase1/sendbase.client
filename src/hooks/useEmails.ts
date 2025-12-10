import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type {
  ListEmailsParams,
  SendEmailRequest,
  SendBatchEmailRequest,
  UpdateScheduledEmailRequest,
} from '../lib/types';

export function useEmails(params: ListEmailsParams = {}) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['emails', tenantId, params],
    queryFn: () => emailApi.list(params),
    enabled: !!tenantId,
  });
}

export function useEmail(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['emails', tenantId, id],
    queryFn: () => emailApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (data: SendEmailRequest) => emailApi.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
    },
  });
}

export function useSendBatchEmails() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (data: SendBatchEmailRequest) => emailApi.sendBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
    },
  });
}

export function useUpdateEmail() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduledEmailRequest }) =>
      emailApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['emails', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['emails', tenantId, id] });
    },
  });
}

export function useCancelEmail() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: (id: string) => emailApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails', tenantId] });
    },
  });
}

export function useEmailAttachments(emailId: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['emails', tenantId, emailId, 'attachments'],
    queryFn: () => emailApi.listAttachments(emailId),
    enabled: !!emailId && !!tenantId,
  });
}

export function useEmailAttachmentUrl(emailId: string, attachmentId: number) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['emails', tenantId, emailId, 'attachments', attachmentId],
    queryFn: () => emailApi.getAttachmentUrl(emailId, attachmentId),
    enabled: !!emailId && !!attachmentId && !!tenantId,
    staleTime: 1000 * 60 * 55, // 55 minutes (URL expires in 1 hour)
  });
}
