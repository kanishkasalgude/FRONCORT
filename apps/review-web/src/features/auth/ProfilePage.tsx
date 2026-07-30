import { useAuth } from '@workspace/frontend-core';
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui';

export function ProfilePage() {
  const { session } = useAuth();
  
  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Name</label>
            <p className="font-medium">{session.user.name}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="font-medium">{session.user.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
