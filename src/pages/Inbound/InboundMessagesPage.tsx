import { useState } from 'react';
import { useInboundMessages, useDeleteInboundMessage } from '../../hooks/useInboundMessages';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { RefreshCw, Search, ChevronLeft, ChevronRight, Download, Trash2, Inbox, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatDate } from '../../lib/utils';
import { inboundApi } from '../../lib/api';
import type { InboundMessageResponse } from '../../lib/types';

export function InboundMessagesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<InboundMessageResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const { data: messagesData, isLoading, refetch } = useInboundMessages(page, pageSize);
  const deleteMessage = useDeleteInboundMessage();

  const filteredMessages = messagesData?.data?.filter((message) => {
    const matchesSearch = searchTerm === '' ||
      message.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.to?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  }) || [];

  const hasMore = messagesData?.has_more ?? false;
  const hasPrevPage = page > 1;

  const handleDownloadRaw = async (messageId: string) => {
    try {
      const response = await inboundApi.getRawUrl(messageId);
      window.open(response.download_url, '_blank');
    } catch (error) {
      console.error('Failed to get download URL:', error);
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    try {
      await deleteMessage.mutateAsync(messageToDelete);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
      if (selectedMessage?.id === messageToDelete) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const openDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
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
          <h2 className="text-3xl font-bold tracking-tight">Inbound Messages</h2>
          <p className="text-muted-foreground mt-1">
            View received emails on your verified domains
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by sender, recipient, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Attachments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow
                      key={message.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <TableCell>
                        <div className="font-medium max-w-[200px] truncate">
                          {message.from || <span className="text-muted-foreground italic">Unknown</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {message.to?.join(', ') || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px] truncate">
                          {message.subject || <span className="text-muted-foreground italic">No subject</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {message.attachments && message.attachments.length > 0 ? (
                          <Badge variant="outline" className="font-mono">
                            <Paperclip className="h-3 w-3 mr-1" />
                            {message.attachments.length}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadRaw(message.id);
                            }}
                            title="Download raw email"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => openDeleteDialog(message.id, e)}
                            title="Delete message"
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

          {/* Pagination */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Page {page}
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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
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
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No messages found' : 'No inbound messages yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Enable inbound email on a domain to start receiving emails'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              {selectedMessage?.subject || 'No subject'}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">From</div>
                  <div className="mt-1">{selectedMessage.from || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">To</div>
                  <div className="mt-1">{selectedMessage.to?.join(', ') || '-'}</div>
                </div>
                {selectedMessage.cc && selectedMessage.cc.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">CC</div>
                    <div className="mt-1">{selectedMessage.cc.join(', ')}</div>
                  </div>
                )}
                {selectedMessage.reply_to && selectedMessage.reply_to.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Reply-To</div>
                    <div className="mt-1">{selectedMessage.reply_to.join(', ')}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Received</div>
                  <div className="mt-1">{formatDate(selectedMessage.created_at)}</div>
                </div>
                {selectedMessage.message_id && (
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-muted-foreground">Message ID</div>
                    <div className="mt-1 font-mono text-xs break-all">{selectedMessage.message_id}</div>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Attachments</div>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{attachment.filename}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatBytes(attachment.size)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadRaw(selectedMessage.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Raw Email
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedMessage(null);
                    setMessageToDelete(selectedMessage.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This will also delete the raw email file. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMessage.isPending}
            >
              {deleteMessage.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
