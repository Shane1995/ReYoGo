import AppRoutes from '@/components/AppRoutes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SetupWizard from '@/pages/SetupWizard';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppReady } from './hooks/useAppReady';

const AppLoader = () => {
  const { isReady, setupComplete, initError } = useAppReady();

  if (initError) {
    const isMigrationError =
      /cannot add a not null column/i.test(initError) ||
      /NOT NULL constraint/i.test(initError) ||
      /migration/i.test(initError);
    const isCloudError =
      /onedrive|dropbox|icloud|google drive|synced/i.test(initError) ||
      /readonly|read-only|EROFS|EPERM/i.test(initError);

    const hint = isMigrationError
      ? 'A database schema update failed. If you are upgrading from an older version, try deleting the app data folder and relaunching.'
      : isCloudError
        ? 'If this app is installed inside a OneDrive or cloud-synced folder, try moving it to a local folder (e.g. Desktop or C:\\Program Files).'
        : 'Try relaunching the app. If the problem persists, reinstall or contact support.';

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-background p-8">
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="ReYoGo"
          className="size-16 opacity-50"
          draggable={false}
        />
        <div className="flex flex-col items-center gap-2 text-center max-w-lg">
          <span className="text-base font-semibold text-foreground">Failed to start ReYoGo</span>
          <span className="text-sm text-muted-foreground">
            The database could not be initialized. {hint}
          </span>
          <code className="mt-2 rounded bg-muted px-3 py-2 text-xs text-muted-foreground break-all">
            {initError}
          </code>
        </div>
      </div>
    );
  }

  if (!isReady || setupComplete === null) return <LoadingSpinner />;

  if (!setupComplete) return <SetupWizard />;

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default AppLoader;
