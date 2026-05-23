import AppRoutes from '@/components/AppRoutes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppReady } from './hooks/useAppReady';

const AppLoader = () => {
  const { isReady } = useAppReady();

  if (!isReady) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default AppLoader;
