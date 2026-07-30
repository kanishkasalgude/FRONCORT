import { useLocation, Link } from 'react-router-dom';

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        </li>
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const to = `/${paths.slice(0, index + 1).join('/')}`;
          
          return (
            <li key={to} className="flex items-center space-x-2">
              <span>/</span>
              {isLast ? (
                <span className="font-medium text-foreground capitalize" aria-current="page">
                  {path.replace(/-/g, ' ')}
                </span>
              ) : (
                <Link to={to} className="hover:text-foreground transition-colors capitalize">
                  {path.replace(/-/g, ' ')}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
