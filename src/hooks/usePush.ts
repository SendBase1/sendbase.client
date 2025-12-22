import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pushApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type {
  CreatePushCredentialRequest,
  UpdatePushCredentialRequest,
  RegisterPushDeviceRequest,
  UpdatePushDeviceRequest,
  SendPushRequest,
  CreatePushTemplateRequest,
  UpdatePushTemplateRequest,
} from '../lib/types';

// Query keys factory - includes tenantId for proper cache invalidation on tenant switch
export const createPushKeys = (tenantId: string | null) => ({
  all: ['push', tenantId] as const,
  // Credentials
  credentials: () => [...createPushKeys(tenantId).all, 'credentials'] as const,
  credentialsList: () => [...createPushKeys(tenantId).credentials(), 'list'] as const,
  credentialDetail: (id: string) => [...createPushKeys(tenantId).credentials(), 'detail', id] as const,
  // Devices
  devices: () => [...createPushKeys(tenantId).all, 'devices'] as const,
  devicesList: () => [...createPushKeys(tenantId).devices(), 'list'] as const,
  deviceDetail: (id: string) => [...createPushKeys(tenantId).devices(), 'detail', id] as const,
  // Messages
  messages: () => [...createPushKeys(tenantId).all, 'messages'] as const,
  messagesList: () => [...createPushKeys(tenantId).messages(), 'list'] as const,
  messageDetail: (id: string) => [...createPushKeys(tenantId).messages(), 'detail', id] as const,
  // Templates
  templates: () => [...createPushKeys(tenantId).all, 'templates'] as const,
  templatesList: () => [...createPushKeys(tenantId).templates(), 'list'] as const,
  templateDetail: (id: string) => [...createPushKeys(tenantId).templates(), 'detail', id] as const,
});

// Legacy export for backwards compatibility
export const pushKeys = createPushKeys(null);

// ============== Credentials ==============

export function usePushCredentials() {
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);
  return useQuery({
    queryKey: keys.credentialsList(),
    queryFn: () => pushApi.getCredentials(),
    enabled: !!tenantId,
  });
}

export function usePushCredential(id: string) {
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);
  return useQuery({
    queryKey: keys.credentialDetail(id),
    queryFn: () => pushApi.getCredential(id),
    enabled: !!id && !!tenantId,
  });
}

export function useCreatePushCredential() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (data: CreatePushCredentialRequest) => pushApi.createCredential(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.credentialsList() });
    },
  });
}

export function useUpdatePushCredential() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePushCredentialRequest }) =>
      pushApi.updateCredential(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.credentialsList() });
      queryClient.invalidateQueries({ queryKey: keys.credentialDetail(variables.id) });
    },
  });
}

export function useDeletePushCredential() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (id: string) => pushApi.deleteCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.credentialsList() });
    },
  });
}

export function useSetDefaultPushCredential() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (id: string) => pushApi.setDefaultCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.credentialsList() });
    },
  });
}

export function useValidatePushCredential() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (id: string) => pushApi.validateCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.credentialsList() });
    },
  });
}

// ============== Devices ==============

export function usePushDevices(page = 1, pageSize = 50) {
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);
  return useQuery({
    queryKey: [...keys.devicesList(), page, pageSize],
    queryFn: () => pushApi.getDevices(page, pageSize),
    enabled: !!tenantId,
  });
}

export function usePushDevice(id: string) {
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);
  return useQuery({
    queryKey: keys.deviceDetail(id),
    queryFn: () => pushApi.getDevice(id),
    enabled: !!id && !!tenantId,
  });
}

export function useRegisterPushDevice() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (data: RegisterPushDeviceRequest) => pushApi.registerDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.devicesList() });
    },
  });
}

export function useUpdatePushDevice() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePushDeviceRequest }) =>
      pushApi.updateDevice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.devicesList() });
      queryClient.invalidateQueries({ queryKey: keys.deviceDetail(variables.id) });
    },
  });
}

export function useDeletePushDevice() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (id: string) => pushApi.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.devicesList() });
    },
  });
}

// ============== Messages ==============

export function usePushMessages(page = 1, pageSize = 50) {
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);
  return useQuery({
    queryKey: [...keys.messagesList(), page, pageSize],
    queryFn: () => pushApi.getMessages(page, pageSize),
    enabled: !!tenantId,
  });
}

export function usePushMessage(id: string) {
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);
  return useQuery({
    queryKey: keys.messageDetail(id),
    queryFn: () => pushApi.getMessage(id),
    enabled: !!id && !!tenantId,
  });
}

export function useSendPushNotification() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (data: SendPushRequest) => pushApi.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.messagesList() });
    },
  });
}

export function useCancelPushMessage() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (id: string) => pushApi.cancelMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.messagesList() });
    },
  });
}

// ============== Templates ==============

export function usePushTemplates(page = 1, pageSize = 50) {
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);
  return useQuery({
    queryKey: [...keys.templatesList(), page, pageSize],
    queryFn: () => pushApi.getTemplates(page, pageSize),
    enabled: !!tenantId,
  });
}

export function usePushTemplate(id: string) {
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);
  return useQuery({
    queryKey: keys.templateDetail(id),
    queryFn: () => pushApi.getTemplate(id),
    enabled: !!id && !!tenantId,
  });
}

export function useCreatePushTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (data: CreatePushTemplateRequest) => pushApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.templatesList() });
    },
  });
}

export function useUpdatePushTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePushTemplateRequest }) =>
      pushApi.updateTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.templatesList() });
      queryClient.invalidateQueries({ queryKey: keys.templateDetail(variables.id) });
    },
  });
}

export function useDeletePushTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();
  const keys = createPushKeys(tenantId);

  return useMutation({
    mutationFn: (id: string) => pushApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.templatesList() });
    },
  });
}
