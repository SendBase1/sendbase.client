import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const endpoint = isRegistering ? `${apiBaseUrl}/api/auth/register` : `${apiBaseUrl}/api/auth/login`;
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

                // Store the token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userId', data.userId);

                setSuccess(isRegistering ? 'Registration successful!' : 'Login successful!');

                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
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
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-2 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </CardTitle>
                    <CardDescription>
                        {isRegistering
                            ? 'Sign up to get started with your account'
                            : 'Sign in to access your dashboard'
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
                                <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
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

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        {isRegistering ? (
                            <p className="text-[hsl(var(--color-muted-foreground))]">
                                Already have an account?{' '}
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => {
                                        setIsRegistering(false);
                                        setError(null);
                                        setSuccess(null);
                                        setConfirmPassword('');
                                    }}
                                    className="p-0 h-auto font-semibold"
                                >
                                    Sign In
                                </Button>
                            </p>
                        ) : (
                            <p className="text-[hsl(var(--color-muted-foreground))]">
                                Don't have an account?{' '}
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => {
                                        setIsRegistering(true);
                                        setError(null);
                                        setSuccess(null);
                                        setConfirmPassword('');
                                    }}
                                    className="p-0 h-auto font-semibold"
                                >
                                    Register
                                </Button>
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default SignIn;
