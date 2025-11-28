import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, ArrowLeft } from 'lucide-react';
import { config } from '@/lib/config';
import { useAuth } from './contexts/AuthContext';

interface AuthResponse {
    token: string;
    email: string;
    userId: string;
    expiration: string;
}

interface ErrorResponse {
    message: string;
    errors?: string[];
}

function SignIn() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Get the page they tried to visit before being redirected to login
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const endpoint = isRegistering
                ? `${config.apiBaseUrl}${config.api.auth.register}`
                : `${config.apiBaseUrl}${config.api.auth.login}`;
            const body = isRegistering
                ? { email, password, confirmPassword }
                : { email, password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const data: AuthResponse = await response.json();

                // Use AuthContext login function
                login(data.token, data.email, data.userId);

                setSuccess(isRegistering ? 'Registration successful!' : 'Login successful!');

                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 500);
            } else {
                const errorData: ErrorResponse = await response.json();
                setError(errorData.message || 'Authentication failed');

                if (errorData.errors && errorData.errors.length > 0) {
                    setError(`${errorData.message}: ${errorData.errors.join(', ')}`);
                }
            }
        } catch (err) {
            setError('An error occurred. Please check if the server is running.');
            console.error('Auth error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
                    <Link to="/" className="flex items-center space-x-2">
                        <Mail className="h-6 w-6" />
                        <span className="font-bold">EmailAPI</span>
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
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            {isRegistering ? 'Create an account' : 'Welcome back'}
                        </CardTitle>
                        <CardDescription>
                            {isRegistering
                                ? 'Enter your email below to create your account'
                                : 'Enter your email below to sign in to your account'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    placeholder="name@example.com"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    placeholder="Enter your password"
                                    minLength={6}
                                    className="w-full"
                                />
                                {isRegistering && (
                                    <p className="text-xs text-muted-foreground">
                                        Must be at least 6 characters with uppercase, lowercase, and a digit
                                    </p>
                                )}
                            </div>

                            {isRegistering && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        placeholder="Confirm your password"
                                        minLength={6}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {isRegistering && (
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm leading-tight cursor-pointer"
                                    >
                                        I agree to the{' '}
                                        <Link
                                            to="/terms"
                                            target="_blank"
                                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                                        >
                                            Terms of Service
                                        </Link>
                                        ,{' '}
                                        <Link
                                            to="/privacy"
                                            target="_blank"
                                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                                        >
                                            Privacy Policy
                                        </Link>
                                        , and{' '}
                                        <Link
                                            to="/acceptable-use"
                                            target="_blank"
                                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                                        >
                                            Acceptable Use Policy
                                        </Link>
                                    </label>
                                </div>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert>
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || (isRegistering && !acceptedTerms)}
                            >
                                {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm">
                            {isRegistering ? (
                                <p className="text-muted-foreground">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegistering(false);
                                            setError(null);
                                            setSuccess(null);
                                            setConfirmPassword('');
                                            setAcceptedTerms(false);
                                        }}
                                        className="underline underline-offset-4 hover:text-primary"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegistering(true);
                                            setError(null);
                                            setSuccess(null);
                                            setConfirmPassword('');
                                        }}
                                        className="underline underline-offset-4 hover:text-primary"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default SignIn;
