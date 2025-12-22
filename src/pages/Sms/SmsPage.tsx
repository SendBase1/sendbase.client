import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSmsMessages,
  useSendSms,
  useCancelSms,
  useSmsTemplates,
  useCreateSmsTemplate,
  useDeleteSmsTemplate,
} from '../../hooks/useSms';
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
  Plus,
  RefreshCw,
  Trash2,
  Loader2,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';

// Schemas
const sendSmsSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +12025551234)'),
  body: z.string().min(1, 'Message body is required').max(1600),
  template_id: z.string().optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  body: z.string().min(1, 'Body is required').max(1600),
});

type SendSmsFormData = z.infer<typeof sendSmsSchema>;
type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;

export function SmsPage() {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">SMS</h2>
        <p className="text-muted-foreground mt-1">
          Send transactional SMS messages (OTPs, notifications) and manage templates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="messages" className="gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
        </TabsList>

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

// ============== Messages Tab ==============
function MessagesTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useSmsMessages(page, 20);
  const sendSms = useSendSms();
  const cancelSms = useCancelSms();

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [messageToCancel, setMessageToCancel] = useState<{ id: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SendSmsFormData>({
    resolver: zodResolver(sendSmsSchema),
  });

  const handleSendSms = async (formData: SendSmsFormData) => {
    try {
      await sendSms.mutateAsync(formData);
      setIsSendModalOpen(false);
      reset();
      toast.success('SMS sent successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send SMS';
      toast.error(message);
    }
  };

  const handleCancelMessage = async () => {
    if (!messageToCancel) return;
    try {
      await cancelSms.mutateAsync(messageToCancel.id);
      toast.success('SMS cancelled');
      setMessageToCancel(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel SMS';
      toast.error(message);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        );
      case 2:
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 4:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">SMS Messages</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setIsSendModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No SMS messages yet</p>
              <p className="text-sm mt-2">Send your first SMS to get started</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To</TableHead>
                    <TableHead>Body</TableHead>
                    <TableHead>Segments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="font-mono text-sm">{msg.to_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{msg.body}</TableCell>
                      <TableCell>{msg.segment_count}</TableCell>
                      <TableCell>{getStatusBadge(msg.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(msg.requested_at_utc).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {msg.status === 4 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMessageToCancel({ id: msg.id })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {messages.length} of {data?.total || 0} messages
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={messages.length < 20}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Send SMS Modal */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send SMS</DialogTitle>
            <DialogDescription>
              Send a transactional SMS message (OTP, notification, etc.)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleSendSms)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To Phone Number *</Label>
              <Input
                id="to"
                placeholder="+12025551234"
                {...register('to')}
              />
              {errors.to && (
                <p className="text-sm text-destructive">{errors.to.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Phone number must be in E.164 format (e.g., +12025551234)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message *</Label>
              <Textarea
                id="body"
                placeholder="Enter your message..."
                rows={4}
                {...register('body')}
              />
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Max 1600 characters (10 SMS segments)
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSendModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sendSms.isPending}>
                {sendSms.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send SMS
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={!!messageToCancel}
        onOpenChange={(open) => !open && setMessageToCancel(null)}
        title="Cancel Scheduled SMS"
        description="Are you sure you want to cancel this scheduled SMS? This action cannot be undone."
        confirmText="Cancel SMS"
        onConfirm={handleCancelMessage}
        variant="danger"
      />
    </>
  );
}

// ============== Templates Tab ==============
function TemplatesTab() {
  const { data, isLoading, refetch } = useSmsTemplates();
  const createTemplate = useCreateSmsTemplate();
  const deleteTemplate = useDeleteSmsTemplate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
  });

  const handleCreateTemplate = async (formData: CreateTemplateFormData) => {
    try {
      await createTemplate.mutateAsync(formData);
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
      toast.success('Template deleted');
      setTemplateToDelete(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete template';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const templates = data?.templates || [];

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">SMS Templates</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No SMS templates yet</p>
              <p className="text-sm mt-2">Create a template to reuse SMS content</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
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
                    <TableCell className="max-w-md truncate text-muted-foreground">
                      {template.body}
                    </TableCell>
                    <TableCell>
                      {template.is_active ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(template.created_at_utc).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTemplateToDelete({ id: template.id, name: template.name })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Template Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create SMS Template</DialogTitle>
            <DialogDescription>
              Create a reusable SMS template. Use {"{{variable}}"} syntax for dynamic content.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateTemplate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                placeholder="e.g., OTP Verification"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message Body *</Label>
              <Textarea
                id="body"
                placeholder="Your verification code is {{code}}. It expires in 10 minutes."
                rows={4}
                {...register('body')}
              />
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Max 1600 characters. Use {"{{variable}}"} for dynamic content.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTemplate.isPending}>
                {createTemplate.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        title="Delete Template"
        description={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteTemplate}
        variant="danger"
      />
    </>
  );
}
