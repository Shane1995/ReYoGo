import { createContext, useContext, type ReactNode } from 'react';
import { appConfig, type AppConfig } from '@/config/app.config';

interface AppConfigContextValue {
  config: AppConfig;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  return (
    <AppConfigContext.Provider value={{ config: appConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig(): AppConfigContextValue {
  const ctx = useContext(AppConfigContext);
  if (!ctx) throw new Error('useAppConfig must be used within AppConfigProvider');
  return ctx;
}
