import type { ReviewItem } from '../../../review';

export interface ItemRowProps {
  item: ReviewItem;
  availableCategories: { name: string }[];
  onToggle: (name: string) => void;
  onAssignCategory: (itemName: string, categoryName: string) => void;
}
