import { ReviewStatus } from '../review';
import type { ReviewItem } from '../review';
import { Section } from '../Section';
import { ItemRow } from '../ItemRow';

export function ItemsSection({
  items,
  availableCategories,
  onToggle,
  onAssignCategory,
}: {
  items: ReviewItem[];
  availableCategories: { name: string }[];
  onToggle: (name: string) => void;
  onAssignCategory: (itemName: string, categoryName: string) => void;
}) {
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
