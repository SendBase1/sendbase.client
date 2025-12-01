import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useSubscription,
  useUsage,
  useBillingPlans,
  useInvoices,
  usePlanLimits,
  useCreateCheckoutSession,
  useChangePlan,
  useCancelSubscription,
  useReactivateSubscription,
  useCreatePortalSession,
} from '../../hooks/useBilling';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
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
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  RefreshCw,
  CreditCard,
  BarChart3,
  Receipt,
  Check,
  AlertTriangle,
  ExternalLink,
  Zap,
  Building2,
  Rocket,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BillingPlanResponse } from '../../lib/types';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getPlanIcon(planName: string) {
  const icons: Record<string, React.ReactNode> = {
    starter: <Zap className="h-6 w-6" />,
    growth: <Rocket className="h-6 w-6" />,
    enterprise: <Building2 className="h-6 w-6" />,
  };
  return icons[planName.toLowerCase()] || <Zap className="h-6 w-6" />;
}

interface UserProfile {
  user_id: string;
  email: string;
  user_name: string;
  tenant_id: string;
  email_confirmed: boolean;
}

export function BillingPage() {
  const { userEmail } = useAuth();
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/auth/me');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: usage, isLoading: usageLoading } = useUsage();
  const { data: plans, isLoading: plansLoading } = useBillingPlans();
  const { data: invoices } = useInvoices();
  const { data: limits } = usePlanLimits();

  const createCheckout = useCreateCheckoutSession();
  const changePlan = useChangePlan();
  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const createPortal = useCreatePortalSession();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanResponse | null>(null);

  const isLoading = subLoading || usageLoading || plansLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubscribe = (plan: BillingPlanResponse) => {
    if (plan.stripePaymentLinkUrl) {
      if (!profile?.tenant_id) {
        toast.error('Unable to load account information. Please refresh and try again.');
        return;
      }
      const url = new URL(plan.stripePaymentLinkUrl);
      if (userEmail) {
        url.searchParams.set('prefilled_email', userEmail);
      }
      url.searchParams.set('client_reference_id', profile.tenant_id);
      window.open(url.toString(), '_blank');
    } else {
      createCheckout.mutate({
        planId: plan.id,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
      });
    }
  };

  const handleChangePlan = () => {
    if (!selectedPlan) return;
    changePlan.mutate(
      { newPlanId: selectedPlan.id },
      {
        onSuccess: () => {
          toast.success('Plan changed successfully');
          setShowChangePlanDialog(false);
          setSelectedPlan(null);
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleCancel = () => {
    cancelSubscription.mutate(
      { cancelImmediately: false },
      {
        onSuccess: () => {
          toast.success('Subscription will be canceled at the end of the billing period');
          setShowCancelDialog(false);
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleReactivate = () => {
    reactivateSubscription.mutate(undefined, {
      onSuccess: () => {
        toast.success('Subscription reactivated');
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  const handleManageBilling = () => {
    createPortal.mutate({
      returnUrl: `${window.location.origin}/billing`,
    });
  };

  const openChangePlanDialog = (plan: BillingPlanResponse) => {
    setSelectedPlan(plan);
    setShowChangePlanDialog(true);
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and billing details
          </p>
        </div>
        {subscription && (
          <Button onClick={handleManageBilling} disabled={createPortal.isPending}>
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Payment Methods
          </Button>
        )}
      </div>

      {/* Subscription Status */}
      {subscription ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Current Plan: {subscription.plan.displayName}
                  {subscription.cancelAtPeriodEnd && (
                    <Badge variant="destructive">Canceling</Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {formatCurrency(subscription.plan.monthlyPriceCents)}/month
                  {' '}&bull;{' '}
                  {formatNumber(subscription.plan.includedEmails)} emails included
                </CardDescription>
              </div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.cancelAtPeriodEnd && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReactivate}
                    disabled={reactivateSubscription.isPending}
                  >
                    Reactivate
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              Current period: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            {!subscription.cancelAtPeriodEnd && (
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Subscription
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have an active subscription. Choose a plan below to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Summary */}
      {usage && subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage This Period
            </CardTitle>
            <CardDescription>
              {formatDate(usage.currentPeriodStart)} - {formatDate(usage.currentPeriodEnd)}
              {' '}({usage.daysRemainingInPeriod} days remaining)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Emails Sent</span>
                  <span>
                    {formatNumber(usage.emailsSent)} / {formatNumber(usage.emailsIncluded)}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      usage.usagePercentage >= 90
                        ? 'bg-destructive'
                        : usage.usagePercentage >= 75
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(usage.usagePercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatNumber(usage.emailsSent)}</div>
                  <div className="text-xs text-muted-foreground">Emails Sent</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatNumber(usage.emailsRemaining)}</div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatNumber(usage.overageEmails)}</div>
                  <div className="text-xs text-muted-foreground">Overage Emails</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(usage.estimatedOverageCostCents)}</div>
                  <div className="text-xs text-muted-foreground">Est. Overage Cost</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Limits */}
      {limits && subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Limits</CardTitle>
            <CardDescription>Your current resource usage and limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Domains</div>
                <div className="text-xl font-semibold">
                  {limits.currentDomains} / {limits.maxDomains}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">API Keys</div>
                <div className="text-xl font-semibold">
                  {limits.currentApiKeys} / {limits.maxApiKeys}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Webhooks</div>
                <div className="text-xl font-semibold">
                  {limits.currentWebhookEndpoints} / {limits.maxWebhookEndpoints}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Team Members</div>
                <div className="text-xl font-semibold">
                  {limits.currentTeamMembers} / {limits.maxTeamMembers}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          {subscription ? 'Change Plan' : 'Choose a Plan'}
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const isCurrentPlan = subscription?.plan.id === plan.id;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${isCurrentPlan ? 'border-primary' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Current Plan</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle>{plan.displayName}</CardTitle>
                  <div className="mt-2">
                    {plan.name.toLowerCase() === 'enterprise' ? (
                      <span className="text-3xl font-bold">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">
                          {formatCurrency(plan.monthlyPriceCents)}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  <p className="text-sm text-muted-foreground text-center">
                    {plan.description}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {formatNumber(plan.includedEmails)} emails/month
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {plan.maxDomains} domain{plan.maxDomains !== 1 ? 's' : ''}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {plan.maxApiKeys} API key{plan.maxApiKeys !== 1 ? 's' : ''}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {plan.maxWebhooks} webhook{plan.maxWebhooks !== 1 ? 's' : ''}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {plan.maxTeamMembers} team member{plan.maxTeamMembers !== 1 ? 's' : ''}
                    </li>
                    {plan.hasDedicatedIp && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Dedicated IP address
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {plan.supportLevel} support
                    </li>
                  </ul>
                  {plan.name.toLowerCase() !== 'enterprise' && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      {formatCurrency(plan.overageRateCentsPer1K)}/1,000 additional emails
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  {plan.name.toLowerCase() === 'enterprise' ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      asChild
                    >
                      <a href="mailto:sales@socialhq.app?subject=Enterprise Plan Inquiry">
                        Contact Sales
                      </a>
                    </Button>
                  ) : !subscription ? (
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan)}
                      disabled={createCheckout.isPending}
                    >
                      Subscribe
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => openChangePlanDialog(plan)}
                    >
                      Switch to {plan.displayName}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invoices */}
      {invoices && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>
                      {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.totalCents)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'default'
                            : invoice.status === 'open'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.hostedInvoiceUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access
              until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelSubscription.isPending}
            >
              {cancelSubscription.isPending ? 'Canceling...' : 'Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <>
                  You're about to switch to the <strong>{selectedPlan.displayName}</strong> plan
                  at {formatCurrency(selectedPlan.monthlyPriceCents)}/month.
                  {subscription && selectedPlan.monthlyPriceCents > subscription.plan.monthlyPriceCents
                    ? ' You will be charged a prorated amount for the remainder of this billing period.'
                    : ' Your account will be credited for the remainder of your current plan.'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePlanDialog(false);
                setSelectedPlan(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePlan}
              disabled={changePlan.isPending}
            >
              {changePlan.isPending ? 'Changing...' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
