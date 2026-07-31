import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Organization } from '@workspace/shared-types';
import { useQueryClient } from '@tanstack/react-query';

interface OrganizationContextType {
  organization: Organization | null;
  setOrganization: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganizationState] = useState<Organization | null>(null);
  const queryClient = useQueryClient();

  const setOrganization = useCallback(
    (org: Organization) => {
      setOrganizationState(org);
      // Clear all queries to ensure strict data isolation when switching orgs (prevents stale data flash)
      queryClient.clear();
    },
    [queryClient]
  );

  return (
    <OrganizationContext.Provider value={{ organization, setOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
