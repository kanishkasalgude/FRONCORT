import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { ErrorState } from '@workspace/ui';

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundHandler />;
    }
    if (error.status === 401) {
      return <ErrorState message="Unauthorized. Please log in again." />;
    }
    if (error.status === 403) {
      return <ErrorState message="Forbidden. You do not have access to this resource." />;
    }
    return <ErrorState message={`Error ${error.status}: ${error.statusText}`} />;
  }

  return <ErrorState message="An unexpected error occurred." />;
}

export function NotFoundHandler() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link to="/" className="text-primary hover:underline">
        Return to Home
      </Link>
    </div>
  );
}
