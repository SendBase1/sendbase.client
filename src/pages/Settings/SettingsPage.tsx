import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { tenantsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, UserPlus, Mail, X, Copy, Check } from 'lucide-react';
import type { TenantRole, TenantMemberResponse, TenantInvitationResponse } from '@/lib/types';

export function SettingsPage() {
  const { currentTenant, userId } = useAuth();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TenantRole>('Viewer');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const tenantId = currentTenant?.id;

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['tenant-members', tenantId],
    queryFn: () => tenantsApi.getMembers(tenantId!),
    enabled: !!tenantId,
  });

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['tenant-invitations', tenantId],
    queryFn: () => tenantsApi.getPendingInvitations(tenantId!),
    enabled: !!tenantId,
  });

  const { data: currentTenantData } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => tenantsApi.getById(tenantId!),
    enabled: !!tenantId,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: TenantRole }) =>
      tenantsApi.sendInvitation(tenantId!, email, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations', tenantId] });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('Viewer');
      // Show the invitation link
      if (data.token) {
        const inviteUrl = `${window.location.origin}/invitations/accept?token=${data.token}`;
        navigator.clipboard.writeText(inviteUrl);
        toast.info('Invitation link copied to clipboard');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => tenantsApi.revokeInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations', tenantId] });
      toast.success('Invitation revoked');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberUserId: string) => tenantsApi.removeMember(tenantId!, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
      toast.success('Member removed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberUserId, role }: { memberUserId: string; role: TenantRole }) =>
      tenantsApi.updateMemberRole(tenantId!, memberUserId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
      toast.success('Role updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const canManageMembers = currentTenantData?.current_user_role === 'Owner' || currentTenantData?.current_user_role === 'Admin';

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invitations/accept?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    toast.success('Invite link copied');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getRoleBadgeVariant = (role: TenantRole) => {
    switch (role) {
      case 'Owner': return 'default';
      case 'Admin': return 'secondary';
      default: return 'outline';
    }
  };

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your team settings and members</p>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage who has access to this workspace
                  </CardDescription>
                </div>
                {canManageMembers && (
                  <Button onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      {canManageMembers && <TableHead className="w-[100px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member: TenantMemberResponse) => (
                      <TableRow key={member.user_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {canManageMembers && member.user_id !== userId && member.role !== 'Owner' ? (
                            <Select
                              value={member.role}
                              onValueChange={(value: TenantRole) =>
                                updateRoleMutation.mutate({ memberUserId: member.user_id, role: value })
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(member.joined_at_utc).toLocaleDateString()}
                        </TableCell>
                        {canManageMembers && (
                          <TableCell>
                            {member.user_id !== userId && member.role !== 'Owner' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMemberMutation.mutate(member.user_id)}
                                disabled={removeMemberMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {canManageMembers && invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Invitations waiting to be accepted
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitationsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation: TenantInvitationResponse) => (
                        <TableRow key={invitation.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {invitation.invitee_email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(invitation.role)}>
                              {invitation.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(invitation.expires_at_utc).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {invitation.token && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyInviteLink(invitation.token!)}
                                >
                                  {copiedToken === invitation.token ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeMutation.mutate(invitation.id)}
                                disabled={revokeMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                General settings for your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Workspace Name</Label>
                <Input value={currentTenant?.name || ''} disabled />
                <p className="text-sm text-muted-foreground">
                  Contact support to change your workspace name
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(v: TenantRole) => setInviteRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin - Can manage members and resources</SelectItem>
                  <SelectItem value="Viewer">Viewer - Read-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
              disabled={!inviteEmail.trim() || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
