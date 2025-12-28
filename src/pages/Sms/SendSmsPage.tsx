import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSmsPhoneNumbers } from '../../hooks/useSmsPhoneNumbers';
import { useSmsTemplates } from '../../hooks/useSmsTemplates';
import { useSendSms } from '../../hooks/useSms';
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
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Send, AlertCircle, Clock, Calendar, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { SendSmsRequest } from '../../lib/types';
import { getTimezoneAbbreviation } from '../../lib/utils';
import {
  countSmsSegments,
  formatPhoneE164,
  isValidE164,
  extractTemplateVariables,
  renderTemplate,
} from '../../lib/smsUtils';

const sendSmsSchema = z.object({
  to: z.string().min(1, 'Phone number is required').refine(
    (val) => isValidE164(formatPhoneE164(val)),
    'Invalid phone number format'
  ),
  from: z.string().optional(),
  body: z.string().min(1, 'Message is required').max(1600, 'Message cannot exceed 1600 characters'),
  template_id: z.string().optional(),
  scheduled_at: z.string().optional(),
});

type SendSmsFormData = z.infer<typeof sendSmsSchema>;

function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getMinScheduleDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return formatLocalDateTime(now);
}

function getDefaultScheduleDateTime(): string {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  return formatLocalDateTime(now);
}

export function SendSmsPage() {
  const { data: phoneNumbersData } = useSmsPhoneNumbers();
  const { data: templatesData } = useSmsTemplates();
  const sendSms = useSendSms();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [isScheduled, setIsScheduled] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SendSmsFormData>({
    resolver: zodResolver(sendSmsSchema),
    defaultValues: {
      scheduled_at: getDefaultScheduleDateTime(),
    },
  });

  const phoneNumbers = phoneNumbersData?.phone_numbers?.filter(p => p.is_active) || [];
  const templates = templatesData?.templates?.filter(t => t.is_active) || [];
  const defaultPhoneNumber = phoneNumbers.find(p => p.is_default) || phoneNumbers[0];

  const bodyValue = watch('body') || '';
  const segmentInfo = countSmsSegments(bodyValue);

  // Set default from number when data loads
  useEffect(() => {
    if (defaultPhoneNumber && !watch('from')) {
      setValue('from', defaultPhoneNumber.phone_number);
    }
  }, [defaultPhoneNumber, setValue, watch]);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId && templateId !== 'none') {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setValue('body', template.body);
        const vars = extractTemplateVariables(template.body);
        const newVars: Record<string, string> = {};
        vars.forEach(v => { newVars[v] = templateVariables[v] || ''; });
        setTemplateVariables(newVars);
      }
    } else {
      setTemplateVariables({});
    }
  };

  // Update body when template variables change
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== 'none') {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setValue('body', renderTemplate(template.body, templateVariables));
      }
    }
  }, [templateVariables, selectedTemplate, templates, setValue]);

  const onSubmit = async (data: SendSmsFormData) => {
    try {
      let scheduledAtUtc: string | undefined;
      if (isScheduled && data.scheduled_at) {
        const localDate = new Date(data.scheduled_at);
        scheduledAtUtc = localDate.toISOString();
      }

      const request: SendSmsRequest = {
        to: formatPhoneE164(data.to),
        from: data.from,
        body: data.body,
        template_id: selectedTemplate && selectedTemplate !== 'none' ? selectedTemplate : undefined,
        template_variables: Object.keys(templateVariables).length > 0 ? templateVariables : undefined,
        scheduled_at_utc: scheduledAtUtc,
      };

      await sendSms.mutateAsync(request);

      if (isScheduled) {
        toast.success('SMS scheduled successfully!');
      } else {
        toast.success('SMS sent successfully!');
      }

      reset({
        to: '',
        from: defaultPhoneNumber?.phone_number || '',
        body: '',
        scheduled_at: getDefaultScheduleDateTime(),
      });
      setSelectedTemplate('');
      setTemplateVariables({});
      setIsScheduled(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send SMS';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Send SMS</h2>
        <p className="text-muted-foreground mt-1">
          Compose and send text messages
        </p>
      </div>

      {/* Alert for no phone numbers */}
      {phoneNumbers.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No active phone numbers available. Please configure at least one phone number before sending SMS.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* From Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              From
            </CardTitle>
            <CardDescription>Select the sender phone number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="from">Phone Number *</Label>
              <Select
                value={watch('from') || ''}
                onValueChange={(value) => setValue('from', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a phone number" />
                </SelectTrigger>
                <SelectContent>
                  {phoneNumbers.length > 0 ? (
                    phoneNumbers.map((phone) => (
                      <SelectItem key={phone.id} value={phone.phone_number}>
                        <div className="flex items-center gap-2">
                          {phone.phone_number}
                          <Badge variant="outline" className="text-xs">
                            {phone.number_type_display}
                          </Badge>
                          {phone.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-numbers" disabled>
                      No phone numbers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recipient Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recipient</CardTitle>
            <CardDescription>Enter the recipient's phone number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="to">Phone Number *</Label>
              <Input
                id="to"
                placeholder="+1 (555) 123-4567"
                {...register('to')}
              />
              {errors.to && (
                <p className="text-sm text-destructive">{errors.to.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter phone number in E.164 format (e.g., +12025551234) or standard format
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        {templates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Template (Optional)</CardTitle>
              <CardDescription>Use a pre-defined message template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Template Variables */}
              {Object.keys(templateVariables).length > 0 && (
                <div className="space-y-3 pt-2 border-t">
                  <Label>Template Variables</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.keys(templateVariables).map((varName) => (
                      <div key={varName} className="space-y-1">
                        <Label htmlFor={`var-${varName}`} className="text-xs text-muted-foreground">
                          {`{{${varName}}}`}
                        </Label>
                        <Input
                          id={`var-${varName}`}
                          placeholder={varName}
                          value={templateVariables[varName]}
                          onChange={(e) => setTemplateVariables({
                            ...templateVariables,
                            [varName]: e.target.value,
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Message Body */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message
            </CardTitle>
            <CardDescription>Compose your SMS message (max 1600 characters)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              id="body"
              placeholder="Enter your message here..."
              rows={6}
              maxLength={1600}
              {...register('body')}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>{segmentInfo.charCount}/1600 characters</span>
                <Badge variant="outline" className="text-xs">
                  {segmentInfo.encoding}
                </Badge>
              </div>
              <span>
                {segmentInfo.segments} segment{segmentInfo.segments !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Standard SMS (GSM-7) allows 160 chars per segment. Unicode messages allow 70 chars per segment.
            </p>
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
                  {isScheduled ? 'SMS will be sent at the scheduled time' : 'SMS will be sent immediately'}
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
                  Select when you want the SMS to be sent in your local timezone
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {phoneNumbers.length === 0 ? (
              <span className="text-destructive flex items-center gap-2">
                <Phone className="h-4 w-4" />
                No phone numbers available
              </span>
            ) : isScheduled ? (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                SMS will be scheduled
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ready to send
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={sendSms.isPending || phoneNumbers.length === 0}
            size="lg"
          >
            {sendSms.isPending ? (
              isScheduled ? 'Scheduling...' : 'Sending...'
            ) : isScheduled ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Schedule SMS
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send SMS
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
