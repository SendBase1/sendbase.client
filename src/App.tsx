import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';
import Home from './Home';
import SignIn from './SignIn';
import Dashboard from './Dashboard';
import { AppLayout } from './components/Layout/AppLayout';
import { DomainsPage } from './pages/Domains/DomainsPage';
import { DomainDetailsPage } from './pages/Domains/DomainDetailsPage';
import { SendEmailPage } from './pages/SendEmail/SendEmailPage';
import { MessagesPage } from './pages/Messages/MessagesPage';
import { MessageDetailsPage } from './pages/Messages/MessageDetailsPage';
import { ApiKeysPage } from './pages/ApiKeys/ApiKeysPage';
import { TermsOfService, PrivacyPolicy, AcceptableUsePolicy } from './pages/Legal';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark">
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<SignIn />} />

                            {/* Legal pages - publicly accessible */}
                            <Route path="/terms" element={<TermsOfService />} />
                            <Route path="/privacy" element={<PrivacyPolicy />} />
                            <Route path="/acceptable-use" element={<AcceptableUsePolicy />} />

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
                                <Route path="/apikeys" element={<ApiKeysPage />} />
                            </Route>

                            {/* Catch-all redirect */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
