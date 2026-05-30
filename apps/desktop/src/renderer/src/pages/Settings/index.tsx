import { useEntities } from '@/Context/EntityContext';
import { BusinessSection } from './components/BusinessSection';
import { EntitiesSection } from './components/EntitiesSection';
import { TaxSection } from './components/TaxSection';
import { CloudSyncSection } from './components/CloudSyncSection';
import { AboutSection } from './components/AboutSection';

export default function SettingsPage() {
  const { group, entities, refetchEntities } = useEntities();

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-2xl px-8 py-8 flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your business, venues, and tax configuration.
          </p>
        </div>
        <BusinessSection group={group} onSaved={refetchEntities} />
        <EntitiesSection entities={entities} onSaved={refetchEntities} />
        <TaxSection entities={entities} onSaved={refetchEntities} />
        <CloudSyncSection />
        <AboutSection />
      </div>
    </div>
  );
}
