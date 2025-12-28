import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MsalProvider } from '@azure/msal-react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { msalInstance } from '@/lib/authConfig';
import { Mail } from 'lucide-react';
import './App.css';

// Lazy load pages for code splitting
const Home = lazy(() => import('./Home'));
const SignIn = lazy(() => import('./SignIn'));
const Dashboard = lazy(() => import('./Dashboard'));
const DomainsPage = lazy(() => import('./pages/Domains/DomainsPage').then(m => ({ default: m.DomainsPage })));
const DomainDetailsPage = lazy(() => import('./pages/Domains/DomainDetailsPage').then(m => ({ default: m.DomainDetailsPage })));
const SendEmailPage = lazy(() => import('./pages/SendEmail/SendEmailPage').then(m => ({ default: m.SendEmailPage })));
const MessagesPage = lazy(() => import('./pages/Messages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const MessageDetailsPage = lazy(() => import('./pages/Messages/MessageDetailsPage').then(m => ({ default: m.MessageDetailsPage })));
const ApiKeysPage = lazy(() => import('./pages/ApiKeys/ApiKeysPage').then(m => ({ default: m.ApiKeysPage })));
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const WebhooksPage = lazy(() => import('./pages/Webhooks').then(m => ({ default: m.WebhooksPage })));
const WebhookDetailsPage = lazy(() => import('./pages/Webhooks').then(m => ({ default: m.WebhookDetailsPage })));
const TermsOfService = lazy(() => import('./pages/Legal').then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = lazy(() => import('./pages/Legal').then(m => ({ default: m.PrivacyPolicy })));
const AcceptableUsePolicy = lazy(() => import('./pages/Legal').then(m => ({ default: m.AcceptableUsePolicy })));
const ContactPage = lazy(() => import('./pages/Contact').then(m => ({ default: m.ContactPage })));
const PricingPage = lazy(() => import('./pages/Pricing/PricingPage').then(m => ({ default: m.PricingPage })));
const BillingPage = lazy(() => import('./pages/Billing/BillingPage').then(m => ({ default: m.BillingPage })));
const AcceptInvitationPage = lazy(() => import('./pages/AcceptInvitation/AcceptInvitationPage').then(m => ({ default: m.AcceptInvitationPage })));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const TemplatesPage = lazy(() => import('./pages/Templates').then(m => ({ default: m.TemplatesPage })));
const TemplateDetailsPage = lazy(() => import('./pages/Templates').then(m => ({ default: m.TemplateDetailsPage })));
const InboundMessagesPage = lazy(() => import('./pages/Inbound/InboundMessagesPage').then(m => ({ default: m.InboundMessagesPage })));

// SMS Pages
const SmsDashboardPage = lazy(() => import('./pages/Sms').then(m => ({ default: m.SmsDashboardPage })));
const SendSmsPage = lazy(() => import('./pages/Sms').then(m => ({ default: m.SendSmsPage })));
const SmsMessagesPage = lazy(() => import('./pages/Sms').then(m => ({ default: m.SmsMessagesPage })));
const SmsMessageDetailsPage = lazy(() => import('./pages/Sms').then(m => ({ default: m.SmsMessageDetailsPage })));
const SmsTemplatesPage = lazy(() => import('./pages/Sms').then(m => ({ default: m.SmsTemplatesPage })));
const SmsTemplateDetailsPage = lazy(() => import('./pages/Sms').then(m => ({ default: m.SmsTemplateDetailsPage })));
const PhoneNumbersPage = lazy(() => import('./pages/Sms').then(m => ({ default: m.PhoneNumbersPage })));

const queryClient = new QueryClient();

// Loading fallback component - minimal branded loader for lazy-loaded pages
function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border">
                <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded-full border-2 border-muted" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-foreground animate-spin" />
            </div>
        </div>
    );
}

function App() {
    return (
        <MsalProvider instance={msalInstance}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="dark">
                    <BrowserRouter>
                        <AuthProvider>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<SignIn />} />

                                {/* Legal pages - publicly accessible */}
                                <Route path="/terms" element={<TermsOfService />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/acceptable-use" element={<AcceptableUsePolicy />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/pricing" element={<PricingPage />} />

                                {/* Invitation acceptance - requires auth but not full layout */}
                                <Route path="/invitations/accept" element={
                                    <ProtectedRoute>
                                        <AcceptInvitationPage />
                                    </ProtectedRoute>
                                } />

                                {/* Protected routes with AppLayout */}
                                <Route
                                    element={
                                        <ProtectedRoute>
                                            <AppLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/domains" element={<DomainsPage />} />
                                    <Route path="/domains/:id" element={<DomainDetailsPage />} />
                                    <Route path="/send" element={<SendEmailPage />} />
                                    <Route path="/messages" element={<MessagesPage />} />
                                    <Route path="/messages/:id" element={<MessageDetailsPage />} />
                                    <Route path="/inbound" element={<InboundMessagesPage />} />
                                    <Route path="/apikeys" element={<ApiKeysPage />} />
                                    <Route path="/webhooks" element={<WebhooksPage />} />
                                    <Route path="/webhooks/:id" element={<WebhookDetailsPage />} />
                                    <Route path="/templates" element={<TemplatesPage />} />
                                    <Route path="/templates/:id" element={<TemplateDetailsPage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/billing" element={<BillingPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    {/* SMS Routes */}
                                    <Route path="/sms" element={<SmsDashboardPage />} />
                                    <Route path="/sms/send" element={<SendSmsPage />} />
                                    <Route path="/sms/messages" element={<SmsMessagesPage />} />
                                    <Route path="/sms/messages/:id" element={<SmsMessageDetailsPage />} />
                                    <Route path="/sms/templates" element={<SmsTemplatesPage />} />
                                    <Route path="/sms/templates/:id" element={<SmsTemplateDetailsPage />} />
                                    <Route path="/sms/phone-numbers" element={<PhoneNumbersPage />} />
                                </Route>

                                {/* Catch-all redirect */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </Suspense>
                        </AuthProvider>
                    </BrowserRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </MsalProvider>
    );
}

export default App;
