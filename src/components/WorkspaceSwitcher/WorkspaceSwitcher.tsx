import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tenantsApi, entraAuthApi, setCurrentTenantId } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { TenantResponse } from '@/lib/types';

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const queryClient = useQueryClient();
  const { currentTenant, setCurrentTenant } = useAuth();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsApi.getAll,
  });

  const createTeamMutation = useMutation({
    mutationFn: (name: string) => tenantsApi.create(name),
    onSuccess: async (newTenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setShowNewTeamDialog(false);
      setNewTeamName('');
      // Switch to the new team
      await handleSelectTenant(newTenant);
      toast.success(`Team "${newTenant.name}" created`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSelectTenant = async (tenant: TenantResponse) => {
    try {
      const response = await entraAuthApi.switchTenant(tenant.id);
      // Update the API module's tenant ID so all subsequent requests use it
      setCurrentTenantId(response.tenantId);
      setCurrentTenant({
        id: response.tenantId,
        name: response.tenantName,
      });
      // Save to localStorage for next session
      localStorage.setItem('email_last_workspace_id', response.tenantId);
      // Refresh all queries to load data for new tenant
      queryClient.invalidateQueries();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to switch workspace');
    }
  };

  const currentTenantData = tenants.find(t => t.id === currentTenant?.id);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className="w-full justify-between"
          >
            <span className="truncate">
              {isLoading ? 'Loading...' : currentTenantData?.name || currentTenant?.name || 'Select team'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search team..." />
            <CommandList>
              <CommandEmpty>No team found.</CommandEmpty>
              <CommandGroup heading="Teams">
                {tenants.map((tenant) => (
                  <CommandItem
                    key={tenant.id}
                    onSelect={() => handleSelectTenant(tenant)}
                    className="text-sm"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentTenant?.id === tenant.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="truncate">{tenant.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowNewTeamDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
            <DialogDescription>
              Create a new team to manage your domains, API keys, and team members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTeamDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createTeamMutation.mutate(newTeamName)}
              disabled={!newTeamName.trim() || createTeamMutation.isPending}
            >
              {createTeamMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
