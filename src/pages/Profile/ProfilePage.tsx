import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  User,
  Mail,
  Building2,
  Shield,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';

interface UserProfile {
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  emailConfirmed: boolean;
  availableTenants: TenantInfo[];
}

interface TenantInfo {
  id: string;
  name: string;
}

export function ProfilePage() {
  const { userEmail } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/entraauth/me');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{profile?.name || 'Not set'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{profile?.email || userEmail}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Email Verification Status - Entra handles verification */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm">Email verified</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Verified
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Organization / Tenant */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Organizations</CardTitle>
            </div>
            <CardDescription>Your organizations</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.availableTenants && profile.availableTenants.length > 0 ? (
              <div className="space-y-3">
                {profile.availableTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                    </div>
                    {tenant.id === profile.tenantId && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Current
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No organizations found</p>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your account is secured through Microsoft Entra ID. To change your password or manage security settings, visit your Microsoft account.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://mysignins.microsoft.com/security-info', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
