import { Button } from '@reyogo/ui';
import { SectionHeader } from '../SectionHeader';
import { AddUnitForm } from './components/AddUnitForm';
import { ArchivedUnitsPanel } from './components/ArchivedUnitsPanel';
import { UnitListItem } from './components/UnitListItem';
import { useUnitsSection } from './hooks/useUnitsSection';

export function UnitsSection() {
  const units = useUnitsSection();

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader label="Units of Measure" />
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {units.loading ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">Loading…</p>
        ) : (
          units.units.map((unit) => (
            <UnitListItem
              key={unit.id}
              unit={unit}
              onRename={units.handleRename}
              onArchive={units.handleArchive}
            />
          ))
        )}
        <AddUnitForm value={units.addName} onChange={units.setAddName} onSubmit={units.handleAdd} />
      </div>
      <Button variant="ghost" size="sm" className="self-start" onClick={units.toggleShowArchived}>
        {units.showArchived ? 'Hide archived' : 'Show archived'}
      </Button>
      {units.showArchived && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <ArchivedUnitsPanel
            units={units.archivedUnits}
            onRestore={units.handleRestore}
            onHardDelete={units.handleHardDelete}
          />
        </div>
      )}
    </section>
  );
}
