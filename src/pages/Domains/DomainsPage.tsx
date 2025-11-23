import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDomains, useCreateDomain, useDeleteDomain, useVerifyDomain } from '../../hooks/useDomains';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Plus, RefreshCw, Trash2, ExternalLink, Database, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

const domainSchema = z.object({
  domain: z.string()
    .min(3, 'Domain must be at least 3 characters')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      'Invalid domain format (e.g., example.com)'
    ),
  region: z.string().min(1, 'Region is required'),
});

type DomainFormData = z.infer<typeof domainSchema>;

export function DomainsPage() {
  const navigate = useNavigate();
  const { data: domains, isLoading } = useDomains();
  const createDomain = useCreateDomain();
  const deleteDomain = useDeleteDomain();
  const verifyDomain = useVerifyDomain();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: '',
      region: 'us-west-2',
    },
  });

  const selectedRegion = watch('region');

  // Check if this is the first domain in the selected region
  const isFirstDomainInRegion = (region: string) => {
    return !domains?.some(d => d.region === region);
  };

  const handleAddDomain = async (data: DomainFormData) => {
    const isFirstInRegion = isFirstDomainInRegion(data.region);

    try {
      await createDomain.mutateAsync(data);
      setIsAddModalOpen(false);
      reset();

      // Enhanced success message
      if (isFirstInRegion) {
        toast.success(
          `Domain created successfully! AWS infrastructure configured for ${data.region}.`,
          { duration: 5000 }
        );
      } else {
        toast.success('Domain created successfully! Please configure DNS records.');
      }
    } catch (error: any) {
      // Enhanced error handling
      const errorMessage = error.message || 'Failed to create domain';

      if (errorMessage.includes('already exists')) {
        toast.error(`Domain ${data.domain} already exists in region ${data.region}`);
      } else if (errorMessage.includes('not enabled')) {
        toast.error(`Region ${data.region} is not enabled for your account`);
      } else if (errorMessage.includes('quota')) {
        toast.error('AWS quota exceeded. Please contact support.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleVerifyDomain = async (id: string) => {
    try {
      await verifyDomain.mutateAsync(id);
      toast.success('Domain verification status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify domain');
    }
  };

  const handleDeleteDomain = async (id: string, domain: string) => {
    if (!confirm(`Are you sure you want to delete ${domain}?`)) return;

    try {
      await deleteDomain.mutateAsync(id);
      toast.success('Domain deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete domain');
    }
  };

  const getStatusBadge = (status: number, text: string) => {
    const variants: Record<string, any> = {
      Verified: 'default',
      Success: 'default',
      Pending: 'secondary',
      Failed: 'destructive',
    };
    return (
      <Badge variant={variants[text] || 'secondary'}>
        {text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Domains</h2>
          <p className="text-gray-500 mt-1">
            Manage your verified sending domains
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {/* Domains Table */}
      {domains && domains.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>DKIM</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.domain}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {domain.region}
                    </code>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(domain.verificationStatus, domain.verificationStatusText)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(domain.dkimStatus, domain.dkimStatusText)}
                  </TableCell>
                  <TableCell>
                    {new Date(domain.createdAtUtc).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/domains/${domain.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerifyDomain(domain.id)}
                      disabled={verifyDomain.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${verifyDomain.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDomain(domain.id, domain.domain)}
                      disabled={deleteDomain.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No domains yet</h3>
          <p className="text-gray-500 mb-4">
            Add your first domain to start sending emails
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </Button>
        </div>
      )}

      {/* Add Domain Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Domain</DialogTitle>
            <DialogDescription>
              Add a domain to verify for sending emails. You'll need to configure DNS records after creation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleAddDomain)} className="space-y-4 py-4">
            {/* Informational Alert */}
            {isFirstDomainInRegion(selectedRegion) && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is your first domain in <strong>{selectedRegion}</strong>.
                  We'll automatically set up AWS infrastructure (Configuration Set) for email tracking and delivery monitoring.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                {...register('domain')}
                className={errors.domain ? 'border-red-500' : ''}
              />
              {errors.domain && (
                <p className="text-sm text-red-600">{errors.domain.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">AWS Region</Label>
              <Select
                value={selectedRegion}
                onValueChange={(value) => setValue('region', value)}
              >
                <SelectTrigger className={errors.region ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-2">APAC (Sydney)</SelectItem>
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-red-600">{errors.region.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Configuration Sets are automatically created per region for email tracking.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  reset();
                }}
                disabled={createDomain.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDomain.isPending}
              >
                {createDomain.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isFirstDomainInRegion(selectedRegion)
                      ? 'Setting up infrastructure...'
                      : 'Creating domain...'}
                  </>
                ) : (
                  'Create Domain'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
