import { useOrganization } from '../../providers/OrganizationProvider';
import { useOrganizations } from '../../hooks/useOrganizations';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, Button } from '@workspace/ui';
import { organizationsApi } from '@workspace/api-client';

export function OrganizationSwitcher() {
  const { organization, setOrganization } = useOrganization();
  const { data: orgs } = useOrganizations();

  if (!organization) return null;

  const handleSwitch = async (orgId: string) => {
    try {
      await organizationsApi.switchOrganization(orgId);
      const newOrg = orgs?.find(o => o.id === orgId);
      if (newOrg) {
        setOrganization(newOrg);
      }
    } catch (e) {
      console.error('Failed to switch organization', e);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-[200px] justify-between">
          <span className="truncate">{organization.name}</span>
          <span className="opacity-50 text-xs">▼</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs?.map(org => (
          <DropdownMenuItem 
            key={org.id} 
            onClick={() => handleSwitch(org.id)}
            className={org.id === organization.id ? "bg-accent" : ""}
          >
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
