import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboundApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function useInboundMessages(page: number = 1, pageSize: number = 50, domainId?: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['inbound-messages', tenantId, page, pageSize, domainId],
    queryFn: () => inboundApi.getAll(page, pageSize, domainId),
    enabled: !!tenantId,
  });
}

export function useInboundMessage(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['inbound-messages', tenantId, id],
    queryFn: () => inboundApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}

export function useInboundMessageRawUrl(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['inbound-messages', tenantId, id, 'raw'],
    queryFn: () => inboundApi.getRawUrl(id),
    enabled: !!id && !!tenantId,
  });
}

export function useDeleteInboundMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inboundApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-messages'] });
    },
  });
}
