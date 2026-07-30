import { useState } from 'react';
import { useFeatureFlags, useToggleFeatureFlag } from '@workspace/frontend-core';
import { DataTable, Button, LoadingState, ErrorState, EmptyState, Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui';
import type { FeatureFlag } from '@workspace/shared-types';
import { createColumnHelper } from '@tanstack/react-table';
import { FeatureFlagForm } from '../../components/forms/FeatureFlagForm';

export function FeatureFlagsPage() {
  const { data, isLoading, error } = useFeatureFlags();
  const [createOpen, setCreateOpen] = useState(false);

  const columnHelper = createColumnHelper<FeatureFlag>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('isEnabled', {
      header: 'Status',
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {info.getValue() ? 'Enabled' : 'Disabled'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const flag = info.row.original;
        const toggleMutation = useToggleFeatureFlag(flag.id);
        
        return (
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleMutation.mutate(!flag.isEnabled);
              }}
              disabled={toggleMutation.isPending}
            >
              {flag.isEnabled ? 'Disable' : 'Enable'}
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>Edit</Button>
            <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>Delete</Button>
          </div>
        );
      },
    }),
  ];

  if (isLoading) return <LoadingState message="Loading feature flags..." />;
  if (error) return <ErrorState message="Failed to load feature flags" />;

  const isEmpty = !data || data.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
        <Button onClick={() => setCreateOpen(true)}>Create Feature Flag</Button>
      </div>

      {isEmpty ? (
        <EmptyState 
          title="No Feature Flags" 
          description="Create your first feature flag to start managing features."
          action={<Button onClick={() => setCreateOpen(true)}>Create Feature Flag</Button>}
        />
      ) : (
        <DataTable 
          columns={columns} 
          data={data} 
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
          </DialogHeader>
          <FeatureFlagForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
