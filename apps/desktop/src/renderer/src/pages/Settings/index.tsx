import { useEntities } from '@/Context/EntityContext';
import { PageHeader } from '@reyogo/ui';
import { BusinessSection } from './components/BusinessSection';
import { EntitiesSection } from './components/EntitiesSection';
import { TaxSection } from './components/TaxSection';
import { UnitsSection } from './components/UnitsSection';
import { CloudSyncSection } from './components/CloudSyncSection';
import { AISettingsSection } from './components/AISettingsSection';
import { AboutSection } from './components/AboutSection';

export default function SettingsPage() {
  const { group, entities, refetchEntities } = useEntities();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Settings"
        description="Manage your business, venues, and tax configuration."
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="max-w-2xl px-6 py-6 flex flex-col gap-6">
          <BusinessSection group={group} onSaved={refetchEntities} />
          <EntitiesSection entities={entities} onSaved={refetchEntities} />
          <TaxSection entities={entities} onSaved={refetchEntities} />
          <UnitsSection />
          <CloudSyncSection />
          <AISettingsSection />
          <AboutSection />
        </div>
      </div>
    </div>
  );
}
