import { describe, it, expect } from 'vitest';
import { resolveCategoryAssignment } from '.';
import { ReviewStatus } from '../../review';
import type { ReviewItem } from '../../review';

const bleach: ReviewItem = {
  name: 'Bleach',
  categoryName: 'Cleaning',
  status: ReviewStatus.Unresolved,
  selected: false,
  unresolvedReason: 'Category not found: Cleaning',
};

describe('resolveCategoryAssignment', () => {
  it('returns the item unchanged when its name does not match', () => {
    const milk: ReviewItem = {
      name: 'Milk',
      categoryName: 'Dairy',
      status: ReviewStatus.New,
      selected: true,
    };
    expect(resolveCategoryAssignment(milk, 'Bleach', 'Cleaning Supplies', [bleach])).toBe(milk);
  });

  it('assigns a category and marks the item as new and selected', () => {
    const result = resolveCategoryAssignment(bleach, 'Bleach', 'Cleaning Supplies', [bleach]);
    expect(result).toMatchObject({
      categoryName: 'Cleaning Supplies',
      status: ReviewStatus.New,
      selected: true,
    });
  });

  it('clears the assignment back to unresolved using the original unresolved reason', () => {
    const assigned = resolveCategoryAssignment(bleach, 'Bleach', 'Cleaning Supplies', [bleach]);
    const cleared = resolveCategoryAssignment(assigned, 'Bleach', '', [bleach]);
    expect(cleared).toMatchObject({
      categoryName: 'Category not found: Cleaning',
      status: ReviewStatus.Unresolved,
      selected: false,
    });
  });
});
