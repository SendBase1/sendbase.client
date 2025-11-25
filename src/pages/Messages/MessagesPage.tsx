import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../hooks/useMessages';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { RefreshCw, Search, ChevronLeft, ChevronRight, ExternalLink, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function MessagesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: messagesData, isLoading, refetch } = useMessages(page, pageSize);

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

  const filteredMessages = messagesData?.items?.filter((message) => {
    const matchesSearch = searchTerm === '' ||
      message.fromEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipients.some(r => r.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || message.statusText === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const totalPages = messagesData ? Math.ceil(messagesData.totalCount / pageSize) : 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

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
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground mt-1">
            View and track all sent emails
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, subject, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Bounced">Bounced</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Complained">Complained</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      {filteredMessages.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.fromEmail}</div>
                          {message.fromName && (
                            <div className="text-xs text-muted-foreground">{message.fromName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {message.subject || <span className="text-muted-foreground italic">No subject</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {message.recipients.slice(0, 2).map((recipient, idx) => (
                            <div key={idx} className="text-sm">
                              {recipient.email}
                              {recipient.deliveryStatus !== 0 && (
                                <span className="ml-2">
                                  {getStatusBadge(recipient.deliveryStatus, recipient.deliveryStatusText)}
                                </span>
                              )}
                            </div>
                          ))}
                          {message.recipients.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{message.recipients.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(message.status, message.statusText)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {message.sentAtUtc ? (
                            <>
                              <div>{formatDistanceToNow(new Date(message.sentAtUtc), { addSuffix: true })}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(message.sentAtUtc).toLocaleDateString()}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">Not sent yet</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/messages/${message.id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, messagesData?.totalCount || 0)} of {messagesData?.totalCount || 0} messages
                </div>
                <Select value={pageSize.toString()} onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-3">
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No messages found' : 'No messages yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Send your first email to see it appear here'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
