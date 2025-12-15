import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Mail, Check, X, ArrowRight } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export function PricingPage() {
    const { theme, setTheme } = useTheme();

    const pricingPlans = [
        {
            name: 'Starter',
            price: '$9',
            period: '/month',
            description: 'Perfect for small projects and startups',
            features: [
                '25,000 emails/month',
                '1 domain',
                '2 API keys',
                '2 webhooks',
                'Email support',
                '7-day analytics',
            ],
            cta: 'Get Started',
            popular: false,
        },
        {
            name: 'Growth',
            price: '$29',
            period: '/month',
            description: 'For growing businesses with higher volume',
            features: [
                '100,000 emails/month',
                '5 domains',
                '10 API keys',
                '10 webhooks',
                'Priority support',
                '30-day analytics',
            ],
            cta: 'Get Started',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For large-scale email operations',
            features: [
                'Custom email volume',
                'Unlimited domains',
                'Unlimited API keys',
                'Unlimited webhooks',
                '24/7 dedicated support',
                'Dedicated IP',
            ],
            cta: 'Contact Sales',
            popular: false,
        },
    ];

    const priceComparison = [
        { volume: '10,000', sendbase: '$9', resend: '$20', smtp2go: '$15', sendgrid: '$19.95' },
        { volume: '25,000', sendbase: '$9', resend: '$20', smtp2go: '$25', sendgrid: '$19.95' },
        { volume: '50,000', sendbase: '$29', resend: '$20', smtp2go: '$50', sendgrid: '$19.95' },
        { volume: '100,000', sendbase: '$29', resend: '$90', smtp2go: '$75', sendgrid: '$89.95' },
        { volume: '250,000', sendbase: 'Custom', resend: 'Custom', smtp2go: '$166', sendgrid: '$89.95' },
    ];

    const featureComparison = [
        { feature: 'REST API', sendbase: true, resend: true, smtp2go: true, sendgrid: true },
        { feature: 'Webhooks', sendbase: true, resend: true, smtp2go: true, sendgrid: true },
        { feature: 'Email Templates', sendbase: true, resend: true, smtp2go: true, sendgrid: true },
        { feature: 'Inbound Email', sendbase: true, resend: false, smtp2go: true, sendgrid: true },
        { feature: 'Real-time Analytics', sendbase: true, resend: true, smtp2go: true, sendgrid: true },
        { feature: 'Dedicated IP', sendbase: 'Growth+', resend: '$30+', smtp2go: '$75+', sendgrid: '$89.95+' },
        { feature: 'Free Tier', sendbase: '25K/mo', resend: '3K/mo', smtp2go: '1K/mo', sendgrid: '100/day' },
        { feature: 'DKIM/SPF/DMARC', sendbase: true, resend: true, smtp2go: true, sendgrid: true },
        { feature: 'Bounce Handling', sendbase: true, resend: true, smtp2go: true, sendgrid: true },
        { feature: 'SDK Support', sendbase: '5 languages', resend: '4 languages', smtp2go: '3 languages', sendgrid: '7 languages' },
    ];

    const renderFeatureValue = (value: boolean | string) => {
        if (value === true) {
            return <Check className="h-5 w-5 text-green-500 mx-auto" />;
        }
        if (value === false) {
            return <X className="h-5 w-5 text-muted-foreground mx-auto" />;
        }
        return <span className="text-sm">{value}</span>;
    };

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
                    <div className="mr-4 flex">
                        <Link to="/" className="mr-6 flex items-center space-x-2">
                            <Mail className="h-6 w-6" />
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
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl">
                            Simple, transparent pricing
                        </h1>
                        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                            No hidden fees. No surprises. Start free and scale as you grow.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="w-full pb-16 md:pb-24">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        {pricingPlans.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`flex flex-col p-6 ${plan.popular ? 'border-2 border-primary relative' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full">
                                            Popular
                                        </span>
                                    </div>
                                )}
                                <div className="flex flex-col space-y-2">
                                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                                    <div className="flex items-baseline text-4xl font-bold">
                                        {plan.price}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">
                                            {plan.period}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                                </div>
                                <div className="flex-1 mt-6">
                                    <ul className="space-y-3 text-sm">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2">
                                                <Check className="h-5 w-5 shrink-0 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {plan.name === 'Enterprise' ? (
                                    <a
                                        href="mailto:sales@sendbase.app?subject=Enterprise Plan Inquiry"
                                        className="mt-6"
                                    >
                                        <Button variant="outline" className="w-full">
                                            {plan.cta}
                                        </Button>
                                    </a>
                                ) : (
                                    <Link to="/login" className="mt-6">
                                        <Button
                                            variant={plan.popular ? 'default' : 'outline'}
                                            className="w-full"
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Price Comparison Section */}
            <section className="w-full py-16 md:py-24 border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
                        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
                            How SendBase compares
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            See how our pricing stacks up against the competition
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">Emails/mo</TableHead>
                                            <TableHead className="text-center font-bold bg-primary/10">SendBase</TableHead>
                                            <TableHead className="text-center">Resend</TableHead>
                                            <TableHead className="text-center">SMTP2Go</TableHead>
                                            <TableHead className="text-center">SendGrid</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {priceComparison.map((row) => (
                                            <TableRow key={row.volume}>
                                                <TableCell className="font-medium">{row.volume}</TableCell>
                                                <TableCell className="text-center font-semibold bg-primary/10">
                                                    {row.sendbase}
                                                </TableCell>
                                                <TableCell className="text-center">{row.resend}</TableCell>
                                                <TableCell className="text-center">{row.smtp2go}</TableCell>
                                                <TableCell className="text-center">{row.sendgrid}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Prices shown are for transactional email plans. Competitor pricing as of December 2024.
                        </p>
                    </div>
                </div>
            </section>

            {/* Feature Comparison Section */}
            <section className="w-full py-16 md:py-24 border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
                        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
                            Feature comparison
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            Everything you need to send email at scale
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[180px]">Feature</TableHead>
                                            <TableHead className="text-center font-bold bg-primary/10">SendBase</TableHead>
                                            <TableHead className="text-center">Resend</TableHead>
                                            <TableHead className="text-center">SMTP2Go</TableHead>
                                            <TableHead className="text-center">SendGrid</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {featureComparison.map((row) => (
                                            <TableRow key={row.feature}>
                                                <TableCell className="font-medium">{row.feature}</TableCell>
                                                <TableCell className="text-center bg-primary/10">
                                                    {renderFeatureValue(row.sendbase)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {renderFeatureValue(row.resend)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {renderFeatureValue(row.smtp2go)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {renderFeatureValue(row.sendgrid)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="w-full py-16 md:py-24 border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
                        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
                            Frequently asked questions
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-2">What counts as an email?</h3>
                            <p className="text-muted-foreground">
                                Each email sent to one recipient counts as one email. If you send an email to 3 recipients, that counts as 3 emails. Bounced emails and failed deliveries do not count against your quota.
                            </p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade anytime?</h3>
                            <p className="text-muted-foreground">
                                Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated difference. When you downgrade, the change takes effect at the start of your next billing cycle.
                            </p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-2">What happens if I exceed my email limit?</h3>
                            <p className="text-muted-foreground">
                                We'll notify you when you're approaching your limit. On paid plans, you can enable overage billing to continue sending at a per-email rate. On the Starter plan, you can upgrade to Growth for more volume.
                            </p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-2">Do you offer volume discounts?</h3>
                            <p className="text-muted-foreground">
                                Yes! For high-volume senders (500K+ emails/month), we offer custom Enterprise pricing with significant discounts. Contact our sales team to discuss your needs.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-16 md:py-24 border-t">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
                            Ready to get started?
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            Start sending emails in minutes. No credit card required.
                        </p>
                        <div className="flex gap-4 mt-4">
                            <Link to="/login">
                                <Button size="lg">
                                    Start Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <a href="https://docs.sendbase.app" target="_blank" rel="noopener noreferrer">
                                <Button size="lg" variant="outline">
                                    View Documentation
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
                                    <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Features
                                    </Link>
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
                            <Mail className="h-5 w-5" />
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
