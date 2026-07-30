import { OrganizationSwitcher } from './OrganizationSwitcher';
import { ProfileMenu } from './ProfileMenu';
import { Breadcrumbs } from './Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';

export interface SidebarLink {
  name: string;
  path: string;
}

export interface SidebarLayoutProps {
  title: string;
  links: SidebarLink[];
  children: React.ReactNode;
}

export function SidebarLayout({ title, links, children }: SidebarLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border font-semibold text-lg">
          {title}
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
        <div className="p-4 border-t border-border flex items-center gap-3">
          <ProfileMenu />
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Settings</span>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <span className="font-semibold md:hidden">{title}</span>
            <Breadcrumbs />
          </div>
          <div className="flex items-center space-x-4">
            <OrganizationSwitcher />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
