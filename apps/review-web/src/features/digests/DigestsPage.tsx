import { useDigests } from '@workspace/frontend-core';
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui';

export function DigestsPage() {
  const { data, isLoading, error } = useDigests();

  if (isLoading) return <div>Loading digests...</div>;
  if (error) return <div>Error loading digests</div>;

  const digests = data?.data || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Organization Digests</h1>
      </div>

      {digests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No digests available for your organization.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {digests.map(digest => (
            <Card key={digest.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{digest.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(digest.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {digest.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
