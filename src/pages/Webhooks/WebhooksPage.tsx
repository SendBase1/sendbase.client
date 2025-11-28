import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  useWebhooks,
  useWebhookEventTypes,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
} from '../../hooks/useWebhooks';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
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
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Plus,
  RefreshCw,
  Trash2,
  Webhook,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Play,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import type { WebhookEndpointResponse } from '../../lib/types';

const createWebhookSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  url: z.string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine((url) => url.startsWith('https://'), 'URL must use HTTPS'),
  event_types: z.array(z.string()).min(1, 'At least one event type is required'),
});

type CreateWebhookFormData = z.infer<typeof createWebhookSchema>;

export function WebhooksPage() {
  const { data: webhooks, isLoading } = useWebhooks();
  const { data: eventTypes } = useWebhookEventTypes();
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<{ id: string; name: string } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateWebhookFormData>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: {
      name: '',
      url: '',
      event_types: [],
    },
  });

  const selectedEventTypes = watch('event_types');

  const handleCreateWebhook = async (data: CreateWebhookFormData) => {
    try {
      const result = await createWebhook.mutateAsync(data);
      setCreatedSecret(result.secret);
      setIsCreateModalOpen(false);
      setIsSecretModalOpen(true);
      reset();
      toast.success('Webhook created successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create webhook';
      toast.error(message);
    }
  };

  const handleToggleEnabled = async (webhook: WebhookEndpointResponse) => {
    try {
      await updateWebhook.mutateAsync({
        id: webhook.id,
        data: { enabled: !webhook.enabled },
      });
      toast.success(`Webhook ${webhook.enabled ? 'disabled' : 'enabled'}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update webhook';
      toast.error(message);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;

    try {
      await deleteWebhook.mutateAsync(webhookToDelete.id);
      toast.success('Webhook deleted successfully');
      setWebhookToDelete(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete webhook';
      toast.error(message);
    }
  };

  const handleTestWebhook = async (id: string) => {
    setTestingId(id);
    try {
      const result = await testWebhook.mutateAsync(id);
      if (result.success) {
        toast.success('Test webhook sent successfully');
      } else {
        toast.error(`Test failed: ${result.message}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to test webhook';
      toast.error(message);
    } finally {
      setTestingId(null);
    }
  };

  const handleCopySecret = async () => {
    if (createdSecret) {
      await navigator.clipboard.writeText(createdSecret);
      setCopied(true);
      toast.success('Secret copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleEventType = (eventType: string) => {
    const current = selectedEventTypes || [];
    if (current.includes(eventType)) {
      setValue('event_types', current.filter((t) => t !== eventType));
    } else {
      setValue('event_types', [...current, eventType]);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Webhooks</h2>
          <p className="text-muted-foreground mt-1">
            Receive real-time notifications for email events
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Webhooks Table */}
      {webhooks && webhooks.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-medium">{webhook.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {truncateUrl(webhook.url)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {webhook.event_types.slice(0, 3).map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type.replace('email.', '')}
                          </Badge>
                        ))}
                        {webhook.event_types.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{webhook.event_types.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={webhook.enabled}
                        onCheckedChange={() => handleToggleEnabled(webhook)}
                        disabled={updateWebhook.isPending}
                      />
                    </TableCell>
                    <TableCell>{formatDate(webhook.created_at_utc)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTestWebhook(webhook.id)}
                          disabled={testingId === webhook.id || !webhook.enabled}
                          title="Send test webhook"
                        >
                          {testingId === webhook.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="View details"
                        >
                          <Link to={`/webhooks/${webhook.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setWebhookToDelete({ id: webhook.id, name: webhook.name })}
                          disabled={deleteWebhook.isPending}
                          title="Delete webhook"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
            <p className="text-muted-foreground mb-4">
              Set up webhooks to receive real-time notifications when emails are delivered, bounced, or opened.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Webhook Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              Configure a webhook endpoint to receive email event notifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateWebhook)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production Webhook"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Endpoint URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/webhook"
                {...register('url')}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be a valid HTTPS URL that can receive POST requests
              </p>
            </div>

            <div className="space-y-3">
              <Label>Events to receive</Label>
              <div className="grid gap-2">
                {eventTypes?.map((eventType) => (
                  <div
                    key={eventType.name}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEventTypes?.includes(eventType.name)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                    onClick={() => toggleEventType(eventType.name)}
                  >
                    <div>
                      <code className="text-sm font-medium">{eventType.name}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {eventType.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedEventTypes?.includes(eventType.name)
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/50'
                      }`}
                    >
                      {selectedEventTypes?.includes(eventType.name) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.event_types && (
                <p className="text-sm text-destructive">{errors.event_types.message}</p>
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
                disabled={createWebhook.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createWebhook.isPending}>
                {createWebhook.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Webhook'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Secret Modal */}
      <Dialog open={isSecretModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsSecretModalOpen(false);
          setCreatedSecret(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Webhook Created
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive" className="border-yellow-500 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                Save your signing secret now. You won't be able to see it again!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Signing Secret</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={createdSecret || ''}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopySecret}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this secret to verify webhook signatures. See our{' '}
                <a href="#" className="underline inline-flex items-center gap-1">
                  documentation <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setIsSecretModalOpen(false);
              setCreatedSecret(null);
            }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!webhookToDelete}
        onOpenChange={(open) => !open && setWebhookToDelete(null)}
        title="Delete Webhook"
        description="This will permanently delete this webhook endpoint. You will no longer receive notifications for any events."
        confirmText={webhookToDelete?.name || ''}
        confirmLabel="Type the webhook name to confirm"
        onConfirm={handleDeleteWebhook}
        isLoading={deleteWebhook.isPending}
        variant="danger"
      />
    </div>
  );
}
