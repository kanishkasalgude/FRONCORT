import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui';

export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings are not available in this version.</p>
        </CardContent>
      </Card>
    </div>
  );
}
