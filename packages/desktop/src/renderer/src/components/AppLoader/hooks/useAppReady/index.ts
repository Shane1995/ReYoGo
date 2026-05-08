import { useEffect, useState } from "react";
import { fetchSetupStatus } from "../../utils/fetchSetupStatus";
import { appService } from "@/services/app";

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Register the listener before sending the request so the response
    // can never arrive before the once-listener is in place.
    appService.onAppReady(async () => {
      const isComplete = await fetchSetupStatus();
      setSetupComplete(isComplete);
      setIsReady(true);
    });
    appService.requestAppReady();
  }, []);

  return { isReady, setupComplete, setSetupComplete };
}
