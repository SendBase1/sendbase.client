import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { fetchWithAuth } from '@/lib/api';

interface Forecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

function Dashboard() {
    const navigate = useNavigate();
    const [forecasts, setForecasts] = useState<Forecast[]>();
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('authToken');
        const email = localStorage.getItem('userEmail');

        if (!token || !email) {
            navigate('/login');
            return;
        }

        setUserEmail(email);
        populateWeatherData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        navigate('/');
    };

    async function populateWeatherData() {
        try {
            const response = await fetchWithAuth('/weatherforecast');
            if (response.ok) {
                const data = await response.json();
                setForecasts(data);
            } else {
                console.error('Failed to fetch weather data');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    const contents = forecasts === undefined
        ? <div className="flex items-center justify-center py-8">
            <p className="text-[hsl(var(--color-muted-foreground))]">Loading weather data...</p>
          </div>
        : <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Temp. (C)</TableHead>
                    <TableHead>Temp. (F)</TableHead>
                    <TableHead>Summary</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {forecasts.map(forecast =>
                    <TableRow key={forecast.date}>
                        <TableCell className="font-medium">{new Date(forecast.date).toLocaleDateString()}</TableCell>
                        <TableCell>{forecast.temperatureC}°</TableCell>
                        <TableCell>{forecast.temperatureF}°</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))]">
                                {forecast.summary}
                            </span>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                        >
                            ← Back to Home
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Weather Dashboard</h1>
                            <p className="text-[hsl(var(--color-muted-foreground))] mt-1">
                                Real-time weather forecast data
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">Welcome back,</p>
                            <p className="font-medium">{userEmail}</p>
                        </div>
                        <Button onClick={handleLogout} variant="outline">
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Weather Card */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>5-Day Weather Forecast</CardTitle>
                        <CardDescription>
                            Temperature readings and weather conditions for the next 5 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {contents}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;
