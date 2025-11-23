import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi } from '../lib/api';
import type { SendEmailRequest } from '../lib/types';

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendEmailRequest) => emailApi.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
