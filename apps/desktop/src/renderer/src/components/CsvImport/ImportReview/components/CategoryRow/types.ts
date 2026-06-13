import type { ReviewCategory, InventoryType } from '../../../review';

export interface CategoryRowProps {
  category: ReviewCategory;
  onToggle: (id: string) => void;
  onFixType: (id: string, type: InventoryType) => void;
}
