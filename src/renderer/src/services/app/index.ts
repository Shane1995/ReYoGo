export const appService = {
  onAppReady: (callback: () => void) => window.electronAPI.onAppReady(callback),
  requestAppReady: () => window.electronAPI.requestAppReady(),
};
