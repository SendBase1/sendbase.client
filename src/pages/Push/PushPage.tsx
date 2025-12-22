import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  usePushCredentials,
  useCreatePushCredential,
  useDeletePushCredential,
  useSetDefaultPushCredential,
  useValidatePushCredential,
  usePushDevices,
  useDeletePushDevice,
  usePushMessages,
  useSendPushNotification,
  useCancelPushMessage,
  usePushTemplates,
  useCreatePushTemplate,
  useDeletePushTemplate,
} from '../../hooks/usePush';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Plus,
  RefreshCw,
  Trash2,
  Bell,
  Loader2,
  Smartphone,
  Send,
  FileText,
  Key,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';

// Schemas
const createCredentialSchema = z.object({
  platform: z.number().min(0).max(1),
  name: z.string().min(1, 'Name is required').max(100),
  application_id: z.string().min(1, 'Application ID is required').max(255),
  credentials: z.string().min(1, 'Credentials are required'),
  key_id: z.string().optional(),
  team_id: z.string().optional(),
});

const sendPushSchema = z.object({
  credential_id: z.string().optional(),
  device_token_id: z.string().optional(),
  external_user_id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required').max(1000),
});

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required').max(1000),
});

type CreateCredentialFormData = z.infer<typeof createCredentialSchema>;
type SendPushFormData = z.infer<typeof sendPushSchema>;
type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;

export function PushPage() {
  const [activeTab, setActiveTab] = useState('credentials');

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Push Notifications</h2>
        <p className="text-muted-foreground mt-1">
          Manage push notification credentials, devices, and send notifications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="credentials" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Credentials</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Devices</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="mt-6">
          <CredentialsTab />
        </TabsContent>

        <TabsContent value="devices" className="mt-6">
          <DevicesTab />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <MessagesTab />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============== Credentials Tab ==============
function CredentialsTab() {
  const { data, isLoading } = usePushCredentials();
  const createCredential = useCreatePushCredential();
  const deleteCredential = useDeletePushCredential();
  const setDefaultCredential = useSetDefaultPushCredential();
  const validateCredential = useValidatePushCredential();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<{ id: string; name: string } | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCredentialFormData>({
    resolver: zodResolver(createCredentialSchema),
    defaultValues: {
      platform: 0,
      name: '',
      application_id: '',
      credentials: '',
    },
  });

  const platform = watch('platform');

  const handleCreateCredential = async (data: CreateCredentialFormData) => {
    try {
      await createCredential.mutateAsync(data);
      setIsCreateModalOpen(false);
      reset();
      toast.success('Credential created successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create credential';
      toast.error(message);
    }
  };

  const handleDeleteCredential = async () => {
    if (!credentialToDelete) return;
    try {
      await deleteCredential.mutateAsync(credentialToDelete.id);
      toast.success('Credential deleted successfully');
      setCredentialToDelete(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete credential';
      toast.error(message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultCredential.mutateAsync(id);
      toast.success('Default credential updated');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to set default';
      toast.error(message);
    }
  };

  const handleValidate = async (id: string) => {
    setValidatingId(id);
    try {
      const result = await validateCredential.mutateAsync(id);
      if (result.is_valid) {
        toast.success('Credential is valid');
      } else {
        toast.error(result.message || 'Credential validation failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to validate';
      toast.error(message);
    } finally {
      setValidatingId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = btoa(reader.result as string);
      setValue('credentials', base64);
    };
    reader.readAsText(file);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 2:
        return <Badge variant="destructive">Invalid</Badge>;
      case 3:
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const credentials = data?.credentials || [];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Push Credentials</h3>
          <p className="text-sm text-muted-foreground">APNs and FCM credentials for sending push notifications</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Credential
        </Button>
      </div>

      {credentials.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((credential) => (
                    <TableRow key={credential.id}>
                      <TableCell className="font-medium">{credential.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{credential.platform_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {credential.application_id}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(credential.status)}</TableCell>
                      <TableCell>
                        {credential.is_default ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(credential.id)}
                          >
                            Set Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(credential.created_at_utc).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleValidate(credential.id)}
                            disabled={validatingId === credential.id}
                            title="Validate credential"
                          >
                            {validatingId === credential.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCredentialToDelete({ id: credential.id, name: credential.name })}
                            title="Delete credential"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No credentials configured</h3>
            <p className="text-muted-foreground mb-4">
              Add APNs or FCM credentials to start sending push notifications.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Credential Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Push Credential</DialogTitle>
            <DialogDescription>
              Configure APNs or FCM credentials for push notifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateCredential)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={platform.toString()}
                onValueChange={(v) => setValue('platform', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">APNs (iOS)</SelectItem>
                  <SelectItem value="1">FCM (Android)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production iOS"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_id">
                {platform === 0 ? 'Bundle ID' : 'Project ID'}
              </Label>
              <Input
                id="application_id"
                placeholder={platform === 0 ? 'com.example.app' : 'my-project-id'}
                {...register('application_id')}
              />
              {errors.application_id && (
                <p className="text-sm text-destructive">{errors.application_id.message}</p>
              )}
            </div>

            {platform === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="key_id">Key ID</Label>
                  <Input
                    id="key_id"
                    placeholder="ABC123DEFG"
                    {...register('key_id')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_id">Team ID</Label>
                  <Input
                    id="team_id"
                    placeholder="TEAM123456"
                    {...register('team_id')}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>
                {platform === 0 ? 'Private Key (.p8)' : 'Service Account JSON'}
              </Label>
              <Input
                type="file"
                accept={platform === 0 ? '.p8' : '.json'}
                onChange={handleFileUpload}
              />
              {errors.credentials && (
                <p className="text-sm text-destructive">{errors.credentials.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {platform === 0
                  ? 'Upload your APNs .p8 private key file from Apple Developer Portal'
                  : 'Upload your Firebase service account JSON file'}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                }}
                disabled={createCredential.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCredential.isPending}>
                {createCredential.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Credential'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!credentialToDelete}
        onOpenChange={(open) => !open && setCredentialToDelete(null)}
        title="Delete Credential"
        description="This will permanently delete this push credential. Any devices using this credential will no longer receive notifications."
        confirmText={credentialToDelete?.name || ''}
        confirmLabel="Type the credential name to confirm"
        onConfirm={handleDeleteCredential}
        isLoading={deleteCredential.isPending}
        variant="danger"
      />
    </>
  );
}

// ============== Devices Tab ==============
function DevicesTab() {
  const { data, isLoading } = usePushDevices();
  const deleteDevice = useDeletePushDevice();
  const [deviceToDelete, setDeviceToDelete] = useState<{ id: string; token: string } | null>(null);

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;
    try {
      await deleteDevice.mutateAsync(deviceToDelete.id);
      toast.success('Device removed successfully');
      setDeviceToDelete(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove device';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const devices = data?.devices || [];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Registered Devices</h3>
          <p className="text-sm text-muted-foreground">
            Device tokens registered via your API for push notifications
          </p>
        </div>
      </div>

      {devices.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>External User ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {device.token.substring(0, 20)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{device.platform_name}</Badge>
                      </TableCell>
                      <TableCell>{device.external_user_id || '-'}</TableCell>
                      <TableCell>
                        {device.is_active ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {device.last_seen_at_utc
                          ? new Date(device.last_seen_at_utc).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeviceToDelete({ id: device.id, token: device.token })}
                            title="Remove device"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No devices registered</h3>
            <p className="text-muted-foreground mb-4">
              Devices will appear here when registered via your API using the device registration endpoint.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deviceToDelete}
        onOpenChange={(open) => !open && setDeviceToDelete(null)}
        title="Remove Device"
        description="This will remove this device from your push notification registry. The device will no longer receive notifications."
        confirmText="remove"
        confirmLabel="Type 'remove' to confirm"
        onConfirm={handleDeleteDevice}
        isLoading={deleteDevice.isPending}
        variant="danger"
      />
    </>
  );
}

// ============== Messages Tab ==============
function MessagesTab() {
  const { data: credentialsData } = usePushCredentials();
  const { data: devicesData } = usePushDevices();
  const { data: messagesData, isLoading } = usePushMessages();
  const sendPush = useSendPushNotification();
  const cancelMessage = useCancelPushMessage();

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SendPushFormData>({
    resolver: zodResolver(sendPushSchema),
    defaultValues: {
      title: '',
      body: '',
    },
  });

  const handleSendPush = async (data: SendPushFormData) => {
    try {
      await sendPush.mutateAsync(data);
      setIsSendModalOpen(false);
      reset();
      toast.success('Push notification sent successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send notification';
      toast.error(message);
    }
  };

  const handleCancelMessage = async (id: string) => {
    try {
      await cancelMessage.mutateAsync(id);
      toast.success('Message cancelled');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel message';
      toast.error(message);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 2:
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 3:
        return <Badge variant="default" className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 4:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Queued</Badge>;
    }
  };

  const credentials = credentialsData?.credentials || [];
  const devices = devicesData?.devices || [];
  const messages = messagesData?.messages || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Push Messages</h3>
          <p className="text-sm text-muted-foreground">Send and track push notifications</p>
        </div>
        <Button
          onClick={() => setIsSendModalOpen(true)}
          disabled={credentials.length === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {credentials.length === 0 && (
        <Card className="mb-4 border-yellow-500 bg-yellow-500/10">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Add push credentials before sending notifications.
            </p>
          </CardContent>
        </Card>
      )}

      {messages.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Body</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {message.title}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {message.body}
                      </TableCell>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell>
                        {message.target_count} device{message.target_count !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell>
                        {message.sent_at_utc
                          ? new Date(message.sent_at_utc).toLocaleString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          {message.status === 4 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelMessage(message.id)}
                              title="Cancel scheduled message"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No messages sent</h3>
            <p className="text-muted-foreground mb-4">
              Send your first push notification to see message history here.
            </p>
            {credentials.length > 0 && (
              <Button onClick={() => setIsSendModalOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Send Push Modal */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Push Notification</DialogTitle>
            <DialogDescription>
              Send a push notification to a device or user.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleSendPush)} className="space-y-4 py-4">
            {credentials.length > 1 && (
              <div className="space-y-2">
                <Label>Credential</Label>
                <Select
                  onValueChange={(v) => setValue('credential_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Use default credential" />
                  </SelectTrigger>
                  <SelectContent>
                    {credentials.map((cred) => (
                      <SelectItem key={cred.id} value={cred.id}>
                        {cred.name} ({cred.platform_name})
                        {cred.is_default && ' (Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {devices.length > 0 && (
              <div className="space-y-2">
                <Label>Target Device</Label>
                <Select
                  onValueChange={(v) => setValue('device_token_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.external_user_id || device.token.substring(0, 20) + '...'} ({device.platform_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Or use the API to send to external_user_id
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                placeholder="Notification message..."
                rows={3}
                {...register('body')}
              />
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSendModalOpen(false);
                  reset();
                }}
                disabled={sendPush.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sendPush.isPending}>
                {sendPush.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============== Templates Tab ==============
function TemplatesTab() {
  const { data, isLoading } = usePushTemplates();
  const createTemplate = useCreatePushTemplate();
  const deleteTemplate = useDeletePushTemplate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: '',
      title: '',
      body: '',
    },
  });

  const handleCreateTemplate = async (data: CreateTemplateFormData) => {
    try {
      await createTemplate.mutateAsync(data);
      setIsCreateModalOpen(false);
      reset();
      toast.success('Template created successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create template';
      toast.error(message);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate.mutateAsync(templateToDelete.id);
      toast.success('Template deleted successfully');
      setTemplateToDelete(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete template';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const templates = data?.templates || [];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Push Templates</h3>
          <p className="text-sm text-muted-foreground">
            Reusable templates for push notifications with {'{{variable}}'} support
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      {templates.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Body</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{template.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{template.body}</TableCell>
                      <TableCell>
                        {template.is_active ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(template.created_at_utc).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTemplateToDelete({ id: template.id, name: template.name })}
                            title="Delete template"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates created</h3>
            <p className="text-muted-foreground mb-4">
              Create reusable templates for your push notifications.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Template Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Push Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for push notifications. Use {'{{variable}}'} syntax for dynamic content.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateTemplate)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Order Confirmation"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                placeholder="e.g., Order {{order_id}} confirmed"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Notification Body</Label>
              <Textarea
                id="body"
                placeholder="e.g., Hi {{name}}, your order is on its way!"
                rows={3}
                {...register('body')}
              />
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                }}
                disabled={createTemplate.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTemplate.isPending}>
                {createTemplate.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Template'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        title="Delete Template"
        description="This will permanently delete this push notification template."
        confirmText={templateToDelete?.name || ''}
        confirmLabel="Type the template name to confirm"
        onConfirm={handleDeleteTemplate}
        isLoading={deleteTemplate.isPending}
        variant="danger"
      />
    </>
  );
}
