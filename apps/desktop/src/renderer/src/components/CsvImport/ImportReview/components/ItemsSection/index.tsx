import { ReviewStatus } from '../../../review';
import { Section } from '../../../components/Section';
import { ItemRow } from '../ItemRow';
import type { ItemsSectionProps } from './types';

export function ItemsSection({
  items,
  availableCategories,
  onToggle,
  onAssignCategory,
}: ItemsSectionProps) {
  if (items.length === 0) return null;

  return (
    <Section
      title="Items"
      count={items.length}
      defaultOpen={items.some((i) => i.status !== ReviewStatus.Exists)}
    >
      {items.map((item) => (
        <ItemRow
          key={item.name}
          item={item}
          availableCategories={availableCategories}
          onToggle={onToggle}
          onAssignCategory={onAssignCategory}
        />
      ))}
    </Section>
  );
}
