import { useState } from 'react';
import { useAuth } from '@workspace/frontend-core';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@workspace/ui';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    navigate('/dashboard');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to Review Console</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-6">
            <Button 
              type="button"
              className="w-full flex flex-col items-center py-6 h-auto bg-slate-100 text-slate-900 hover:bg-slate-200"
              onClick={async () => {
                await login({ email: 'tony@stark.com', password: 'Password123!' });
                navigate('/dashboard');
              }}
            >
              <span className="font-semibold">Login as Stark Admin</span>
              <span className="text-xs opacity-70 font-normal">tony@stark.com</span>
            </Button>
            <Button 
              type="button"
              className="w-full flex flex-col items-center py-6 h-auto bg-slate-100 text-slate-900 hover:bg-slate-200"
              onClick={async () => {
                await login({ email: 'bruce@wayne.com', password: 'Password123!' });
                navigate('/dashboard');
              }}
            >
              <span className="font-semibold">Login as Wayne Admin</span>
              <span className="text-xs opacity-70 font-normal">bruce@wayne.com</span>
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-slate-500">Or enter credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md" 
                required
              />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
