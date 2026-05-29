import { useEntities } from '@/Context/EntityContext';
import { BusinessSection } from './components/BusinessSection';
import { EntitiesSection } from './components/EntitiesSection';
import { TaxSection } from './components/TaxSection';

export default function SettingsPage() {
  const { group, entities, refetchEntities } = useEntities();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your business and app preferences
        </p>
      </div>
      <BusinessSection group={group} onSaved={refetchEntities} />
      <EntitiesSection entities={entities} onSaved={refetchEntities} />
      <TaxSection entities={entities} onSaved={refetchEntities} />
    </div>
  );
}
