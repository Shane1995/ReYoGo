import { useEntities } from '@/Context/EntityContext';
import { BusinessSection } from '../../components/BusinessSection';
import { EntitiesSection } from '../../components/EntitiesSection';

export default function BusinessPage() {
  const { group, entities, refetchEntities } = useEntities();

  return (
    <div className="max-w-2xl px-8 py-8 flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Business</h1>
        <p className="text-sm text-muted-foreground">Manage your business group name and venues.</p>
      </div>
      <BusinessSection group={group} onSaved={refetchEntities} />
      <EntitiesSection entities={entities} onSaved={refetchEntities} />
    </div>
  );
}
