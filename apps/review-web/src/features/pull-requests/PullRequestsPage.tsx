import { usePullRequests } from '@workspace/frontend-core';
import { DataTable } from '@workspace/ui';
import type { PullRequest } from '@workspace/shared-types';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

export function PullRequestsPage() {
  const { data, isLoading, error } = usePullRequests();

  if (isLoading) return <div>Loading pull requests...</div>;
  if (error) return <div>Error loading pull requests</div>;

  const pullRequests = data?.data || [];

  const columns: ColumnDef<PullRequest>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <Link to={`/pull-requests/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const colorClass = status === 'open' ? 'text-green-600' : status === 'merged' ? 'text-purple-600' : 'text-gray-600';
        return <span className={`capitalize font-semibold ${colorClass}`}>{status}</span>;
      }
    },
    {
      accessorKey: 'approvals',
      header: 'Approvals',
      cell: ({ row }) => (
        <span>{row.original.currentApprovals} / {row.original.requiredApprovals}</span>
      )
    },
    {
      accessorKey: 'sharingStatus',
      header: 'Sharing',
      cell: ({ row }) => <span className="capitalize">{row.original.sharingStatus.replace('_', ' ')}</span>
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pull Requests</h1>
      </div>
      
      <div className="bg-card rounded-md border shadow-sm">
        <DataTable columns={columns} data={pullRequests} />
      </div>
    </div>
  );
}
