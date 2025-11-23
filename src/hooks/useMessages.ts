import { useQuery } from '@tanstack/react-query';
import { messageApi } from '../lib/api';

export function useMessages(page: number = 1, pageSize: number = 50) {
  return useQuery({
    queryKey: ['messages', page, pageSize],
    queryFn: () => messageApi.getAll(page, pageSize),
  });
}

export function useMessage(id: string) {
  return useQuery({
    queryKey: ['messages', id],
    queryFn: () => messageApi.getById(id),
    enabled: !!id,
  });
}
