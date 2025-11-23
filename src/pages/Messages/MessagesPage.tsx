import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../hooks/useMessages';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
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
import { RefreshCw, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function MessagesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: messagesData, isLoading, refetch } = useMessages(page, pageSize);

  const getStatusBadge = (status: number, text: string) => {
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

  // Filter messages based on search and status
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
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-gray-500 mt-1">
            View and track all sent emails
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
      </div>

      {/* Messages Table */}
      {filteredMessages.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200">
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
                          <div className="text-xs text-gray-500">{message.fromName}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {message.subject || <span className="text-gray-400 italic">No subject</span>}
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
                          <div className="text-xs text-gray-500">
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
                            <div className="text-xs text-gray-500">
                              {new Date(message.sentAtUtc).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Not sent yet</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/messages/${message.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
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
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No messages found' : 'No messages yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Send your first email to see it appear here'}
          </p>
        </div>
      )}
    </div>
  );
}
