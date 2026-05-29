import { useEntities } from '@/Context/EntityContext';
import { TaxSection } from '../../components/TaxSection';

export default function TaxPage() {
  const { entities, refetchEntities } = useEntities();

  return (
    <div className="max-w-2xl px-8 py-8 flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Tax</h1>
        <p className="text-sm text-muted-foreground">
          Configure VAT rates and treatment per venue.
        </p>
      </div>
      <TaxSection entities={entities} onSaved={refetchEntities} />
    </div>
  );
}
