import { useState } from 'react';
import { useSharedResources, useShareResource, useRevokeShare } from '@workspace/frontend-core';
import { useOrganizations } from '@workspace/frontend-core';
import { Button, Card, CardHeader, CardTitle, CardContent, DataTable } from '@workspace/ui';
import type { ResourceShare } from '@workspace/shared-types';
import type { ColumnDef } from '@tanstack/react-table';

export function SharedResourcesPage() {
  const { data, isLoading } = useSharedResources();
  const { data: organizations } = useOrganizations();
  const shareMutation = useShareResource();
  const revokeMutation = useRevokeShare();
  
  const [isSharing, setIsSharing] = useState(false);
  const [resourceId, setResourceId] = useState('');
  const [resourceType, setResourceType] = useState<'ticket' | 'pull_request'>('pull_request');
  const [targetOrgId, setTargetOrgId] = useState('');
  const [permissions, setPermissions] = useState<'read' | 'write' | 'admin'>('read');

  if (isLoading) return <div>Loading...</div>;

  const shared = data || [];

  const columns: ColumnDef<ResourceShare>[] = [
    { accessorKey: 'resourceId', header: 'Resource ID' },
    { accessorKey: 'resourceType', header: 'Type' },
    { accessorKey: 'targetOrganizationId', header: 'Shared With Org ID' },
    { accessorKey: 'permissions', header: 'Permissions' },
    { accessorKey: 'createdAt', header: 'Shared On', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive"
          disabled={revokeMutation.isPending}
          onClick={() => revokeMutation.mutate({ resourceId: row.original.resourceId, shareId: row.original.id })}
        >
          {revokeMutation.isPending ? 'Revoking...' : 'Revoke'}
        </Button>
      )
    }
  ];

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrgId) return;
    shareMutation.mutate({
      resourceId,
      resourceType,
      targetOrganizationId: targetOrgId,
      permissions
    }, {
      onSuccess: () => {
        setIsSharing(false);
        setResourceId('');
        setTargetOrgId('');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Shared Resources</h1>
        <Button onClick={() => setIsSharing(!isSharing)}>
          {isSharing ? 'Cancel' : 'Share Resource'}
        </Button>
      </div>

      {isSharing && (
        <Card>
          <CardHeader>
            <CardTitle>Share a Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleShare} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Resource ID</label>
                <input 
                  required
                  value={resourceId}
                  onChange={e => setResourceId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md" 
                  placeholder="e.g. PR-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md bg-transparent"
                  value={resourceType}
                  onChange={e => setResourceType(e.target.value as any)}
                >
                  <option value="pull_request">Pull Request</option>
                  <option value="ticket">Ticket</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Organization</label>
                <select 
                  required
                  className="w-full px-3 py-2 border rounded-md bg-transparent"
                  value={targetOrgId}
                  onChange={e => setTargetOrgId(e.target.value)}
                >
                  <option value="" disabled>Select an Organization</option>
                  {organizations?.map(org => (
                    <option key={org.id} value={org.id}>{org.name} ({org.slug})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Permissions</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md bg-transparent"
                  value={permissions}
                  onChange={e => setPermissions(e.target.value as any)}
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" disabled={shareMutation.isPending}>
                {shareMutation.isPending ? 'Sharing...' : 'Confirm Share'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="bg-card rounded-md border shadow-sm">
        <DataTable columns={columns} data={shared} />
      </div>
    </div>
  );
}
