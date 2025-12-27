import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Shield, Zap, BarChart3, Clock, Check, Globe, FileText } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from './contexts/AuthContext';
import { SEO } from '@/components/SEO';

function Home() {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'curl' | 'node' | 'python' | 'dotnet' | 'php'>('curl');
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Use a clean display URL for code examples (not the actual API URL)
    const exampleApiUrl = 'https://api.sendbase.app';

    const codeExamples = {
        curl: `curl -X POST '${exampleApiUrl}/v1/sms/send' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "to": "+15551234567",
    "body": "Your verification code is 123456"
  }'`,
        node: `import { SendBaseClient } from '@sendbase/sms';

const client = new SendBaseClient('YOUR_API_KEY');

await client.sms.send({
  to: '+15551234567',
  body: 'Your verification code is 123456'
});`,
        python: `from sendbase import SendBaseClient

client = SendBaseClient('YOUR_API_KEY')

client.sms.send(
    to='+15551234567',
    body='Your verification code is 123456'
)`,
        dotnet: `using SendBase;

var client = new SendBaseClient("YOUR_API_KEY");

await client.Sms.SendAsync(new SendSmsRequest
{
    To = "+15551234567",
    Body = "Your verification code is 123456"
});`,
        php: `require_once('vendor/autoload.php');

$client = new SendBase\\SendBaseClient('YOUR_API_KEY');

$client->sms->send([
    'to' => '+15551234567',
    'body' => 'Your verification code is 123456'
]);`
    };

    return (
        <div className="min-h-screen">
            <SEO
                title="SMS API for Developers"
                description="Send transactional SMS messages at scale with Sendbase. Simple REST API, global coverage, real-time delivery tracking, and developer-friendly SDKs."
                canonical="/"
            />
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
                    <div className="mr-4 flex">
                        <Link to="/" className="mr-6 flex items-center space-x-2">
                            <MessageSquare className="h-6 w-6" />
                            <span className="font-bold">Sendbase</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <nav className="flex items-center space-x-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </Button>
                            <Link to="/login">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="w-full py-24 md:py-32">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="space-y-4 max-w-[64rem]">
                            <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                                SMS API for developers
                            </h1>
                            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mx-auto">
                                The simplest way to send SMS messages globally. Deliver verification codes, alerts, and notifications at scale.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Link to="/login">
                                <Button size="lg">Start for free</Button>
                            </Link>
                            <Button size="lg" variant="outline" >
                                <a href="https://docs.sendbase.app" target="_blank" rel="noopener noreferrer">View Docs</a>
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-4">
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                <span>Pay per message</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                <span>99.9% uptime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                <span>Global coverage</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Code Example Section */}
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto max-w-[58rem] flex flex-col items-center space-y-8 text-center">
                        <div className="space-y-2">
                            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                                Simple, powerful API
                            </h2>
                            <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                                Send your first SMS in minutes with our intuitive REST API
                            </p>
                        </div>

                        <Card className="w-full overflow-hidden">
                        <div className="border-b bg-muted/50 flex items-center gap-2 p-2">
                            <Button
                                variant={activeTab === 'curl' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('curl')}
                            >
                                cURL
                            </Button>
                            <Button
                                variant={activeTab === 'node' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('node')}
                            >
                                Node.js
                            </Button>
                            <Button
                                variant={activeTab === 'python' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('python')}
                            >
                                Python
                            </Button>
                            <Button
                                variant={activeTab === 'dotnet' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('dotnet')}
                            >
                                .NET
                            </Button>
                            <Button
                                variant={activeTab === 'php' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('php')}
                            >
                                PHP
                            </Button>
                        </div>
                        <div className="p-0">
                            <SyntaxHighlighter
                                language={activeTab === 'curl' ? 'bash' : activeTab === 'node' ? 'javascript' : activeTab === 'python' ? 'python' : activeTab === 'dotnet' ? 'csharp' : 'php'}
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    borderRadius: 0,
                                    fontSize: '0.875rem',
                                    padding: '1.5rem',
                                }}
                            >
                                {codeExamples[activeTab]}
                            </SyntaxHighlighter>
                        </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="w-full py-16 md:py-24 border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                        Everything you need
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        From startups to enterprise, we provide the tools you need to send SMS at scale
                    </p>
                    </div>

                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-16">
                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <Zap className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Lightning Fast</h3>
                                <p className="text-sm text-muted-foreground">
                                    Send SMS messages in milliseconds with our optimized delivery infrastructure
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <Globe className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Global Coverage</h3>
                                <p className="text-sm text-muted-foreground">
                                    Reach customers in 200+ countries with reliable international delivery
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <BarChart3 className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Real-time Tracking</h3>
                                <p className="text-sm text-muted-foreground">
                                    Track delivery status, failures, and engagement with detailed analytics
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <Shield className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Enterprise Security</h3>
                                <p className="text-sm text-muted-foreground">
                                    SOC 2 compliant with encrypted delivery and secure API authentication
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <Clock className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Message History</h3>
                                <p className="text-sm text-muted-foreground">
                                    Full audit trail with complete message history and delivery events
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <FileText className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">SMS Templates</h3>
                                <p className="text-sm text-muted-foreground">
                                    Create reusable templates with dynamic variables for consistent messaging
                                </p>
                            </div>
                        </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="w-full py-16 md:py-24 border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                        Simple pricing
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Pay only for what you send. No monthly minimums.
                    </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mt-16">
                    <Card className="flex flex-col p-6">
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-2xl font-bold">Pay As You Go</h3>
                            <div className="flex items-baseline text-4xl font-bold">
                                $0.0075
                                <span className="text-sm font-normal text-muted-foreground ml-1">/SMS</span>
                            </div>
                        </div>
                        <div className="flex-1 mt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>No monthly commitment</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>US & Canada coverage</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Delivery tracking</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>API access</span>
                                </li>
                            </ul>
                        </div>
                        <Link to="/login" className="mt-6">
                            <Button variant="outline" className="w-full">
                                Get Started
                            </Button>
                        </Link>
                    </Card>

                    <Card className="flex flex-col p-6 border-2 border-primary relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full">
                                Popular
                            </span>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-2xl font-bold">Growth</h3>
                            <div className="flex items-baseline text-4xl font-bold">
                                $49
                                <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                            </div>
                        </div>
                        <div className="flex-1 mt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>10,000 SMS included</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>$0.005/SMS after</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Dedicated phone number</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Priority support</span>
                                </li>
                            </ul>
                        </div>
                        <Link to="/login" className="mt-6">
                            <Button className="w-full">Get Started</Button>
                        </Link>
                    </Card>

                    <Card className="flex flex-col p-6">
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-2xl font-bold">Enterprise</h3>
                            <div className="flex items-baseline text-4xl font-bold">
                                Custom
                            </div>
                        </div>
                        <div className="flex-1 mt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Volume discounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Dedicated short code</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Custom sender ID</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>24/7 support</span>
                                </li>
                            </ul>
                        </div>
                        <a href="mailto:sales@sendbase.app?subject=Enterprise Plan Inquiry" className="mt-6">
                            <Button variant="outline" className="w-full">
                                Contact Sales
                            </Button>
                        </a>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-16 md:py-24 border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                    <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                        Ready to get started?
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Join developers who trust us with their SMS delivery
                    </p>
                    <div className="flex gap-4">
                        <Link to="/login">
                            <Button size="lg">Get Started Free</Button>
                        </Link>
                        <a href="https://docs.sendbase.app" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline">
                                View Docs
                            </Button>
                        </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6 py-14">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Product</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Pricing
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a href="https://docs.sendbase.app" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="https://status.sendbase.app" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Status
                                    </a>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/acceptable-use" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Acceptable Use
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            <span className="font-bold">Sendbase</span>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            &copy; 2025 Sendbase. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
