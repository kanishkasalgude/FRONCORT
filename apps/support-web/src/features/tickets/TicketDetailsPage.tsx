import { useParams, Link } from 'react-router-dom';
import { useTicket, useComments, useTicketAttachments } from '@workspace/frontend-core';
import { LoadingState, ErrorState, Card, CardHeader, CardTitle, CardContent, Button } from '@workspace/ui';

export function TicketDetailsPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { data: ticket, isLoading, error } = useTicket(ticketId!);
  const { data: comments, isLoading: loadingComments } = useComments(ticketId!);
  const { data: attachments, isLoading: loadingAttachments } = useTicketAttachments(ticketId!);
  

  if (isLoading) return <LoadingState message="Loading ticket details..." />;
  if (error || !ticket) return <ErrorState message="Failed to load ticket" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <Link to="/tickets" className="hover:underline">Tickets</Link>
        <span>/</span>
        <span>{ticket.id}</span>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
          <p className="text-muted-foreground mt-2">
            Created by {ticket.creatorId} on {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Edit</Button>
          <Button variant="outline">Assign</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingComments ? <LoadingState /> : comments?.length === 0 ? (
                <p className="text-muted-foreground">No comments yet.</p>
              ) : (
                comments?.map(comment => (
                  <div key={comment.id} className="p-4 border rounded-md">
                    <p className="text-sm font-semibold">{comment.authorId}</p>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{ticket.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assignee</span>
                <span className="font-medium">{ticket.assigneeId || 'Unassigned'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingAttachments ? <LoadingState /> : attachments?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attachments.</p>
              ) : (
                attachments?.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                    <span className="truncate max-w-[150px]" title={attachment.filename}>{attachment.filename}</span>
                    <a href={attachment.downloadUrl} className="text-primary hover:underline">Download</a>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
