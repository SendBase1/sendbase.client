import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useWebhook,
  useWebhookDeliveries,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
} from '../../hooks/useWebhooks';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';

export function WebhookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: webhook, isLoading: webhookLoading } = useWebhook(id || '');
  const { data: deliveries, isLoading: deliveriesLoading } = useWebhookDeliveries(id || '');
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleToggleEnabled = async () => {
    if (!webhook) return;

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

  const handleDelete = async () => {
    if (!webhook) return;

    try {
      await deleteWebhook.mutateAsync(webhook.id);
      toast.success('Webhook deleted successfully');
      navigate('/webhooks');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete webhook';
      toast.error(message);
    }
  };

  const handleTest = async () => {
    if (!webhook) return;

    setIsTesting(true);
    try {
      const result = await testWebhook.mutateAsync(webhook.id);
      if (result.success) {
        toast.success('Test webhook sent successfully');
      } else {
        toast.error(`Test failed: ${result.message}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to test webhook';
      toast.error(message);
    } finally {
      setIsTesting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: // Pending
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 1: // Sent
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 2: // Retry
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      case 3: // Failed
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 0: return 'secondary';
      case 1: return 'default';
      case 2: return 'outline';
      case 3: return 'destructive';
      default: return 'secondary';
    }
  };

  if (webhookLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!webhook) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Webhook not found</h2>
          <p className="text-muted-foreground mt-2">
            The webhook you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/webhooks')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Webhooks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/webhooks')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{webhook.name}</h2>
            <p className="text-muted-foreground mt-1">{webhook.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || !webhook.enabled}
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Send Test
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleting(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Webhook Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Webhook endpoint settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={webhook.enabled}
                  onCheckedChange={handleToggleEnabled}
                  disabled={updateWebhook.isPending}
                />
                <span className={webhook.enabled ? 'text-green-500' : 'text-muted-foreground'}>
                  {webhook.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground">Signing Secret</Label>
              <p className="text-sm mt-1">
                <code className="bg-muted px-2 py-1 rounded">{webhook.secret_preview}</code>
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="text-sm mt-1">{formatDate(webhook.created_at_utc)}</p>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground">Subscribed Events</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {webhook.event_types.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
            <CardDescription>History of webhook delivery attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {deliveriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : deliveries && deliveries.length > 0 ? (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Last Attempt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <Badge variant="outline">{delivery.event_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(delivery.status)}
                          <Badge variant={getStatusBadgeVariant(delivery.status)}>
                            {delivery.status_text}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.response_status_code ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {delivery.response_status_code}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{delivery.attempt_count}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {delivery.last_attempt_utc
                          ? formatRelativeDate(delivery.last_attempt_utc)
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No deliveries yet</p>
                <p className="text-sm mt-1">
                  Deliveries will appear here when events are triggered
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title="Delete Webhook"
        description="This will permanently delete this webhook endpoint. You will no longer receive notifications for any events."
        confirmText={webhook.name}
        confirmLabel="Type the webhook name to confirm"
        onConfirm={handleDelete}
        isLoading={deleteWebhook.isPending}
        variant="danger"
      />
    </div>
  );
}
