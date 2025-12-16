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
import { Switch } from '../../components/ui/switch';
import { Plus, X, Send, Mail, AlertCircle, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { SendEmailRequest } from '../../lib/types';
import { getTimezoneAbbreviation } from '../../lib/utils';

const recipientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});

const sendEmailSchema = z.object({
  from_email: z.string().email('Invalid email address'),
  from_name: z.string().optional(),
  to: z.array(recipientSchema).min(1, 'At least one recipient is required'),
  cc: z.array(recipientSchema).optional(),
  bcc: z.array(recipientSchema).optional(),
  subject: z.string().min(1, 'Subject is required'),
  html_body: z.string().optional(),
  text_body: z.string().optional(),
  scheduled_at: z.string().optional(),
});

type SendEmailFormData = z.infer<typeof sendEmailSchema>;

// Get minimum datetime for scheduling (5 minutes from now)
function getMinScheduleDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return now.toISOString().slice(0, 16);
}

// Get default schedule datetime (1 hour from now, rounded to nearest 15 min)
function getDefaultScheduleDateTime(): string {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  return now.toISOString().slice(0, 16);
}

export function SendEmailPage() {
  const { data: domains } = useDomains();
  const sendEmail = useSendEmail();
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);

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
      scheduled_at: getDefaultScheduleDateTime(),
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

  const verifiedDomains = domains?.filter(d => d.verification_status === 1 && d.dkim_status === 1) || [];

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    const fromName = watch('from_name') || 'noreply';
    setValue('from_email', `${fromName}@${domain}`);
  };

  const handleFromNameChange = (name: string) => {
    if (selectedDomain) {
      setValue('from_email', `${name || 'noreply'}@${selectedDomain}`);
    }
  };

  const onSubmit = async (data: SendEmailFormData) => {
    try {
      // Convert local datetime to UTC ISO string if scheduling
      let scheduledAtUtc: string | undefined;
      if (isScheduled && data.scheduled_at) {
        const localDate = new Date(data.scheduled_at);
        scheduledAtUtc = localDate.toISOString();
      }

      const cleanedData: SendEmailRequest = {
        from_email: data.from_email,
        from_name: data.from_name,
        to: data.to.filter(r => r.email),
        cc: data.cc?.filter(r => r.email),
        bcc: data.bcc?.filter(r => r.email),
        subject: data.subject,
        html_body: data.html_body,
        text_body: data.text_body,
        scheduled_at_utc: scheduledAtUtc,
      };

      const result = await sendEmail.mutateAsync(cleanedData);

      if (isScheduled) {
        toast.success(`Email scheduled successfully! Message ID: ${result.message_id}`);
      } else {
        toast.success(`Email sent successfully! Message ID: ${result.message_id}`);
      }

      reset({
        to: [{ email: '', name: '' }],
        cc: [],
        bcc: [],
        subject: '',
        html_body: '',
        text_body: '',
        scheduled_at: getDefaultScheduleDateTime(),
      });
      setSelectedDomain('');
      setIsScheduled(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Send Email</h2>
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
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  placeholder="e.g., noreply, support, hello"
                  {...register('from_name')}
                  onChange={(e) => handleFromNameChange(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_email">From Email *</Label>
              <Input
                id="from_email"
                placeholder="noreply@example.com"
                {...register('from_email')}
                disabled
                className="bg-muted"
              />
              {errors.from_email && (
                <p className="text-sm text-destructive">{errors.from_email.message}</p>
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
                  id="html_body"
                  placeholder="<html><body><h1>Hello!</h1><p>Your message here...</p></body></html>"
                  rows={12}
                  {...register('html_body')}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter HTML content for rich-formatted emails
                </p>
              </TabsContent>

              <TabsContent value="text" className="space-y-2">
                <Textarea
                  id="text_body"
                  placeholder="Enter plain text message here..."
                  rows={12}
                  {...register('text_body')}
                />
                <p className="text-xs text-muted-foreground">
                  Fallback text for email clients that don't support HTML
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Scheduling Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Delivery Options
            </CardTitle>
            <CardDescription>Send immediately or schedule for later</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="schedule-toggle" className="text-base">Schedule for later</Label>
                <p className="text-sm text-muted-foreground">
                  {isScheduled ? 'Email will be sent at the scheduled time' : 'Email will be sent immediately'}
                </p>
              </div>
              <Switch
                id="schedule-toggle"
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
            </div>

            {isScheduled && (
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="scheduled_at" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Date & Time
                  <span className="text-xs font-normal text-muted-foreground">({getTimezoneAbbreviation()})</span>
                </Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  min={getMinScheduleDateTime()}
                  {...register('scheduled_at')}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Select when you want the email to be sent in your local timezone
                </p>
              </div>
            )}
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
            ) : isScheduled ? (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Email will be scheduled from {verifiedDomains.length} verified domain(s)
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
              isScheduled ? 'Scheduling...' : 'Sending...'
            ) : isScheduled ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Schedule Email
              </>
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
