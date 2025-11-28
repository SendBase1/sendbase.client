import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApiKeys, useApiKeyScopes, useCreateApiKey, useRevokeApiKey } from '../../hooks/useApiKeys';
import { useDomains } from '../../hooks/useDomains';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Plus, RefreshCw, Trash2, Key, Loader2, Copy, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import type { ApiKeyResponse } from '../../lib/types';

const createKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  domain_id: z.string().min(1, 'Domain is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
});

type CreateKeyFormData = z.infer<typeof createKeySchema>;

type PermissionMode = 'preset' | 'custom';

export function ApiKeysPage() {
  const { data: apiKeys, isLoading } = useApiKeys();
  const { data: scopesData } = useApiKeyScopes();
  const { data: domains } = useDomains();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('sending_only');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<{ id: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateKeyFormData>({
    resolver: zodResolver(createKeySchema),
    defaultValues: {
      name: '',
      domain_id: '',
      scopes: [],
    },
  });

  const selectedScopes = watch('scopes');

  // Get verified domains only
  const verifiedDomains = domains?.filter(d => d.verification_status === 1) || [];

  const handleCreateKey = async (data: CreateKeyFormData) => {
    try {
      const result = await createApiKey.mutateAsync(data);
      setCreatedKey(result);
      setIsCreateModalOpen(false);
      setIsSuccessModalOpen(true);
      reset();
      setPermissionMode('preset');
      setSelectedPreset('sending_only');
      setShowAdvanced(false);
      toast.success('API key created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key');
    }
  };

  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;

    try {
      await revokeApiKey.mutateAsync(keyToRevoke.id);
      toast.success('API key revoked successfully');
      setKeyToRevoke(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke API key');
    }
  };

  const handleCopyKey = async () => {
    if (createdKey?.key) {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = scopesData?.presets.find(p => p.name === presetName);
    if (preset) {
      setValue('scopes', preset.scopes);
    }
  };

  const handleModeChange = (mode: PermissionMode) => {
    setPermissionMode(mode);
    if (mode === 'preset') {
      // Reset to selected preset scopes
      const preset = scopesData?.presets.find(p => p.name === selectedPreset);
      if (preset) {
        setValue('scopes', preset.scopes);
      }
    }
  };

  const toggleScope = (scope: string) => {
    const current = selectedScopes || [];
    if (current.includes(scope)) {
      setValue('scopes', current.filter(s => s !== scope));
    } else {
      setValue('scopes', [...current, scope]);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatLastUsed = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Initialize scopes when modal opens
  const handleOpenCreateModal = () => {
    // Set default preset scopes
    const defaultPreset = scopesData?.presets.find(p => p.name === 'sending_only');
    if (defaultPreset) {
      setValue('scopes', defaultPreset.scopes);
    }
    // Set first verified domain as default
    if (verifiedDomains.length > 0) {
      setValue('domain_id', verifiedDomains[0].id);
    }
    setIsCreateModalOpen(true);
  };

  // Filter out revoked keys from display
  const activeKeys = apiKeys?.filter(k => !k.is_revoked) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground mt-1">
            Manage API keys for programmatic access to your email services
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} disabled={verifiedDomains.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Warning if no verified domains */}
      {verifiedDomains.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need at least one verified domain before you can create API keys.
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys Table */}
      {activeKeys.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {apiKey.key_preview}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{apiKey.domain_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.scopes.map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(apiKey.created_at_utc)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastUsed(apiKey.last_used_at_utc)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setKeyToRevoke({ id: apiKey.id, name: apiKey.name })}
                        disabled={revokeApiKey.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first API key to start sending emails programmatically
            </p>
            <Button onClick={handleOpenCreateModal} disabled={verifiedDomains.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create API Key Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key with specific permissions for your application.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateKey)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production API Key"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Select
                value={watch('domain_id')}
                onValueChange={(value) => setValue('domain_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  {verifiedDomains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.domain_id && (
                <p className="text-sm text-destructive">{errors.domain_id.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This API key can only send emails from this domain
              </p>
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>

              {/* Permission Presets */}
              <div className="grid gap-2">
                {scopesData?.presets.map((preset) => (
                  <div
                    key={preset.name}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      permissionMode === 'preset' && selectedPreset === preset.name
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                    onClick={() => {
                      handleModeChange('preset');
                      handlePresetChange(preset.name);
                    }}
                  >
                    <div>
                      <p className="font-medium">{preset.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        permissionMode === 'preset' && selectedPreset === preset.name
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/50'
                      }`}
                    >
                      {permissionMode === 'preset' && selectedPreset === preset.name && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  setShowAdvanced(!showAdvanced);
                  if (!showAdvanced) {
                    handleModeChange('custom');
                  }
                }}
              >
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Advanced options
              </button>

              {/* Custom Scope Selection */}
              {showAdvanced && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Select individual permissions:
                  </p>
                  <div className="grid gap-2">
                    {scopesData?.scopes.map((scope) => (
                      <div
                        key={scope.name}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedScopes?.includes(scope.name)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/50'
                        }`}
                        onClick={() => {
                          setPermissionMode('custom');
                          toggleScope(scope.name);
                        }}
                      >
                        <div>
                          <code className="text-sm font-medium">{scope.name}</code>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {scope.description}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selectedScopes?.includes(scope.name)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/50'
                          }`}
                        >
                          {selectedScopes?.includes(scope.name) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.scopes && (
                <p className="text-sm text-destructive">{errors.scopes.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                  setPermissionMode('preset');
                  setSelectedPreset('sending_only');
                  setShowAdvanced(false);
                }}
                disabled={createApiKey.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createApiKey.isPending}>
                {createApiKey.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Key'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal - Show Created Key */}
      <Dialog open={isSuccessModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsSuccessModalOpen(false);
          setCreatedKey(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              API Key Created
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive" className="border-yellow-500 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                Make sure to copy your API key now. You won't be able to see it again!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={createdKey?.key || ''}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Name</Label>
              <p className="text-sm">{createdKey?.name}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Domain</Label>
              <p className="text-sm">{createdKey?.domain_name}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Permissions</Label>
              <div className="flex flex-wrap gap-1">
                {createdKey?.scopes.map((scope) => (
                  <Badge key={scope} variant="secondary" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setIsSuccessModalOpen(false);
              setCreatedKey(null);
            }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <ConfirmDialog
        open={!!keyToRevoke}
        onOpenChange={(open) => !open && setKeyToRevoke(null)}
        title="Revoke API Key"
        description="This action cannot be undone. Any applications using this API key will no longer be able to authenticate."
        confirmText={keyToRevoke?.name || ''}
        confirmLabel="Type the API key name to confirm"
        onConfirm={handleRevokeKey}
        isLoading={revokeApiKey.isPending}
        variant="danger"
      />
    </div>
  );
}
