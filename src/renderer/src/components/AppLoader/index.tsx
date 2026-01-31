import { useEffect, useState } from "react";
import AppRoutes from "@/components/AppRoutes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Spinner } from "../ui/spinner";


export function LoadingSpinner() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
      <Spinner className="size-8" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

const AppLoader = () => {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {

    window.electronAPI.requestAppReady();
    window.electronAPI.onAppReady(() => {
      setIsReady(true);
    });
  }, []);

  return isReady ? (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  ) : (
    <LoadingSpinner />
  );
};

export default AppLoader;