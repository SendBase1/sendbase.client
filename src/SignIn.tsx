import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { RedirectingToLogin, ProcessingLogin } from './components/AuthTransition';
import { SEO } from '@/components/SEO';

function SignIn() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, signUp, isAuthenticated, isLoading } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Get the page they tried to visit before being redirected to login
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleSignIn = async () => {
        try {
            setIsRedirecting(true);
            // Small delay to show the transition screen
            await new Promise(resolve => setTimeout(resolve, 800));
            await login();
        } catch (error) {
            console.error('Sign in error:', error);
            setIsRedirecting(false);
        }
    };

    const handleSignUp = async () => {
        try {
            setIsRedirecting(true);
            // Small delay to show the transition screen
            await new Promise(resolve => setTimeout(resolve, 800));
            await signUp();
        } catch (error) {
            console.error('Sign up error:', error);
            setIsRedirecting(false);
        }
    };

    // Show branded redirect screen before going to Microsoft
    if (isRedirecting) {
        return <RedirectingToLogin />;
    }

    // Show branded processing screen when returning from Microsoft login
    if (isLoading) {
        return <ProcessingLogin />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <SEO
                title="Sign In"
                description="Sign in to Sendbase to manage your email API, domains, and delivery analytics. Create a free account to get started."
                canonical="/login"
            />
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
                    <Link to="/" className="flex items-center space-x-2">
                        <Mail className="h-6 w-6" />
                        <span className="font-bold">Sendbase</span>
                    </Link>
                    <div className="flex flex-1 items-center justify-end">
                        <Link to="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">
                            Welcome to Sendbase
                        </CardTitle>
                        <CardDescription>
                            Sign in or create an account to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleSignUp}
                            className="w-full"
                            size="lg"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Create Account
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleSignIn}
                            variant="outline"
                            className="w-full"
                            size="lg"
                        >
                            Sign In
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            By signing in, you agree to our{' '}
                            <Link
                                to="/terms"
                                className="text-primary underline underline-offset-4 hover:text-primary/80"
                            >
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link
                                to="/privacy"
                                className="text-primary underline underline-offset-4 hover:text-primary/80"
                            >
                                Privacy Policy
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default SignIn;
