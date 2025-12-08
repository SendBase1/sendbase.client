import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '../../hooks/useTemplates';
import { Button } from '../../components/ui/button';
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
import { Plus, RefreshCw, Trash2, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import type { TemplateListResponse } from '../../lib/types';

const templateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  subject: z.string()
    .max(998, 'Subject must be less than 998 characters')
    .optional(),
  html_body: z.string().optional(),
  text_body: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export function TemplatesPage() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TemplateListResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      subject: '',
      html_body: '',
      text_body: '',
    },
  });

  const handleAddTemplate = async (data: TemplateFormData) => {
    try {
      const result = await createTemplate.mutateAsync(data);
      setIsAddModalOpen(false);
      reset();
      toast.success('Template created successfully!');
      navigate(`/templates/${result.id}`);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create template';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate.mutateAsync(templateToDelete.id);
      toast.success('Template deleted successfully');
      setTemplateToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template');
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable email templates
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Table */}
      {templates && templates.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {template.subject || <span className="text-muted-foreground">No subject</span>}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        v{template.version}
                      </code>
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at_utc).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/templates/${template.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTemplateToDelete(template)}
                        disabled={deleteTemplate.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first email template to get started
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Template Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template. Use {'{{variable_name}}'} syntax for dynamic content.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleAddTemplate)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="Welcome Email"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Welcome to {{company_name}}, {{first_name}}!"
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use {'{{variable_name}}'} for dynamic content
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="html_body">HTML Body</Label>
              <Textarea
                id="html_body"
                placeholder="<h1>Welcome, {{first_name}}!</h1><p>Thanks for joining us.</p>"
                rows={6}
                {...register('html_body')}
              />
              {errors.html_body && (
                <p className="text-sm text-destructive">{errors.html_body.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_body">Plain Text Body (Optional)</Label>
              <Textarea
                id="text_body"
                placeholder="Welcome, {{first_name}}! Thanks for joining us."
                rows={4}
                {...register('text_body')}
              />
              {errors.text_body && (
                <p className="text-sm text-destructive">{errors.text_body.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  reset();
                }}
                disabled={createTemplate.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTemplate.isPending}
              >
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
        open={templateToDelete !== null}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        title="Delete Template"
        description="This will permanently delete this template. This action cannot be undone."
        confirmText={templateToDelete?.name ?? ''}
        confirmLabel="Type the template name to confirm"
        onConfirm={handleDeleteTemplate}
        isLoading={deleteTemplate.isPending}
        variant="danger"
      />
    </div>
  );
}
