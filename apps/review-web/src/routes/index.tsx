import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { useAuth, RouteErrorBoundary, NotFoundHandler } from '@workspace/frontend-core';
import { SidebarLayout } from '@workspace/frontend-core';

import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PullRequestsPage } from '../features/pull-requests/PullRequestsPage';
import { PullRequestDetailsPage } from '../features/pull-requests/PullRequestDetailsPage';
import { SharedResourcesPage } from '../features/shared/SharedResourcesPage';
import { DigestsPage } from '../features/digests/DigestsPage';
import { ProfilePage } from '../features/auth/ProfilePage';
import { SettingsPage } from '../features/auth/SettingsPage';
import { LoginPage } from '../features/auth/LoginPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/login" />;
  return <>{children}</>;
}

const sidebarLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Pull Requests', path: '/pull-requests' },
  { name: 'Shared Resources', path: '/shared' },
  { name: 'Digests', path: '/digests' },
  { name: 'Profile', path: '/profile' },
  { name: 'Settings', path: '/settings' },
];

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <SidebarLayout title="Review Console" links={sidebarLinks}>
          <Outlet />
        </SidebarLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'pull-requests', element: <PullRequestsPage /> },
      { path: 'pull-requests/:id', element: <PullRequestDetailsPage /> },
      { path: 'shared', element: <SharedResourcesPage /> },
      { path: 'digests', element: <DigestsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundHandler /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
