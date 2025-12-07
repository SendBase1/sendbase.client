import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi, entraAuthApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCurrentTenant, isAuthenticated } = useAuth();
  const token = searchParams.get('token');
  const [accepted, setAccepted] = useState(false);

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => tenantsApi.getInvitationByToken(token!),
    enabled: !!token && isAuthenticated,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => tenantsApi.acceptInvitation(token!),
    onSuccess: async (tenant) => {
      setAccepted(true);
      // Switch to the new tenant
      try {
        const response = await entraAuthApi.switchTenant(tenant.id);
        setCurrentTenant({
          id: response.tenantId,
          name: response.tenantName,
        });
        queryClient.invalidateQueries();
        toast.success(`Welcome to ${tenant.name}!`);
        // Redirect after a short delay
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch {
        // Still redirect even if switch fails
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              Please sign in to accept this invitation
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (invitation.status !== 'Pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            {invitation.status === 'Accepted' ? (
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            ) : (
              <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            )}
            <CardTitle>
              {invitation.status === 'Accepted' ? 'Already Accepted' : 'Invitation Unavailable'}
            </CardTitle>
            <CardDescription>
              {invitation.status === 'Accepted'
                ? 'This invitation has already been accepted.'
                : invitation.status === 'Expired'
                ? 'This invitation has expired.'
                : 'This invitation has been revoked.'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <CardTitle>Welcome to {invitation.tenant_name}!</CardTitle>
            <CardDescription>
              Redirecting you to the dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Team</span>
              <span className="font-medium">{invitation.tenant_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="secondary">{invitation.role}</Badge>
            </div>
            {invitation.invited_by_email && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Invited by</span>
                <span className="text-sm">{invitation.invited_by_email}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expires</span>
              <span className="text-sm">
                {new Date(invitation.expires_at_utc).toLocaleDateString()}
              </span>
            </div>
          </div>

          {invitation.role === 'Viewer' && (
            <Alert>
              <AlertDescription>
                As a Viewer, you'll have read-only access to this team's resources.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/dashboard')}
          >
            Decline
          </Button>
          <Button
            className="flex-1"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
