import { useParams, useNavigate } from 'react-router-dom';
import { useSmsMessage, useCancelSms } from '../../hooks/useSms';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, Clock, RefreshCw, XCircle, MessageSquare, Phone, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatDate, parseUtcDate } from '../../lib/utils';
import { getSmsStatusStyle, formatPhoneDisplay } from '../../lib/smsUtils';
import { toast } from 'sonner';

export function SmsMessageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: message, isLoading, refetch } = useSmsMessage(id || '');
  const cancelSms = useCancelSms();

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelSms.mutateAsync(id);
      toast.success('SMS cancelled successfully');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel SMS';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="text-center py-16">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Message not found</h3>
          <p className="text-muted-foreground mb-4">
            The SMS message you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/sms/messages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  const isScheduled = message.status === 4;
  const isFailed = message.status === 2;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/sms/messages')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Message Details</h2>
            <p className="text-muted-foreground mt-1">
              View SMS message information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isScheduled && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelSms.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {cancelSms.isPending ? 'Cancelling...' : 'Cancel'}
            </Button>
          )}
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{message.body}</p>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{message.body.length} characters</span>
                <Badge variant="outline">{message.segment_count} segment{message.segment_count !== 1 ? 's' : ''}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Error Details (if failed) */}
          {isFailed && message.error && (
            <Card className="border-red-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-400">{message.error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className={`text-lg px-3 py-1 ${getSmsStatusStyle(message.status_text)}`}>
                {message.status_text}
              </Badge>
            </CardContent>
          </Card>

          {/* From/To */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="font-medium">{formatPhoneDisplay(message.from_number)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <p className="font-medium">{formatPhoneDisplay(message.to_number)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Requested</p>
                <p className="font-medium">{formatDate(message.requested_at_utc)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseUtcDate(message.requested_at_utc), { addSuffix: true })}
                </p>
              </div>

              {message.scheduled_at_utc && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Scheduled For</p>
                  <p className="font-medium">{formatDate(message.scheduled_at_utc)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(parseUtcDate(message.scheduled_at_utc), { addSuffix: true })}
                  </p>
                </div>
              )}

              {message.sent_at_utc && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sent</p>
                  <p className="font-medium">{formatDate(message.sent_at_utc)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(parseUtcDate(message.sent_at_utc), { addSuffix: true })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message ID</p>
                <p className="font-mono text-xs break-all">{message.id}</p>
              </div>
              {message.aws_message_id && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">AWS Message ID</p>
                  <p className="font-mono text-xs break-all">{message.aws_message_id}</p>
                </div>
              )}
              {message.template_id && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Template ID</p>
                  <p className="font-mono text-xs break-all">{message.template_id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
