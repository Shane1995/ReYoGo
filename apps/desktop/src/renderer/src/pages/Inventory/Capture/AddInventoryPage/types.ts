import type { useItemRows } from './hooks/useItemRows';
import type { useCategoryRows } from './hooks/useCategoryRows';

export type Mode = 'items' | 'categories';

export type ItemRows = ReturnType<typeof useItemRows>;
export type CategoryRows = ReturnType<typeof useCategoryRows>;
