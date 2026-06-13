import { ReviewStatus } from '../../../review';
import { Section } from '../../../components/Section';
import { CategoryRow } from '../CategoryRow';
import type { CategoriesSectionProps } from './types';

export function CategoriesSection({ categories, onToggle, onFixType }: CategoriesSectionProps) {
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
