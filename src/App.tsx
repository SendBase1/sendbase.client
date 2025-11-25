import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
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

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<SignIn />} />

                        {/* Protected routes with AppLayout */}
                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/domains" element={<DomainsPage />} />
                            <Route path="/domains/:id" element={<DomainDetailsPage />} />
                            <Route path="/send" element={<SendEmailPage />} />
                            <Route path="/messages" element={<MessagesPage />} />
                            <Route path="/messages/:id" element={<MessageDetailsPage />} />
                        </Route>

                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
