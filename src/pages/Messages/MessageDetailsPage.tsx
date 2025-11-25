import { useParams, useNavigate } from 'react-router-dom';
import { useMessage } from '../../hooks/useMessages';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { ArrowLeft, RefreshCw, AlertCircle, Clock, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function MessageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: message, isLoading } = useMessage(id!);

  const getStatusBadge = (_status: number, text: string) => {
    const variants: Record<string, any> = {
      Sent: 'default',
      Delivered: 'default',
      Pending: 'secondary',
      Failed: 'destructive',
      Bounced: 'destructive',
      Complained: 'destructive',
    };
    return (
      <Badge variant={variants[text] || 'secondary'}>
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
      Send: 'text-blue-600',
      Delivery: 'text-green-600',
      Bounce: 'text-red-600',
      Complaint: 'text-orange-600',
      Open: 'text-purple-600',
      Click: 'text-indigo-600',
      Reject: 'text-red-600',
    };
    return colors[eventType] || 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/messages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Message not found</h3>
          <p className="text-gray-500">
            The message you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <p className="text-gray-500 mt-1">
              Message ID: {message.id}
            </p>
          </div>
        </div>
        {getStatusBadge(message.status, message.statusText)}
      </div>

      {/* Message Details */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Message Details</h3>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">From</dt>
              <dd className="text-sm">
                {message.fromName && <div className="font-medium">{message.fromName}</div>}
                <div className={message.fromName ? 'text-gray-600' : 'font-medium'}>
                  {message.fromEmail}
                </div>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Status</dt>
              <dd className="text-sm">
                {getStatusBadge(message.status, message.statusText)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Requested At</dt>
              <dd className="text-sm">
                {new Date(message.requestedAtUtc).toLocaleString()}
                <span className="text-gray-500 ml-2">
                  ({formatDistanceToNow(new Date(message.requestedAtUtc), { addSuffix: true })})
                </span>
              </dd>
            </div>

            {message.sentAtUtc && (
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Sent At</dt>
                <dd className="text-sm">
                  {new Date(message.sentAtUtc).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    ({formatDistanceToNow(new Date(message.sentAtUtc), { addSuffix: true })})
                  </span>
                </dd>
              </div>
            )}

            {message.sesMessageId && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 mb-1">SES Message ID</dt>
                <dd className="text-xs font-mono bg-gray-50 px-3 py-2 rounded break-all">
                  {message.sesMessageId}
                </dd>
              </div>
            )}

            {message.error && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-red-600 mb-1">Error</dt>
                <dd className="text-sm bg-red-50 border border-red-200 px-3 py-2 rounded text-red-800">
                  {message.error}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Tags */}
        {message.tags && Object.keys(message.tags).length > 0 && (
          <>
            <Separator />
            <div className="p-6">
              <h4 className="text-sm font-semibold mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(message.tags).map(([key, value]) => (
                  <Badge key={key} variant="outline">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recipients */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recipients ({message.recipients.length})</h3>
        </div>

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
                  <Badge variant="outline">{recipient.kindText}</Badge>
                </TableCell>
                <TableCell className="font-medium">{recipient.email}</TableCell>
                <TableCell>{recipient.name || '-'}</TableCell>
                <TableCell>
                  {getStatusBadge(recipient.deliveryStatus, recipient.deliveryStatusText)}
                </TableCell>
                <TableCell>
                  {recipient.sesDeliveryId ? (
                    <code className="text-xs bg-gray-50 px-2 py-1 rounded">
                      {recipient.sesDeliveryId}
                    </code>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Event Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Event Timeline</h3>
          <p className="text-sm text-gray-500 mt-1">
            Chronological history of all events for this message
          </p>
        </div>

        {message.events && message.events.length > 0 ? (
          <div className="p-6">
            <div className="space-y-4">
              {message.events
                .sort((a, b) => new Date(b.occurredAtUtc).getTime() - new Date(a.occurredAtUtc).getTime())
                .map((event) => (
                  <div key={event.id} className="flex gap-4">
                    <div className={`flex-shrink-0 ${getEventColor(event.eventType)}`}>
                      {getEventIcon(event.eventType)}
                    </div>

                    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{event.eventType}</div>
                          {event.recipient && (
                            <div className="text-sm text-gray-600 mt-1">
                              Recipient: {event.recipient}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          <div>{new Date(event.occurredAtUtc).toLocaleString()}</div>
                          <div className="text-xs">
                            {formatDistanceToNow(new Date(event.occurredAtUtc), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="font-semibold mb-2">No events yet</h4>
            <p className="text-sm text-gray-500">
              Events will appear here as they occur (sends, deliveries, bounces, etc.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
