import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@workspace/frontend-core';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tickets', path: '/tickets' },
    { name: 'Feature Flags', path: '/feature-flags' },
    { name: 'Profile', path: '/profile' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border font-semibold text-lg">
          Support Hub
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-2 rounded-md ${
                location.pathname.startsWith(link.path) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => logout()}
            className="w-full px-4 py-2 text-left hover:bg-muted rounded-md text-destructive"
          >
            Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border flex items-center px-4 md:hidden">
          <span className="font-semibold">Support Hub</span>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
