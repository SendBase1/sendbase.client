import { useDomains } from './hooks/useDomains';
import { useMessages } from './hooks/useMessages';
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
  Mail,
  Send,
  Database,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { parseUtcDate } from './lib/utils';

function Dashboard() {
    const navigate = useNavigate();
    const { data: domains, isLoading: domainsLoading } = useDomains();
    const { data: messagesData, isLoading: messagesLoading } = useMessages(1, 5);

    // Calculate stats
    const verifiedDomains = domains?.filter(d => d.verification_status === 1 && d.dkim_status === 1).length || 0;
    const totalDomains = domains?.length || 0;
    const recentMessages = messagesData?.items || [];
    const totalMessages = messagesData?.total_count || 0;

    // Calculate message stats
    const sentMessages = recentMessages.filter(m => m.status === 1).length;
    const failedMessages = recentMessages.filter(m => m.status === 2 || m.status === 3).length;

    const getStatusBadge = (_status: number, text: string) => {
        const styles: Record<string, string> = {
            Sent: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
            Delivered: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
            Pending: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
            Queued: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
            Failed: 'bg-red-500/15 text-red-400 border-red-500/20',
            Bounced: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
            Complained: 'bg-red-500/15 text-red-400 border-red-500/20',
        };
        return (
            <Badge variant="outline" className={`text-xs ${styles[text] || 'bg-muted text-muted-foreground'}`}>
                {text}
            </Badge>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-[1400px]">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold mb-1">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Monitor and manage your email infrastructure
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {/* Verified Domains Card */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Verified Domains
                            </CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                                {domainsLoading ? '-' : verifiedDomains}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                / {totalDomains}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            {verifiedDomains === 0 ? (
                                <span className="text-muted-foreground">No domains verified</span>
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
                            <Mail className="h-4 w-4 text-muted-foreground" />
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

                {/* Failed/Bounced Card */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Failed/Bounced
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                        className="border-border/40 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => navigate('/domains')}
                    >
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Manage Domains</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Add and verify domains</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-border/40 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => navigate('/send')}
                    >
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Send className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Send Email</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Compose and send</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-border/40 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => navigate('/messages')}
                    >
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">View Messages</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Track and analyze</p>
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
                                Monitor your latest email activity
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/messages')}
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
                                    <TableHead className="text-xs font-medium">Subject</TableHead>
                                    <TableHead className="text-xs font-medium">Status</TableHead>
                                    <TableHead className="text-xs font-medium">Sent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentMessages.map((message) => (
                                    <TableRow
                                        key={message.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/messages/${message.id}`)}
                                    >
                                        <TableCell className="font-medium text-sm">
                                            {message.from_email}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate text-sm">
                                            {message.subject || <span className="text-muted-foreground italic">No subject</span>}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(message.status, message.status_text)}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {message.sent_at_utc
                                                ? formatDistanceToNow(parseUtcDate(message.sent_at_utc), { addSuffix: true })
                                                : 'Not sent'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-sm font-medium mb-1">No messages yet</h3>
                            <p className="text-xs text-muted-foreground mb-4">Start sending emails to see your activity here</p>
                            <Button
                                size="sm"
                                onClick={() => navigate('/send')}
                                className="text-xs h-8"
                            >
                                Send Your First Email
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default Dashboard;
