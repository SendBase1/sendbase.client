import { useState } from 'react';
import { useSmsPhoneNumbers, useSetDefaultPhoneNumber, useProvisionPhoneNumber, useReleasePhoneNumber } from '../../hooks/useSmsPhoneNumbers';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
import { Label } from '../../components/ui/label';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Phone, RefreshCw, Star, Info, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { parseUtcDate } from '../../lib/utils';
import { formatPhoneDisplay } from '../../lib/smsUtils';
import { toast } from 'sonner';

export function PhoneNumbersPage() {
  const { data: phoneNumbersData, isLoading, refetch } = useSmsPhoneNumbers();
  const setDefaultMutation = useSetDefaultPhoneNumber();
  const provisionMutation = useProvisionPhoneNumber();
  const releaseMutation = useReleasePhoneNumber();

  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [releasePhoneId, setReleasePhoneId] = useState<string | null>(null);
  const [numberType, setNumberType] = useState<'TollFree' | 'LongCode'>('TollFree');
  const [country, setCountry] = useState('US');

  const phoneNumbers = phoneNumbersData?.phone_numbers || [];

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      toast.success('Default phone number updated');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set default';
      toast.error(errorMessage);
    }
  };

  const handleProvision = async () => {
    try {
      await provisionMutation.mutateAsync({ number_type: numberType, country });
      toast.success('Phone number provisioned successfully');
      setIsProvisionModalOpen(false);
      setNumberType('TollFree');
      setCountry('US');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to provision phone number';
      toast.error(errorMessage);
    }
  };

  const handleRelease = async () => {
    if (!releasePhoneId) return;
    try {
      await releaseMutation.mutateAsync(releasePhoneId);
      toast.success('Phone number released successfully');
      setReleasePhoneId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to release phone number';
      toast.error(errorMessage);
    }
  };

  const getNumberTypeBadge = (numberType: string) => {
    const styles: Record<string, string> = {
      TollFree: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
      ShortCode: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
      LongCode: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    };
    return (
      <Badge variant="outline" className={styles[numberType] || 'bg-muted'}>
        {numberType === 'TollFree' ? 'Toll-Free' : numberType === 'ShortCode' ? 'Short Code' : 'Long Code'}
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

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Phone Numbers</h2>
          <p className="text-muted-foreground mt-1">
            Manage your SMS sending phone numbers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsProvisionModalOpen(true)} disabled={phoneNumbers.length >= 5}>
            <Plus className="h-4 w-4 mr-2" />
            Request Phone Number
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Toll-Free Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Toll-free numbers (1-800, 1-888, etc.) are trusted for business messaging with higher deliverability rates. <span className="font-medium text-blue-400">$2/month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-500" />
              Short Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Short codes (5-6 digits) support high-volume messaging. Contact support to request a short code.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-500/20 bg-gray-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-400" />
              Long Codes (10DLC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Standard 10-digit numbers suitable for person-to-person messaging with lower throughput. <span className="font-medium text-gray-400">$1/month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phone Numbers Table */}
      {phoneNumbers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Provisioned</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phoneNumbers.map((phone) => (
                    <TableRow key={phone.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {formatPhoneDisplay(phone.phone_number)}
                          {phone.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getNumberTypeBadge(phone.number_type)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{phone.country}</Badge>
                      </TableCell>
                      <TableCell>
                        {phone.monthly_fee_display}
                      </TableCell>
                      <TableCell>
                        <Badge variant={phone.is_active ? 'default' : 'secondary'}>
                          {phone.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {phone.provisioned_at_utc
                          ? formatDistanceToNow(parseUtcDate(phone.provisioned_at_utc), { addSuffix: true })
                          : 'Not provisioned'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!phone.is_default && phone.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(phone.id)}
                              disabled={setDefaultMutation.isPending}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setReleasePhoneId(phone.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Phone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No phone numbers yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Request a phone number to start sending SMS messages. We recommend toll-free numbers for best deliverability.
            </p>
            <Button onClick={() => setIsProvisionModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Phone Number
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Provision Phone Number Modal */}
      <Dialog open={isProvisionModalOpen} onOpenChange={setIsProvisionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Phone Number</DialogTitle>
            <DialogDescription>
              Provision a new phone number for sending SMS messages. The number will be immediately available after provisioning.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="numberType">Number Type</Label>
              <Select value={numberType} onValueChange={(value) => setNumberType(value as 'TollFree' | 'LongCode')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TollFree">
                    <div className="flex flex-col">
                      <span>Toll-Free ($2/month)</span>
                      <span className="text-xs text-muted-foreground">Recommended for business messaging</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="LongCode">
                    <div className="flex flex-col">
                      <span>10DLC Long Code ($1/month)</span>
                      <span className="text-xs text-muted-foreground">Standard 10-digit number</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States (+1)</SelectItem>
                  <SelectItem value="CA">Canada (+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Pricing Summary</p>
              <p className="text-muted-foreground">
                Monthly fee: <span className="font-medium text-foreground">{numberType === 'TollFree' ? '$2.00' : '$1.00'}</span>
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Plus standard SMS rates per message sent
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProvisionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProvision} disabled={provisionMutation.isPending}>
              {provisionMutation.isPending ? 'Provisioning...' : 'Request Number'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Confirmation */}
      <ConfirmDialog
        open={!!releasePhoneId}
        onOpenChange={(open) => !open && setReleasePhoneId(null)}
        title="Release Phone Number"
        description={
          phoneNumbers.length === 1
            ? "Are you sure you want to release your only phone number? This will disable SMS sending until you provision a new number. You may not be able to get the same number back."
            : "Are you sure you want to release this phone number? This will permanently remove it from your account and you may not be able to get the same number back."
        }
        confirmText="Release"
        onConfirm={handleRelease}
        variant="danger"
      />
    </div>
  );
}
