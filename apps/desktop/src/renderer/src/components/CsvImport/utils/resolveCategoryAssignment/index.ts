import type { ReviewItem } from '../../review';
import { ReviewStatus } from '../../review';

function clearCategoryAssignment(item: ReviewItem, originalItems: ReviewItem[]): ReviewItem {
  const original = originalItems.find((i) => i.name === item.name);
  const categoryName = original
    ? (original.unresolvedReason ?? item.categoryName)
    : item.categoryName;
  return { ...item, categoryName, status: ReviewStatus.Unresolved, selected: false };
}

export function resolveCategoryAssignment(
  item: ReviewItem,
  itemName: string,
  catName: string,
  originalItems: ReviewItem[],
): ReviewItem {
  if (item.name !== itemName) return item;
  if (catName) {
    return { ...item, categoryName: catName, status: ReviewStatus.New, selected: true };
  }
  return clearCategoryAssignment(item, originalItems);
}
