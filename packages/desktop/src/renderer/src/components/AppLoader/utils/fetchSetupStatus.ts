import { setupService } from "@/services/setup";

export async function fetchSetupStatus(retries = 5, delayMs = 150): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const status = await setupService.getStatus();
      return status.isComplete;
    } catch {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  // If all retries fail, treat as complete so the app doesn't stay stuck on the wizard.
  return true;
}
