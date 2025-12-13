import { useParams, useNavigate } from 'react-router-dom';
import { useMessage } from '../../hooks/useMessages';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { ArrowLeft, RefreshCw, AlertCircle, Clock, CheckCircle2, XCircle, Mail, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatDateTime, getTimezoneAbbreviation, parseUtcDate } from '../../lib/utils';

export function MessageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: message, isLoading } = useMessage(id!);

  const getStatusBadge = (_status: number, text: string) => {
    const styles: Record<string, string> = {
      Sent: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
      Delivered: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
      Pending: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
      Queued: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
      Scheduled: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
      Failed: 'bg-red-500/15 text-red-400 border-red-500/20',
      Bounced: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
      Complained: 'bg-red-500/15 text-red-400 border-red-500/20',
    };
    return (
      <Badge variant="outline" className={styles[text] || 'bg-muted text-muted-foreground'}>
        {text}
      </Badge>
    );
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, any> = {
      Send: Mail,
      Delivery: CheckCircle2,
      Bounce: XCircle,
      Complaint: AlertCircle,
      Open: Mail,
      Click: Mail,
      Reject: XCircle,
    };
    const Icon = icons[eventType] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      Send: 'text-blue-500',
      Delivery: 'text-emerald-500',
      Bounce: 'text-red-400',
      Complaint: 'text-orange-400',
      Open: 'text-purple-500',
      Click: 'text-indigo-500',
      Reject: 'text-red-400',
    };
    return colors[eventType] || 'text-muted-foreground';
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
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/messages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Message not found</h3>
            <p className="text-muted-foreground">
              The message you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/messages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {message.subject || 'No Subject'}
            </h2>
            <p className="text-muted-foreground mt-1">
              Message ID: {message.id}
            </p>
          </div>
        </div>
        {getStatusBadge(message.status, message.status_text)}
      </div>

      {/* Message Details */}
      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">From</dt>
              <dd className="text-sm">
                {message.from_name && <div className="font-medium">{message.from_name}</div>}
                <div className={message.from_name ? 'text-muted-foreground' : 'font-medium'}>
                  {message.from_email}
                </div>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Status</dt>
              <dd className="text-sm">
                {getStatusBadge(message.status, message.status_text)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Requested At</dt>
              <dd className="text-sm">
                {formatDateTime(message.requested_at_utc)}
                <span className="text-muted-foreground ml-1">({getTimezoneAbbreviation()})</span>
                <span className="text-muted-foreground ml-2">
                  ({formatDistanceToNow(parseUtcDate(message.requested_at_utc), { addSuffix: true })})
                </span>
              </dd>
            </div>

            {message.scheduled_at_utc && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Scheduled For
                </dt>
                <dd className="text-sm">
                  {formatDateTime(message.scheduled_at_utc)}
                  <span className="text-muted-foreground ml-1">({getTimezoneAbbreviation()})</span>
                  <span className="text-muted-foreground ml-2">
                    ({formatDistanceToNow(parseUtcDate(message.scheduled_at_utc), { addSuffix: true })})
                  </span>
                </dd>
              </div>
            )}

            {message.sent_at_utc && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Sent At</dt>
                <dd className="text-sm">
                  {formatDateTime(message.sent_at_utc)}
                  <span className="text-muted-foreground ml-1">({getTimezoneAbbreviation()})</span>
                  <span className="text-muted-foreground ml-2">
                    ({formatDistanceToNow(parseUtcDate(message.sent_at_utc), { addSuffix: true })})
                  </span>
                </dd>
              </div>
            )}

            {message.ses_message_id && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground mb-1">SES Message ID</dt>
                <dd className="text-xs font-mono bg-muted px-3 py-2 rounded break-all">
                  {message.ses_message_id}
                </dd>
              </div>
            )}

            {message.error && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-red-400 mb-1">Error</dt>
                <dd className="text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded text-red-400">
                  {message.error}
                </dd>
              </div>
            )}
          </dl>

          {/* Tags */}
          {message.tags && Object.keys(message.tags).length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-semibold mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(message.tags).map(([key, value]) => (
                  <Badge key={key} variant="outline">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle>Recipients ({message.recipients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Delivery Status</TableHead>
                <TableHead>SES Delivery ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {message.recipients.map((recipient) => (
                <TableRow key={recipient.id}>
                  <TableCell>
                    <Badge variant="outline">{recipient.kind_text}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{recipient.email}</TableCell>
                  <TableCell>{recipient.name || '-'}</TableCell>
                  <TableCell>
                    {getStatusBadge(recipient.delivery_status, recipient.delivery_status_text)}
                  </TableCell>
                  <TableCell>
                    {recipient.ses_delivery_id ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {recipient.ses_delivery_id}
                      </code>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Event Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Event Timeline</CardTitle>
          <CardDescription>
            Chronological history of all events for this message
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message.events && message.events.length > 0 ? (
            <div className="space-y-4">
              {message.events
                .sort((a, b) => new Date(b.occurred_at_utc).getTime() - new Date(a.occurred_at_utc).getTime())
                .map((event) => (
                  <div key={event.id} className="flex gap-4">
                    <div className={`flex-shrink-0 ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                    </div>

                    <div className="flex-1 pb-4 border-b border-border last:border-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{event.event_type}</div>
                          {event.recipient && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Recipient: {event.recipient}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          <div>{formatDateTime(event.occurred_at_utc)}</div>
                          <div className="text-xs">
                            {formatDistanceToNow(parseUtcDate(event.occurred_at_utc), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-semibold mb-2">No events yet</h4>
              <p className="text-sm text-muted-foreground">
                Events will appear here as they occur (sends, deliveries, bounces, etc.)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
