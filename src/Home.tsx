import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, Send, Shield, Zap, BarChart3, Clock, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from './contexts/AuthContext';

function Home() {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'curl' | 'node' | 'python'>('curl');
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
        curl: `curl -X POST '${exampleApiUrl}/v1/emails/send' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "from": "hello@sendbase.app",
    "to": ["customer@example.com"],
    "subject": "Welcome!",
    "html": "<h1>Hello World</h1>"
  }'`,
        node: `import { EmailClient } from '@sendbase/email';

const client = new EmailClient('YOUR_API_KEY');

await client.send({
  from: 'hello@sendbase.app',
  to: ['customer@example.com'],
  subject: 'Welcome!',
  html: '<h1>Hello World</h1>'
});`,
        python: `from email_client import EmailClient

client = EmailClient('YOUR_API_KEY')

client.send(
    from_email='hello@sendbase.app',
    to=['customer@example.com'],
    subject='Welcome!',
    html='<h1>Hello World</h1>'
)`
    };

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
                    <div className="mr-4 flex">
                        <Link to="/" className="mr-6 flex items-center space-x-2">
                            <Mail className="h-6 w-6" />
                            <span className="font-bold">EmailAPI</span>
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
                                Email for developers
                            </h1>
                            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mx-auto">
                                The best way to reach humans instead of spam folders. Deliver transactional and marketing emails at scale.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Link to="/login">
                                <Button size="lg">Start for free</Button>
                            </Link>
                            <Button size="lg" variant="outline">
                                View Documentation
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-4">
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                <span>Simple pricing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                <span>99.9% uptime</span>
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
                                Send your first email in minutes with our intuitive REST API
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
                        </div>
                        <div className="p-0">
                            <SyntaxHighlighter
                                language={activeTab === 'curl' ? 'bash' : activeTab === 'node' ? 'javascript' : 'python'}
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
            <section className="w-full py-16 md:py-24 border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                        Everything you need
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        From startups to enterprise, we provide the tools you need to send email at scale
                    </p>
                    </div>

                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-16">
                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <Zap className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Lightning Fast</h3>
                                <p className="text-sm text-muted-foreground">
                                    Send emails in milliseconds with our optimized delivery infrastructure
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
                                    SOC 2 compliant with DKIM, SPF, and DMARC authentication
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <BarChart3 className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Real-time Analytics</h3>
                                <p className="text-sm text-muted-foreground">
                                    Track opens, clicks, bounces, and more with detailed analytics
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <Send className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">High Deliverability</h3>
                                <p className="text-sm text-muted-foreground">
                                    Best-in-class delivery rates with automatic retry logic
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <Clock className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Email History</h3>
                                <p className="text-sm text-muted-foreground">
                                    Full audit trail with complete message history and delivery events
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden p-6">
                        <div className="flex flex-col justify-between rounded-md h-full space-y-3">
                            <Mail className="h-12 w-12" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">Domain Management</h3>
                                <p className="text-sm text-muted-foreground">
                                    Easy DNS setup and verification for all your sending domains
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
                        Start free, scale as you grow
                    </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mt-16">
                    <Card className="flex flex-col p-6">
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-2xl font-bold">Starter</h3>
                            <div className="flex items-baseline text-4xl font-bold">
                                $9
                                <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                            </div>
                        </div>
                        <div className="flex-1 mt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>25,000 emails/month</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>1 domain</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>2 API keys</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Email support</span>
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
                                $29
                                <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                            </div>
                        </div>
                        <div className="flex-1 mt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>100,000 emails/month</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>5 domains</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>10 API keys</span>
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
                                    <span>Custom email volume</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Unlimited domains</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>Dedicated IP</span>
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
                        Join thousands of developers who trust us with their email delivery
                    </p>
                    <div className="flex gap-4">
                        <Link to="/login">
                            <Button size="lg">Get Started Free</Button>
                        </Link>
                        <Button size="lg" variant="outline">
                            View Docs
                        </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6 py-14">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Product</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        API
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Company</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Careers
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Status
                                    </a>
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
                            <Mail className="h-5 w-5" />
                            <span className="font-bold">EmailAPI</span>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            &copy; 2025 EmailAPI. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
