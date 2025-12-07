import { useQuery } from '@tanstack/react-query';
import { messageApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function useMessages(page: number = 1, pageSize: number = 50) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['messages', tenantId, page, pageSize],
    queryFn: () => messageApi.getAll(page, pageSize),
    enabled: !!tenantId,
  });
}

export function useMessage(id: string) {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['messages', tenantId, id],
    queryFn: () => messageApi.getById(id),
    enabled: !!id && !!tenantId,
  });
}
