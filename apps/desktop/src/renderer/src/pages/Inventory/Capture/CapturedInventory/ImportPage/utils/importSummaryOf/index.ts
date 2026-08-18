import { ReviewStatus } from '@/components/CsvImport/review';
import type { ReviewResult } from '@/components/CsvImport/review';

function categoryCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'category' : 'categories'}`;
}

function itemCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

export function importSummaryOf(review: ReviewResult): string {
  const categoryCount = review.categories.filter(
    (c) => c.selected && c.status !== ReviewStatus.Exists,
  ).length;
  const itemCount = review.items.filter((i) => i.selected && i.status === ReviewStatus.New).length;

  const parts = [
    ...(categoryCount > 0 ? [categoryCountLabel(categoryCount)] : []),
    itemCountLabel(itemCount),
  ];

  return `Imported ${parts.join(' and ')}`;
}
