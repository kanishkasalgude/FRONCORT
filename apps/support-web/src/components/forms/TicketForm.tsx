import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui';
import { useCreateTicket } from '@workspace/frontend-core';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['open', 'in_progress', 'closed']).default('open'),
  assigneeId: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export function TicketForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'medium',
      status: 'open',
    }
  });

  const createTicket = useCreateTicket();

  const onSubmit = (data: TicketFormData) => {
    createTicket.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input 
          {...register('title')} 
          className="w-full px-3 py-2 border rounded-md" 
        />
        {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          {...register('description')} 
          className="w-full px-3 py-2 border rounded-md" 
          rows={4}
        />
        {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select {...register('priority')} className="w-full px-3 py-2 border rounded-md bg-background">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        {errors.priority && <p className="text-destructive text-sm mt-1">{errors.priority.message}</p>}
      </div>

      <Button type="submit" disabled={createTicket.isPending} className="w-full">
        {createTicket.isPending ? 'Creating...' : 'Create Ticket'}
      </Button>
    </form>
  );
}
