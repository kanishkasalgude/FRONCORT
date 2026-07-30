import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  usePullRequest, 
  useVersionHistory, 
  useApprovePullRequest,
  useRequestChanges,
  useMergePullRequest,
  useAssignReviewer
} from '@workspace/frontend-core';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@workspace/ui';

export function PullRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pr, isLoading, error } = usePullRequest(id!);
  const { data: versions } = useVersionHistory(id!);
  
  const approveMutation = useApprovePullRequest();
  const requestChangesMutation = useRequestChanges();
  const mergeMutation = useMergePullRequest();
  const assignMutation = useAssignReviewer();

  const [newReviewerId, setNewReviewerId] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (error || !pr) return <div>Error loading pull request</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pr.title}</h1>
          <p className="text-muted-foreground mt-1">
            <span className={`capitalize font-semibold mr-2 ${pr.status === 'open' ? 'text-green-600' : 'text-purple-600'}`}>
              {pr.status}
            </span>
            opened on {new Date(pr.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {pr.status === 'open' && (
            <>
              <Button variant="outline" onClick={() => requestChangesMutation.mutate({ prId: pr.id })} disabled={requestChangesMutation.isPending}>
                Request Changes
              </Button>
              <Button variant="default" onClick={() => approveMutation.mutate(pr.id)} disabled={approveMutation.isPending}>
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted-foreground/30 ml-3 space-y-6 pb-4">
                {versions?.map((v) => (
                  <div key={v.id} className="relative pl-6">
                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Version {v.versionNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        Created by {v.creator.name} on {new Date(v.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Merge Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pr.status === 'merged' ? (
                <div className="p-4 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                  This pull request has been merged.
                </div>
              ) : (
                <>
                  <div className={`p-4 rounded-md border ${pr.mergeable ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                    {pr.mergeable ? 'All requirements met. Ready to merge.' : (pr.mergeReason || 'Cannot merge at this time.')}
                  </div>
                  <Button 
                    disabled={!pr.mergeable || mergeMutation.isPending} 
                    onClick={() => mergeMutation.mutate(pr.id)}
                    className="w-full"
                  >
                    Merge Pull Request
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviewers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Approvals</span>
                <span>{pr.currentApprovals} / {pr.requiredApprovals} required</span>
              </div>
              
              <ul className="space-y-3">
                {pr.reviewers.map(r => (
                  <li key={r.id} className="flex justify-between items-center text-sm">
                    <span>{r.user.name}</span>
                    <span className={`capitalize ${r.status === 'approved' ? 'text-green-600' : r.status === 'changes_requested' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </li>
                ))}
              </ul>

              {pr.status === 'open' && (
                <div className="pt-4 border-t flex space-x-2">
                  <input 
                    className="flex-1 px-3 py-1 text-sm border rounded-md"
                    placeholder="User ID"
                    value={newReviewerId}
                    onChange={e => setNewReviewerId(e.target.value)}
                  />
                  <Button size="sm" disabled={assignMutation.isPending} onClick={() => {
                    if (newReviewerId) {
                      assignMutation.mutate({ prId: pr.id, userId: newReviewerId });
                      setNewReviewerId('');
                    }
                  }}>{assignMutation.isPending ? 'Adding...' : 'Add'}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
