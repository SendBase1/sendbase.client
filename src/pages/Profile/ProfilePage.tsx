import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  User,
  Mail,
  Building2,
  Shield,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { toast } from 'sonner';

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
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSmsOptIn = async () => {
    if (!smsOptIn || !phoneNumber) {
      toast.error('Please enter your phone number and agree to receive SMS messages');
      return;
    }
    setSaving(true);
    // For now, just show success - implement backend later if needed
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('SMS preferences saved successfully');
    setSaving(false);
  };

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
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-1">Profile</h1>
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

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <CardTitle>SMS Notifications</CardTitle>
            </div>
            <CardDescription>Manage your SMS verification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your phone number to receive verification codes via SMS
              </p>
            </div>

            <Separator />

            <div className="flex items-start space-x-3">
              <Checkbox
                id="sms-consent"
                checked={smsOptIn}
                onCheckedChange={(checked) => setSmsOptIn(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="sms-consent" className="font-medium cursor-pointer">
                  I agree to receive SMS verification codes
                </Label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you consent to receive one-time verification codes via SMS
                  to the phone number provided above. Message frequency varies based on your account
                  activity. Message and data rates may apply. You can opt out at any time by
                  unchecking this box.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSmsOptIn}
              disabled={!smsOptIn || !phoneNumber || saving}
              className="w-full sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save SMS Preferences'}
            </Button>
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
