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
  Shield,
  Activity,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function Dashboard() {
    const navigate = useNavigate();
    const { data: domains, isLoading: domainsLoading } = useDomains();
    const { data: messagesData, isLoading: messagesLoading } = useMessages(1, 5);

    // Calculate stats
    const verifiedDomains = domains?.filter(d => d.verificationStatus === 1 && d.dkimStatus === 1).length || 0;
    const totalDomains = domains?.length || 0;
    const recentMessages = messagesData?.items || [];
    const totalMessages = messagesData?.totalCount || 0;

    // Calculate message stats
    const sentMessages = recentMessages.filter(m => m.status === 1).length;
    const failedMessages = recentMessages.filter(m => m.status === 2 || m.status === 3).length;

    const getStatusBadge = (status: number, text: string) => {
        const variants: Record<string, any> = {
            Sent: 'default',
            Delivered: 'default',
            Pending: 'secondary',
            Failed: 'destructive',
            Bounced: 'destructive',
        };
        return (
            <Badge variant={variants[text] || 'secondary'}>
                {text}
            </Badge>
        );
    };

    return (
        <div className="min-h-full p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            Monitor and manage your email infrastructure
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-2">
                        <Badge variant="secondary" className="px-3 py-1">
                            <Activity className="h-3 w-3 mr-1 animate-pulse" />
                            Live
                        </Badge>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Verified Domains Card */}
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full -mr-16 -mt-16" />
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                Verified Domains
                            </CardTitle>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    {domainsLoading ? '-' : verifiedDomains}
                                </span>
                                <span className="text-lg text-gray-500">
                                    / {totalDomains}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center text-sm">
                                {verifiedDomains === 0 ? (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                                        <span className="text-amber-600">No domains verified yet</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                        <span className="text-green-600">Ready to send</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Messages Card */}
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full -mr-16 -mt-16" />
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                Total Messages
                            </CardTitle>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Mail className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">
                                {messagesLoading ? '-' : totalMessages.toLocaleString()}
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                                All time activity
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sent Successfully Card */}
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full -mr-16 -mt-16" />
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                Sent Successfully
                            </CardTitle>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {messagesLoading ? '-' : sentMessages}
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                                Recent messages
                            </div>
                        </CardContent>
                    </Card>

                    {/* Failed/Bounced Card */}
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-full -mr-16 -mt-16" />
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                Failed/Bounced
                            </CardTitle>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">
                                {messagesLoading ? '-' : failedMessages}
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                                Recent messages
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card
                            className="group cursor-pointer border-0 shadow-md bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            onClick={() => navigate('/domains')}
                        >
                            <CardContent className="pt-6 pb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                                            <Database className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-lg">Manage Domains</p>
                                            <p className="text-sm text-gray-500 mt-1">Add and verify domains</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="group cursor-pointer border-0 shadow-md bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            onClick={() => navigate('/send')}
                        >
                            <CardContent className="pt-6 pb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                                            <Send className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-lg">Send Email</p>
                                            <p className="text-sm text-gray-500 mt-1">Compose and send</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="group cursor-pointer border-0 shadow-md bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            onClick={() => navigate('/messages')}
                        >
                            <CardContent className="pt-6 pb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                                            <TrendingUp className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-lg">View Messages</p>
                                            <p className="text-sm text-gray-500 mt-1">Track and analyze</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Messages Section */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
                        <div>
                            <CardTitle className="text-xl font-semibold">Recent Messages</CardTitle>
                            <CardDescription className="mt-1">
                                Monitor your latest email activity
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            className="border-2 hover:bg-gray-100"
                            onClick={() => navigate('/messages')}
                        >
                            View All
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {messagesLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="flex flex-col items-center gap-3">
                                    <Clock className="h-10 w-10 animate-spin text-gray-400" />
                                    <span className="text-sm text-gray-500">Loading messages...</span>
                                </div>
                            </div>
                        ) : recentMessages.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead className="font-semibold">From</TableHead>
                                            <TableHead className="font-semibold">Subject</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Sent</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentMessages.map((message) => (
                                            <TableRow
                                                key={message.id}
                                                className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                                                onClick={() => navigate(`/messages/${message.id}`)}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                                            {message.fromEmail.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-gray-900">{message.fromEmail}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {message.subject || <span className="text-gray-400 italic">No subject</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(message.status, message.statusText)}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {message.sentAtUtc
                                                        ? formatDistanceToNow(new Date(message.sentAtUtc), { addSuffix: true })
                                                        : 'Not sent'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-4">
                                    <Mail className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                                <p className="text-gray-500 mb-6">Start sending emails to see your activity here</p>
                                <Button
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                                    onClick={() => navigate('/send')}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Your First Email
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;
