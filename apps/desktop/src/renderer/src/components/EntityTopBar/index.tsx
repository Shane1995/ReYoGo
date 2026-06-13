import { useState } from 'react';
import { useEntities } from '@/Context/EntityContext';
import { BAR_STYLE } from './constants';
import { selectedEntityOf } from './utils/selectedEntityOf';
import { EntitySection } from './components/EntitySection';
import { GroupLabel } from './components/GroupLabel';
import { AccountButton } from './components/AccountButton';

export function EntityTopBar() {
  const { group, entities, selectedEntityId, setSelectedEntityId } = useEntities();
  const [open, setOpen] = useState(false);

  const selectedEntity = selectedEntityOf(entities, selectedEntityId);
  const hasMultiple = entities.length > 1;

  const handleSelect = (id: string) => {
    setSelectedEntityId(id);
    setOpen(false);
  };

  return (
    <div className="shrink-0 flex items-center h-[52px] px-3 gap-3" style={BAR_STYLE}>
      <div className="flex items-center gap-2.5 shrink-0">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="ReYoGo" className="size-6 shrink-0" />
        <span className="text-sm font-semibold leading-none text-white">ReYoGo</span>
        <GroupLabel name={group?.name} />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        <EntitySection
          entity={selectedEntity}
          hasMultiple={hasMultiple}
          entities={entities}
          selectedEntityId={selectedEntityId}
          open={open}
          onOpenChange={setOpen}
          onSelect={handleSelect}
        />
        <div className="mx-0.5 h-4 w-px bg-white/10" />
        <AccountButton />
      </div>
    </div>
  );
}
