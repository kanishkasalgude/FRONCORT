import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { useAuth, RouteErrorBoundary, NotFoundHandler } from '@workspace/frontend-core';

// Phase 5B Pages
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TicketsPage } from '../features/tickets/TicketsPage';
import { TicketDetailsPage } from '../features/tickets/TicketDetailsPage';
import { FeatureFlagsPage } from '../features/feature-flags/FeatureFlagsPage';
import { ProfilePage } from '../features/auth/ProfilePage';
import { SettingsPage } from '../features/auth/SettingsPage';
import { LoginPage } from '../features/auth/LoginPage';
import { SidebarLayout } from '../components/layout/SidebarLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/login" />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <SidebarLayout>
          <Outlet />
        </SidebarLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'tickets/:ticketId', element: <TicketDetailsPage /> },
      { path: 'feature-flags', element: <FeatureFlagsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundHandler /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
