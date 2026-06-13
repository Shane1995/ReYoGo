import { ReviewStatus } from '../review';
import type { ReviewCategory, InventoryType } from '../review';
import { Section } from '../Section';
import { CategoryRow } from '../CategoryRow';

export function CategoriesSection({
  categories,
  onToggle,
  onFixType,
}: {
  categories: ReviewCategory[];
  onToggle: (id: string) => void;
  onFixType: (id: string, type: InventoryType) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <Section
      title="Categories"
      count={categories.length}
      defaultOpen={categories.some((c) => c.status === ReviewStatus.New)}
    >
      {categories.map((cat) => (
        <CategoryRow key={cat.id} category={cat} onToggle={onToggle} onFixType={onFixType} />
      ))}
    </Section>
  );
}
