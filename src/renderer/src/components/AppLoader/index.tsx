import AppRoutes from "@/components/AppRoutes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SetupWizard from "@/pages/Setup";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAppReady } from "./hooks/useAppReady";

const AppLoader = () => {
  const { isReady, setupComplete, setSetupComplete } = useAppReady();

  if (!isReady) return <LoadingSpinner />;

  if (setupComplete === false) {
    return (
      <SetupWizard
        onComplete={() => setSetupComplete(true)}
      />
    );
  }

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default AppLoader;
