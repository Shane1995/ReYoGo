import { useState } from 'react';
import { toggleSetMember } from '@/pages/Inventory/Analysis/utils/toggleSetMember';

export function useCollapsedCategories() {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) =>
    setCollapsedCategories((prev) => toggleSetMember(prev, category));

  const isExpanded = (category: string) => !collapsedCategories.has(category);

  return { isExpanded, toggleCategory };
}
