import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui';
import { useTickets, useFeatureFlags } from '@workspace/frontend-core';
import { LoadingState, ErrorState } from '@workspace/ui';

export function DashboardPage() {
  const { data: ticketsData, isLoading: loadingTickets, error: errorTickets } = useTickets({ limit: 5 });
  const { data: flags, isLoading: loadingFlags, error: errorFlags } = useFeatureFlags();

  if (loadingTickets || loadingFlags) return <LoadingState />;
  if (errorTickets || errorFlags) return <ErrorState message="Failed to load dashboard data." />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsData?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {ticketsData?.data.map(ticket => (
              <div key={ticket.id} className="py-2 border-b last:border-0">
                <p className="font-medium">{ticket.title}</p>
                <p className="text-sm text-muted-foreground">{ticket.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            {flags?.slice(0, 5).map(flag => (
              <div key={flag.id} className="py-2 border-b last:border-0 flex justify-between">
                <span className="font-medium">{flag.name}</span>
                <span className={`text-sm ${flag.isEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {flag.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
