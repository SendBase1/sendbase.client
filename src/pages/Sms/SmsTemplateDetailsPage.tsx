import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSmsTemplate, useUpdateSmsTemplate, useDeleteSmsTemplate } from '../../hooks/useSmsTemplates';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { ArrowLeft, Save, RefreshCw, Trash2, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatDate, parseUtcDate } from '../../lib/utils';
import { toast } from 'sonner';
import { countSmsSegments, extractTemplateVariables, renderTemplate } from '../../lib/smsUtils';

const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  body: z.string().min(1, 'Body is required').max(1600, 'Body cannot exceed 1600 characters'),
  is_active: z.boolean(),
});

type UpdateTemplateFormData = z.infer<typeof updateTemplateSchema>;

export function SmsTemplateDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: template, isLoading, refetch } = useSmsTemplate(id || '');
  const updateTemplate = useUpdateSmsTemplate();
  const deleteTemplate = useDeleteSmsTemplate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateTemplateFormData>({
    resolver: zodResolver(updateTemplateSchema),
  });

  const bodyValue = watch('body') || '';
  const isActive = watch('is_active');
  const segmentInfo = countSmsSegments(bodyValue);
  const variables = extractTemplateVariables(bodyValue);
  const previewText = renderTemplate(bodyValue, previewVariables);

  // Load template data into form
  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        body: template.body,
        is_active: template.is_active,
      });
    }
  }, [template, reset]);

  // Update preview variables when template variables change
  useEffect(() => {
    const newVars: Record<string, string> = {};
    variables.forEach(v => {
      newVars[v] = previewVariables[v] || '';
    });
    if (JSON.stringify(newVars) !== JSON.stringify(previewVariables)) {
      setPreviewVariables(newVars);
    }
  }, [variables]);

  const onSubmit = async (data: UpdateTemplateFormData) => {
    if (!id) return;
    try {
      await updateTemplate.mutateAsync({
        id,
        data: {
          name: data.name,
          body: data.body,
          is_active: data.is_active,
        },
      });
      toast.success('Template updated successfully');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update template';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteTemplate.mutateAsync(id);
      toast.success('Template deleted successfully');
      navigate('/sms/templates');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete template';
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

  if (!template) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Template not found</h3>
          <p className="text-muted-foreground mb-4">
            The template you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/sms/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/sms/templates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{template.name}</h2>
            <p className="text-muted-foreground mt-1">
              Edit SMS template
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
                <CardDescription>Update your SMS template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Verification Code"
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
                    placeholder="Your verification code is {{code}}. Valid for 10 minutes."
                    rows={6}
                    maxLength={1600}
                    {...register('body')}
                  />
                  {errors.body && (
                    <p className="text-sm text-destructive">{errors.body.message}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{segmentInfo.charCount}/1600 characters</span>
                      <Badge variant="outline" className="text-xs">
                        {segmentInfo.encoding}
                      </Badge>
                    </div>
                    <span>{segmentInfo.segments} segment{segmentInfo.segments !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active" className="text-base">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      {isActive ? 'Template can be used for sending' : 'Template is disabled'}
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            {variables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview with Variables</CardTitle>
                  <CardDescription>
                    Test your template by filling in variable values
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {variables.map((varName) => (
                      <div key={varName} className="space-y-1">
                        <Label htmlFor={`preview-${varName}`} className="text-xs text-muted-foreground">
                          {`{{${varName}}}`}
                        </Label>
                        <Input
                          id={`preview-${varName}`}
                          placeholder={varName}
                          value={previewVariables[varName] || ''}
                          onChange={(e) => setPreviewVariables({
                            ...previewVariables,
                            [varName]: e.target.value,
                          })}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="whitespace-pre-wrap">{previewText}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isDirty || updateTemplate.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateTemplate.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={template.is_active ? 'default' : 'secondary'}>
                  {template.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">{formatDate(template.created_at_utc)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(parseUtcDate(template.created_at_utc), { addSuffix: true })}
                  </p>
                </div>
                {template.updated_at_utc && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                    <p className="font-medium">{formatDate(template.updated_at_utc)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(parseUtcDate(template.updated_at_utc), { addSuffix: true })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Template ID</p>
                  <p className="font-mono text-xs break-all">{template.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}
