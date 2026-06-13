import { cn } from '@reyogo/ui';
import { TABS } from '../../constants';
import type { ModalTabBarProps } from './types';

export function ModalTabBar({ activeTab, onSelect }: ModalTabBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 pt-5 pb-0">
      <h2 className="text-base font-semibold text-foreground">Add to inventory</h2>
      <div className="flex gap-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              'rounded-t-md px-3.5 py-2 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
