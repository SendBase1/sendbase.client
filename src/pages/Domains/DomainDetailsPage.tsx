import { useParams, useNavigate } from 'react-router-dom';
import { useDomain, useVerifyDomain } from '../../hooks/useDomains';
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
import { ArrowLeft, RefreshCw, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export function DomainDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: domain, isLoading } = useDomain(id!);
  const verifyDomain = useVerifyDomain();
  const [copiedRecord, setCopiedRecord] = useState<number | null>(null);

  const handleVerifyDomain = async () => {
    if (!id) return;
    try {
      await verifyDomain.mutateAsync(id);
      toast.success('Domain verification status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify domain');
    }
  };

  const copyToClipboard = async (text: string, recordId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRecord(recordId);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedRecord(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStatusBadge = (_status: number, text: string) => {
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
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/domains')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Domains
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Domain not found</h3>
            <p className="text-muted-foreground">
              The domain you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVerified = domain.verificationStatus === 1 && domain.dkimStatus === 1;

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/domains')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{domain.domain}</h2>
            <p className="text-muted-foreground mt-1">
              Domain verification and DNS configuration
            </p>
          </div>
        </div>
        <Button
          onClick={handleVerifyDomain}
          disabled={verifyDomain.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${verifyDomain.isPending ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Domain Verification</p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(domain.verificationStatus, domain.verificationStatusText)}
                  {domain.verificationStatus === 1 && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">DKIM Status</p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(domain.dkimStatus, domain.dkimStatusText)}
                  {domain.dkimStatus === 1 && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Region</p>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {domain.region}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Alert */}
      {!isVerified && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">DNS Configuration Required</h4>
              <p className="text-sm text-blue-800 mb-2">
                Add the following DNS records to your domain's DNS settings. It may take up to 72 hours for DNS changes to propagate.
              </p>
              <p className="text-sm text-blue-800">
                Click the copy button next to each record to copy the value to your clipboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Domain Verified</h4>
              <p className="text-sm text-green-800">
                Your domain is verified and ready to send emails. All DNS records are properly configured.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DNS Records Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">DNS Records</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add these records to your DNS provider to verify your domain
            </p>
          </div>

          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Host/Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domain.dnsRecords && domain.dnsRecords.length > 0 ? (
              domain.dnsRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {record.recordType}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono max-w-xs truncate">
                        {record.host}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(record.host, record.id * 2)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedRecord === record.id * 2 ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono max-w-md truncate">
                        {record.value}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(record.value, record.id * 2 + 1)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedRecord === record.id * 2 + 1 ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.status, record.statusText)}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.required && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No DNS records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground mb-1">Created</dt>
              <dd className="text-sm font-medium">
                {new Date(domain.createdAtUtc).toLocaleString()}
              </dd>
            </div>
            {domain.verifiedAtUtc && (
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Verified</dt>
                <dd className="text-sm font-medium">
                  {new Date(domain.verifiedAtUtc).toLocaleString()}
                </dd>
              </div>
            )}
            {domain.mailFromSubdomain && (
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Mail From Subdomain</dt>
                <dd className="text-sm font-medium font-mono">
                  {domain.mailFromSubdomain}
                </dd>
              </div>
            )}
            {domain.identityArn && (
              <div className="md:col-span-2">
                <dt className="text-sm text-muted-foreground mb-1">AWS Identity ARN</dt>
                <dd className="text-xs font-mono bg-muted px-3 py-2 rounded break-all">
                  {domain.identityArn}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
