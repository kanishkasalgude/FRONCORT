import { usePullRequests, useSharedResources } from '@workspace/frontend-core';
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { data: prData, isLoading: loadingPRs } = usePullRequests();
  const { data: sharedData, isLoading: loadingShared } = useSharedResources();

  if (loadingPRs || loadingShared) return <div className="p-4">Loading Dashboard...</div>;

  const prs = prData || [];
  const shared = sharedData || [];

  const totalPRs = prs.length;
  const pendingPRs = prs.filter(pr => (pr.status === 'DRAFT' || pr.status === 'IN_REVIEW') && (pr.currentApprovals || 0) < pr.requiredApprovals).length;
  const approvedPRs = prs.filter(pr => (pr.status === 'APPROVED' || pr.status === 'IN_REVIEW') && (pr.currentApprovals || 0) >= pr.requiredApprovals).length;
  const mergedPRs = prs.filter(pr => pr.status === 'MERGED').length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Review Console Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pull Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPRs}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingPRs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{approvedPRs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Merged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{mergedPRs}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Pull Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {prs.length === 0 ? (
              <p className="text-muted-foreground">No recent pull requests.</p>
            ) : (
              <ul className="space-y-4">
                {prs.slice(0, 5).map(pr => (
                  <li key={pr.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <Link to={`/pull-requests/${pr.id}`} className="font-medium hover:underline">
                        {pr.title || `PR ${pr.id.slice(0, 8)}`}
                      </Link>
                      <p className="text-sm text-muted-foreground">Status: {pr.status}</p>
                    </div>
                    <span className="text-sm">{new Date(pr.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Shared Resources</CardTitle>
          </CardHeader>
          <CardContent>
            {shared.length === 0 ? (
              <p className="text-muted-foreground">No recent shared resources.</p>
            ) : (
              <ul className="space-y-4">
                {shared.slice(0, 5).map(share => (
                  <li key={share.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-medium">Resource {share.resourceId}</span>
                      <p className="text-sm text-muted-foreground">Type: {share.resourceType}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">To: {share.targetOrganizationId}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
