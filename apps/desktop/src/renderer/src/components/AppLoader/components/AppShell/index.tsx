import AppRoutes from '@/components/AppRoutes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EntityProvider } from '@/Context/EntityContext';
import type { AppShellProps } from './types';

export function AppShell({ children }: AppShellProps) {
  return (
    <EntityProvider>
      <ErrorBoundary>
        <AppRoutes />
        {children}
      </ErrorBoundary>
    </EntityProvider>
  );
}
