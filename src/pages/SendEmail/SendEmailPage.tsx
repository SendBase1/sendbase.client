import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDomains } from '../../hooks/useDomains';
import { useSendEmail } from '../../hooks/useSendEmail';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Plus, X, Send, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { SendEmailRequest } from '../../lib/types';

const recipientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});

const sendEmailSchema = z.object({
  fromEmail: z.string().email('Invalid email address'),
  fromName: z.string().optional(),
  to: z.array(recipientSchema).min(1, 'At least one recipient is required'),
  cc: z.array(recipientSchema).optional(),
  bcc: z.array(recipientSchema).optional(),
  subject: z.string().min(1, 'Subject is required'),
  htmlBody: z.string().optional(),
  textBody: z.string().optional(),
});

type SendEmailFormData = z.infer<typeof sendEmailSchema>;

export function SendEmailPage() {
  const { data: domains } = useDomains();
  const sendEmail = useSendEmail();
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SendEmailFormData>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      to: [{ email: '', name: '' }],
      cc: [],
      bcc: [],
    },
  });

  const { fields: toFields, append: appendTo, remove: removeTo } = useFieldArray({
    control,
    name: 'to',
  });

  const { fields: ccFields, append: appendCc, remove: removeCc } = useFieldArray({
    control,
    name: 'cc',
  });

  const { fields: bccFields, append: appendBcc, remove: removeBcc } = useFieldArray({
    control,
    name: 'bcc',
  });

  const verifiedDomains = domains?.filter(d => d.verificationStatus === 1 && d.dkimStatus === 1) || [];

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    const fromName = watch('fromName') || 'noreply';
    setValue('fromEmail', `${fromName}@${domain}`);
  };

  const handleFromNameChange = (name: string) => {
    if (selectedDomain) {
      setValue('fromEmail', `${name || 'noreply'}@${selectedDomain}`);
    }
  };

  const onSubmit = async (data: SendEmailFormData) => {
    try {
      const cleanedData: SendEmailRequest = {
        ...data,
        to: data.to.filter(r => r.email),
        cc: data.cc?.filter(r => r.email),
        bcc: data.bcc?.filter(r => r.email),
      };

      const result = await sendEmail.mutateAsync(cleanedData);
      toast.success(`Email sent successfully! Message ID: ${result.messageId}`);

      reset({
        to: [{ email: '', name: '' }],
        cc: [],
        bcc: [],
        subject: '',
        htmlBody: '',
        textBody: '',
      });
      setSelectedDomain('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Send Email</h2>
        <p className="text-muted-foreground mt-1">
          Compose and send emails using your verified domains
        </p>
      </div>

      {/* Alert for no verified domains */}
      {verifiedDomains.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No verified domains available. Please verify at least one domain before sending emails.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* From Section */}
        <Card>
          <CardHeader>
            <CardTitle>From</CardTitle>
            <CardDescription>Configure the sender information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Select value={selectedDomain} onValueChange={handleDomainChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {verifiedDomains.length > 0 ? (
                      verifiedDomains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.domain}>
                          {domain.domain}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-domains" disabled>
                        No verified domains available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  placeholder="e.g., noreply, support, hello"
                  {...register('fromName')}
                  onChange={(e) => handleFromNameChange(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email *</Label>
              <Input
                id="fromEmail"
                placeholder="noreply@example.com"
                {...register('fromEmail')}
                disabled
                className="bg-muted"
              />
              {errors.fromEmail && (
                <p className="text-sm text-destructive">{errors.fromEmail.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recipients Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
            <CardDescription>Add email recipients, CC, and BCC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* To Recipients */}
            <div className="space-y-3">
              <Label>To *</Label>
              {toFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      placeholder="Email address"
                      {...register(`to.${index}.email`)}
                    />
                    <Input
                      placeholder="Name (optional)"
                      {...register(`to.${index}.name`)}
                    />
                  </div>
                  {toFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.to && (
                <p className="text-sm text-destructive">
                  {errors.to.message || errors.to[0]?.email?.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendTo({ email: '', name: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </div>

            {/* CC Recipients */}
            <div className="space-y-3">
              <Label>CC</Label>
              {ccFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      placeholder="Email address"
                      {...register(`cc.${index}.email`)}
                    />
                    <Input
                      placeholder="Name (optional)"
                      {...register(`cc.${index}.name`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCc(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {ccFields.length === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCc({ email: '', name: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add CC
                </Button>
              )}
            </div>

            {/* BCC Recipients */}
            <div className="space-y-3">
              <Label>BCC</Label>
              {bccFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      placeholder="Email address"
                      {...register(`bcc.${index}.email`)}
                    />
                    <Input
                      placeholder="Name (optional)"
                      {...register(`bcc.${index}.name`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBcc(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {bccFields.length === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendBcc({ email: '', name: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add BCC
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subject */}
        <Card>
          <CardHeader>
            <CardTitle>Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                id="subject"
                placeholder="Enter email subject"
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Body */}
        <Card>
          <CardHeader>
            <CardTitle>Message</CardTitle>
            <CardDescription>Compose your email content in HTML or plain text</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="html">
              <TabsList className="mb-4">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="text">Plain Text</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="space-y-2">
                <Textarea
                  id="htmlBody"
                  placeholder="<html><body><h1>Hello!</h1><p>Your message here...</p></body></html>"
                  rows={12}
                  {...register('htmlBody')}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter HTML content for rich-formatted emails
                </p>
              </TabsContent>

              <TabsContent value="text" className="space-y-2">
                <Textarea
                  id="textBody"
                  placeholder="Enter plain text message here..."
                  rows={12}
                  {...register('textBody')}
                />
                <p className="text-xs text-muted-foreground">
                  Fallback text for email clients that don't support HTML
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {verifiedDomains.length === 0 ? (
              <span className="text-destructive flex items-center gap-2">
                <Mail className="h-4 w-4" />
                No verified domains available
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Ready to send from {verifiedDomains.length} verified domain(s)
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={sendEmail.isPending || verifiedDomains.length === 0}
            size="lg"
          >
            {sendEmail.isPending ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
