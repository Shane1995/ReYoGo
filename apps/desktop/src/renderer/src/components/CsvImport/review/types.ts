import type { InventoryType } from '@reyogo/types';
import type { UnitStatus, CategoryStatus, ItemStatus } from './constants';

export type { InventoryType };

export interface ReviewUnit {
  name: string;
  status: UnitStatus;
  selected: boolean;
}

export interface ReviewCategory {
  id: string;
  name: string;
  type: InventoryType;
  status: CategoryStatus;
  selected: boolean;
  typeWarning?: boolean;
}

export interface ReviewItem {
  name: string;
  categoryName: string;
  unit?: string;
  entityId?: string;
  entityName?: string;
  status: ItemStatus;
  selected: boolean;
  unresolvedReason?: string;
}

export interface AvailableCategory {
  name: string;
  type: InventoryType;
}

export interface ReviewResult {
  units: ReviewUnit[];
  categories: ReviewCategory[];
  items: ReviewItem[];
  parseErrors: string[];
  availableCategories: AvailableCategory[];
  counts: {
    newTotal: number;
    existsTotal: number;
    unresolvedTotal: number;
  };
}

export interface ExistingInventory {
  categoryNames: Set<string>;
  itemNames: Set<string>;
  unitNames: Set<string>;
  categoryList?: AvailableCategory[];
}
