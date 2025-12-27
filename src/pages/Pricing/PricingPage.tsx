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
import { MessageSquare, Check, X, ArrowRight } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { SEO } from '@/components/SEO';

export function PricingPage() {
    const { theme, setTheme } = useTheme();

    const pricingPlans = [
        {
            name: 'Pay As You Go',
            price: '$0.0075',
            period: '/SMS',
            description: 'Perfect for getting started with no commitment',
            features: [
                'No monthly minimum',
                'US & Canada coverage',
                'Delivery tracking',
                'API access',
                'Email support',
                'Basic analytics',
            ],
            cta: 'Get Started',
            popular: false,
        },
        {
            name: 'Growth',
            price: '$49',
            period: '/month',
            description: 'For growing businesses with consistent volume',
            features: [
                '10,000 SMS included',
                '$0.005/SMS after included',
                'Dedicated phone number',
                'SMS templates',
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
            description: 'For large-scale SMS operations',
            features: [
                'Volume discounts',
                'Dedicated short code',
                'Custom sender ID',
                'Unlimited templates',
                '24/7 dedicated support',
                'SLA guarantee',
            ],
            cta: 'Contact Sales',
            popular: false,
        },
    ];

    const priceComparison = [
        { volume: '1,000', sendbase: '$7.50', twilio: '$8.75', vonage: '$7.80', plivo: '$7.50' },
        { volume: '10,000', sendbase: '$49*', twilio: '$87.50', vonage: '$78.00', plivo: '$75.00' },
        { volume: '50,000', sendbase: '$249', twilio: '$437.50', vonage: '$390.00', plivo: '$375.00' },
        { volume: '100,000', sendbase: 'Custom', twilio: '$875.00', vonage: '$780.00', plivo: '$750.00' },
    ];

    const featureComparison = [
        { feature: 'REST API', sendbase: true, twilio: true, vonage: true, plivo: true },
        { feature: 'Webhooks', sendbase: true, twilio: true, vonage: true, plivo: true },
        { feature: 'SMS Templates', sendbase: true, twilio: true, vonage: true, plivo: true },
        { feature: 'Two-way SMS', sendbase: 'Coming Soon', twilio: true, vonage: true, plivo: true },
        { feature: 'Delivery Reports', sendbase: true, twilio: true, vonage: true, plivo: true },
        { feature: 'Dedicated Number', sendbase: 'Growth+', twilio: '$1/mo', vonage: '$0.50/mo', plivo: '$0.80/mo' },
        { feature: 'No Monthly Fee', sendbase: true, twilio: false, vonage: false, plivo: false },
        { feature: 'Global Coverage', sendbase: 'US/CA', twilio: '180+ countries', vonage: '200+ countries', plivo: '190+ countries' },
        { feature: 'Short Code', sendbase: 'Enterprise', twilio: '$1000/mo', vonage: '$1000/mo', plivo: '$500/mo' },
        { feature: 'SDK Support', sendbase: '5 languages', twilio: '7 languages', vonage: '6 languages', plivo: '7 languages' },
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
            <SEO
                title="Pricing"
                description="Simple, transparent SMS API pricing. Pay as you go starting at $0.0075/SMS. No hidden fees, no monthly minimums."
                canonical="/pricing"
                keywords="SMS API pricing, text message API cost, SMS service pricing, Sendbase pricing"
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
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl">
                            Simple, transparent pricing
                        </h1>
                        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                            No hidden fees. No monthly minimums. Pay only for what you send.
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
                            See how our SMS pricing stacks up against the competition
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">SMS/mo</TableHead>
                                            <TableHead className="text-center font-bold bg-primary/10">SendBase</TableHead>
                                            <TableHead className="text-center">Twilio</TableHead>
                                            <TableHead className="text-center">Vonage</TableHead>
                                            <TableHead className="text-center">Plivo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {priceComparison.map((row) => (
                                            <TableRow key={row.volume}>
                                                <TableCell className="font-medium">{row.volume}</TableCell>
                                                <TableCell className="text-center font-semibold bg-primary/10">
                                                    {row.sendbase}
                                                </TableCell>
                                                <TableCell className="text-center">{row.twilio}</TableCell>
                                                <TableCell className="text-center">{row.vonage}</TableCell>
                                                <TableCell className="text-center">{row.plivo}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            * Growth plan includes 10,000 SMS. Prices for US destinations. Competitor pricing as of December 2024.
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
                            Everything you need to send SMS at scale
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
                                            <TableHead className="text-center">Twilio</TableHead>
                                            <TableHead className="text-center">Vonage</TableHead>
                                            <TableHead className="text-center">Plivo</TableHead>
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
                                                    {renderFeatureValue(row.twilio)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {renderFeatureValue(row.vonage)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {renderFeatureValue(row.plivo)}
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
                            <h3 className="font-semibold text-lg mb-2">How does SMS pricing work?</h3>
                            <p className="text-muted-foreground">
                                Each SMS message sent counts as one message. Long messages (over 160 characters) are split into multiple segments and charged accordingly. We charge per segment for accurate billing.
                            </p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-2">What countries do you support?</h3>
                            <p className="text-muted-foreground">
                                We currently support SMS delivery to the United States and Canada. International coverage is coming soon. Contact us if you need global SMS delivery.
                            </p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade anytime?</h3>
                            <p className="text-muted-foreground">
                                Yes! You can switch between plans at any time. When you upgrade, you'll be charged the prorated difference. When you downgrade, the change takes effect at the start of your next billing cycle.
                            </p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold text-lg mb-2">Do you offer volume discounts?</h3>
                            <p className="text-muted-foreground">
                                Yes! For high-volume senders (100K+ SMS/month), we offer custom Enterprise pricing with significant discounts. Contact our sales team to discuss your needs.
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
                            Start sending SMS in minutes. No credit card required.
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
