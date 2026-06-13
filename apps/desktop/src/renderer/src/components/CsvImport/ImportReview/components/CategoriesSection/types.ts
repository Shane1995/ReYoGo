import type { ReviewCategory, InventoryType } from '../../../review';

export interface CategoriesSectionProps {
  categories: ReviewCategory[];
  onToggle: (id: string) => void;
  onFixType: (id: string, type: InventoryType) => void;
}
