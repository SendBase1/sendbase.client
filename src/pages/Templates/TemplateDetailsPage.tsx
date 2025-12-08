import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTemplate, useUpdateTemplate, useDeleteTemplate, usePreviewTemplate } from '../../hooks/useTemplates';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { ArrowLeft, Save, Eye, Trash2, RefreshCw, Loader2, Code, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { API_BASE_URL } from '../../lib/config';

const templateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  subject: z.string()
    .max(998, 'Subject must be less than 998 characters')
    .optional()
    .nullable(),
  html_body: z.string().optional().nullable(),
  text_body: z.string().optional().nullable(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export function TemplateDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: template, isLoading, refetch } = useTemplate(id!);
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const previewTemplate = usePreviewTemplate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<{ subject?: string; html_body?: string; text_body?: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        subject: template.subject || '',
        html_body: template.html_body || '',
        text_body: template.text_body || '',
      });
      // Initialize preview variables
      const vars: Record<string, string> = {};
      template.variables.forEach(v => {
        vars[v] = '';
      });
      setPreviewVariables(vars);
    }
  }, [template, reset]);

  const handleSave = async (data: TemplateFormData) => {
    if (!id) return;

    try {
      await updateTemplate.mutateAsync({
        id,
        data: {
          name: data.name,
          subject: data.subject || undefined,
          html_body: data.html_body || undefined,
          text_body: data.text_body || undefined,
        },
      });
      toast.success('Template updated successfully!');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update template');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteTemplate.mutateAsync(id);
      toast.success('Template deleted successfully');
      navigate('/templates');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handlePreview = async () => {
    if (!id) return;

    try {
      const result = await previewTemplate.mutateAsync({
        id,
        variables: previewVariables,
      });
      setPreviewResult(result);
    } catch (error: any) {
      toast.error(error.message || 'Failed to preview template');
    }
  };

  const copyToClipboard = async (text: string, snippetName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetName);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const generateCodeSnippets = () => {
    if (!template || !id) return { curl: '', javascript: '', csharp: '' };

    const variablesObj = template.variables.reduce((acc, v) => {
      acc[v] = `your_${v}_value`;
      return acc;
    }, {} as Record<string, string>);

    const variablesJson = JSON.stringify(variablesObj, null, 4);

    // Use template subject as example, or a placeholder
    const subjectExample = template.subject || 'Your Subject Here';

    // cURL
    const curl = `curl --location '${API_BASE_URL}/api/v1/emails/send' \\
--header 'x-api-key: YOUR_API_KEY' \\
--header 'Content-Type: application/json' \\
--data '{
    "from_email": "you@yourdomain.com",
    "to": [{"email": "recipient@example.com"}],
    "subject": "${subjectExample.replace(/"/g, '\\"')}",
    "template_id": "${id}",
    "template_variables": ${variablesJson.split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n')}
}'`;

    // JavaScript (fetch)
    const javascript = `const response = await fetch('${API_BASE_URL}/api/v1/emails/send', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from_email: 'you@yourdomain.com',
    to: [{ email: 'recipient@example.com' }],
    subject: '${subjectExample.replace(/'/g, "\\'")}',
    template_id: '${id}',
    template_variables: ${variablesJson.split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n')},
  }),
});

const result = await response.json();
console.log(result);`;

    // C#
    const csharp = `using var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key", "YOUR_API_KEY");

var request = new
{
    from_email = "you@yourdomain.com",
    to = new[] { new { email = "recipient@example.com" } },
    subject = "${subjectExample.replace(/"/g, '\\"')}",
    template_id = "${id}",
    template_variables = new Dictionary<string, string>
    {
${template.variables.map(v => `        { "${v}", "your_${v}_value" }`).join(',\n')}
    }
};

var response = await client.PostAsJsonAsync(
    "${API_BASE_URL}/api/v1/emails/send",
    request
);

var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`;

    return { curl, javascript, csharp };
  };

  const codeSnippets = generateCodeSnippets();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-2">Template not found</h3>
          <Button onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{template.name}</h2>
            <p className="text-muted-foreground mt-1">
              Version {template.version} &middot; Created {new Date(template.created_at_utc).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCodeDialog(true)}
          >
            <Code className="h-4 w-4 mr-2" />
            Code
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreviewDialog(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Variables Badge */}
      {template.variables.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Template Variables
            </CardTitle>
            <CardDescription>
              These variables can be replaced when sending emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {template.variables.map((variable) => (
                <Badge key={variable} variant="secondary">
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit(handleSave)}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Template</CardTitle>
            <CardDescription>
              Use {'{{variable_name}}'} syntax for dynamic content that can be replaced when sending.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="html_body">HTML Body</Label>
              <Textarea
                id="html_body"
                placeholder="<h1>Hello, {{first_name}}!</h1>"
                rows={12}
                className="font-mono text-sm"
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
                placeholder="Hello, {{first_name}}!"
                rows={6}
                className="font-mono text-sm"
                {...register('text_body')}
              />
              {errors.text_body && (
                <p className="text-sm text-destructive">{errors.text_body.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isDirty || updateTemplate.isPending}
              >
                {updateTemplate.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Template</DialogTitle>
            <DialogDescription>
              Enter values for template variables to see a preview
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-4 py-4 px-1">
            {/* Variable Inputs */}
            {template.variables.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Variables</Label>
                <div className="grid grid-cols-2 gap-3">
                  {template.variables.map((variable) => (
                    <div key={variable} className="space-y-1">
                      <Label htmlFor={`var-${variable}`} className="text-xs text-muted-foreground">
                        {`{{${variable}}}`}
                      </Label>
                      <Input
                        id={`var-${variable}`}
                        placeholder={`Enter ${variable}`}
                        value={previewVariables[variable] || ''}
                        onChange={(e) =>
                          setPreviewVariables((prev) => ({
                            ...prev,
                            [variable]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePreview}
                  disabled={previewTemplate.isPending}
                >
                  {previewTemplate.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Generate Preview
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Preview Result */}
            {previewResult && (
              <Tabs defaultValue="html" className="w-full">
                <TabsList>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="text">Plain Text</TabsTrigger>
                </TabsList>
                <TabsContent value="html" className="space-y-3">
                  {previewResult.subject && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="font-medium">{previewResult.subject}</p>
                    </div>
                  )}
                  {previewResult.html_body && (
                    <div className="border rounded-lg p-4 bg-white">
                      <div
                        dangerouslySetInnerHTML={{ __html: previewResult.html_body }}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="text" className="space-y-3">
                  {previewResult.subject && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="font-medium">{previewResult.subject}</p>
                    </div>
                  )}
                  {previewResult.text_body && (
                    <pre className="border rounded-lg p-4 bg-muted text-sm whitespace-pre-wrap font-mono">
                      {previewResult.text_body}
                    </pre>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Snippets Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Code Snippets</DialogTitle>
            <DialogDescription>
              Use these code snippets to send emails with this template
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4">
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="csharp">C#</TabsTrigger>
              </TabsList>
              <TabsContent value="curl" className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(codeSnippets.curl, 'curl')}
                  >
                    {copiedSnippet === 'curl' ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedSnippet === 'curl' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">
                  {codeSnippets.curl}
                </pre>
              </TabsContent>
              <TabsContent value="javascript" className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(codeSnippets.javascript, 'javascript')}
                  >
                    {copiedSnippet === 'javascript' ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedSnippet === 'javascript' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">
                  {codeSnippets.javascript}
                </pre>
              </TabsContent>
              <TabsContent value="csharp" className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(codeSnippets.csharp, 'csharp')}
                  >
                    {copiedSnippet === 'csharp' ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedSnippet === 'csharp' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">
                  {codeSnippets.csharp}
                </pre>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Template"
        description="This will permanently delete this template. This action cannot be undone."
        confirmText={template.name}
        confirmLabel="Type the template name to confirm"
        onConfirm={handleDelete}
        isLoading={deleteTemplate.isPending}
        variant="danger"
      />
    </div>
  );
}
