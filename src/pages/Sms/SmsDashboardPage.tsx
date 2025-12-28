import { useSmsMessages } from '../../hooks/useSms';
import { useSmsPhoneNumbers } from '../../hooks/useSmsPhoneNumbers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { parseUtcDate } from '../../lib/utils';
import { getSmsStatusStyle, formatPhoneDisplay } from '../../lib/smsUtils';

export function SmsDashboardPage() {
  const navigate = useNavigate();
  const { data: messagesData, isLoading: messagesLoading } = useSmsMessages({ page: 1, page_size: 5 });
  const { data: phoneNumbersData, isLoading: phoneNumbersLoading } = useSmsPhoneNumbers();

  const recentMessages = messagesData?.messages || [];
  const totalMessages = messagesData?.total || 0;
  const phoneNumbers = phoneNumbersData?.phone_numbers || [];
  const activePhoneNumbers = phoneNumbers.filter(p => p.is_active).length;

  // Calculate message stats from recent messages
  const sentMessages = recentMessages.filter(m => m.status === 1).length;
  const failedMessages = recentMessages.filter(m => m.status === 2).length;

  const getStatusBadge = (statusText: string) => {
    return (
      <Badge variant="outline" className={`text-xs ${getSmsStatusStyle(statusText)}`}>
        {statusText}
      </Badge>
    );
  };

  // Show onboarding if no phone numbers
  const showOnboarding = !phoneNumbersLoading && phoneNumbers.length === 0;

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-1">SMS Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage your SMS messaging
        </p>
      </div>

      {/* Onboarding Alert */}
      {showOnboarding && (
        <Card className="border-amber-500/50 bg-amber-500/5 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle className="text-base">Get Started with SMS</CardTitle>
                <CardDescription>
                  You need at least one phone number to start sending SMS messages.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/sms/phone-numbers')}>
              <Phone className="h-4 w-4 mr-2" />
              Set Up Phone Numbers
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {/* Active Phone Numbers Card */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Phone Numbers
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold">
                {phoneNumbersLoading ? '-' : activePhoneNumbers}
              </span>
              <span className="text-sm text-muted-foreground">
                / {phoneNumbers.length}
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {activePhoneNumbers === 0 ? (
                <span className="text-muted-foreground">No active numbers</span>
              ) : (
                <span className="text-muted-foreground">Ready to send</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Messages Card */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {messagesLoading ? '-' : totalMessages.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              All time activity
            </div>
          </CardContent>
        </Card>

        {/* Sent Successfully Card */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sent Successfully
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {messagesLoading ? '-' : sentMessages}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Recent messages
            </div>
          </CardContent>
        </Card>

        {/* Failed Card */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {messagesLoading ? '-' : failedMessages}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Recent messages
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-medium mb-4 text-muted-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card
            className="border-border/40 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate('/sms/send')}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Send SMS</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Compose a message</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/40 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate('/sms/messages')}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">View Messages</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Track and analyze</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/40 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate('/sms/templates')}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Templates</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Reusable messages</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/40 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate('/sms/phone-numbers')}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Phone Numbers</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage senders</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Messages */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Recent Messages</CardTitle>
              <CardDescription className="mt-1 text-xs">
                Monitor your latest SMS activity
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/sms/messages')}
              className="text-xs h-8"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : recentMessages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium">From</TableHead>
                    <TableHead className="text-xs font-medium">To</TableHead>
                    <TableHead className="text-xs font-medium">Message</TableHead>
                    <TableHead className="text-xs font-medium">Status</TableHead>
                    <TableHead className="text-xs font-medium">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMessages.map((message) => (
                    <TableRow
                      key={message.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/sms/messages/${message.id}`)}
                    >
                      <TableCell className="font-medium text-sm">
                        {formatPhoneDisplay(message.from_number)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatPhoneDisplay(message.to_number)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {message.body}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(message.status_text)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {message.sent_at_utc
                          ? formatDistanceToNow(parseUtcDate(message.sent_at_utc), { addSuffix: true })
                          : message.scheduled_at_utc
                            ? `Scheduled ${formatDistanceToNow(parseUtcDate(message.scheduled_at_utc), { addSuffix: true })}`
                            : 'Pending'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-medium mb-1">No messages yet</h3>
              <p className="text-xs text-muted-foreground mb-4">Start sending SMS to see your activity here</p>
              <Button
                size="sm"
                onClick={() => navigate('/sms/send')}
                className="text-xs h-8"
                disabled={phoneNumbers.length === 0}
              >
                Send Your First SMS
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
