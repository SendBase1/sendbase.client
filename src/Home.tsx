import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function Home() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <span className="text-xl font-bold">WeatherApp</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login">
                                <Button variant="outline" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-6xl font-bold tracking-tight">
                            Welcome to WeatherApp
                        </h1>
                        <p className="text-xl text-[hsl(var(--color-muted-foreground))] max-w-2xl mx-auto">
                            Your personal weather dashboard. Track forecasts, analyze trends, and stay ahead of the weather.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Link to="/login">
                            <Button size="lg">
                                Get Started
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline">
                            Learn More
                        </Button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">
                        Everything you need
                    </h2>
                    <p className="text-[hsl(var(--color-muted-foreground))] max-w-2xl mx-auto">
                        Powerful features to help you track and understand weather patterns
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                                    <path d="M3 3v18h18"/>
                                    <path d="m19 9-5 5-4-4-3 3"/>
                                </svg>
                            </div>
                            <CardTitle>Real-time Data</CardTitle>
                            <CardDescription>
                                Get up-to-date weather information updated in real-time
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
                                </svg>
                            </div>
                            <CardTitle>5-Day Forecast</CardTitle>
                            <CardDescription>
                                Plan ahead with detailed forecasts for the next 5 days
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                                    <path d="M3 9h18"/>
                                    <path d="M9 21V9"/>
                                </svg>
                            </div>
                            <CardTitle>Clean Interface</CardTitle>
                            <CardDescription>
                                Beautiful, intuitive design that makes weather tracking easy
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            {/* CTA Section */}
            <div className="border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
                        <CardHeader className="text-center space-y-4 py-12">
                            <CardTitle className="text-3xl">
                                Ready to get started?
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Sign in to access your personalized weather dashboard
                            </CardDescription>
                            <div className="pt-4">
                                <Link to="/login">
                                    <Button size="lg">
                                        Sign In Now
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-sm text-[hsl(var(--color-muted-foreground))]">
                        <p>&copy; 2025 WeatherApp. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
