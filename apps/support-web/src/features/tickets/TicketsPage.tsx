import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '@workspace/frontend-core';
import { DataTable, Button, LoadingState, ErrorState, EmptyState, Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui';
import type { Ticket } from '@workspace/shared-types';
import { createColumnHelper } from '@tanstack/react-table';
import { TicketForm } from '../../components/forms/TicketForm';

const columnHelper = createColumnHelper<Ticket>();

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    cell: info => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => <span className="capitalize">{info.getValue().replace('_', ' ')}</span>,
  }),
  columnHelper.accessor('priority', {
    header: 'Priority',
    cell: info => <span className="capitalize">{info.getValue()}</span>,
  }),
  columnHelper.accessor('assigneeId', {
    header: 'Assignee',
    cell: info => info.getValue() || 'Unassigned',
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
];

export function TicketsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useTickets();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) return <LoadingState message="Loading tickets..." />;
  if (error) return <ErrorState message="Failed to load tickets" />;

  const isEmpty = !data || data.data.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        <Button onClick={() => setCreateOpen(true)}>Create Ticket</Button>
      </div>

      {isEmpty ? (
        <EmptyState 
          title="No Tickets" 
          description="Get started by creating a new ticket."
          action={<Button onClick={() => setCreateOpen(true)}>Create Ticket</Button>}
        />
      ) : (
        <DataTable 
          columns={columns} 
          data={data.data} 
          onRowClick={(row) => navigate(`/tickets/${row.id}`)}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <TicketForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
