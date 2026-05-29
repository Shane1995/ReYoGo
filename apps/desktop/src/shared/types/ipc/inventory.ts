export const InventoryIPC = {
  GET_CATEGORIES: 'inventory:get-categories',
  GET_ITEMS: 'inventory:get-items',
  UPSERT_CATEGORY: 'inventory:upsert-category',
  UPSERT_ITEM: 'inventory:upsert-item',
  DELETE_CATEGORY: 'inventory:delete-category',
  DELETE_ITEM: 'inventory:delete-item',
  SUBMIT: 'inventory:submit',
  ARCHIVE_ITEM: 'inventory:archive-item',
  RESTORE_ITEM: 'inventory:restore-item',
  HARD_DELETE_ITEM: 'inventory:hard-delete-item',
  GET_ITEM_USAGE_COUNT: 'inventory:get-item-usage-count',
  GET_ARCHIVED_ITEMS: 'inventory:get-archived-items',
  ARCHIVE_CATEGORY: 'inventory:archive-category',
  RESTORE_CATEGORY: 'inventory:restore-category',
  HARD_DELETE_CATEGORY: 'inventory:hard-delete-category',
  GET_CATEGORY_USAGE_COUNT: 'inventory:get-category-usage-count',
  GET_ARCHIVED_CATEGORIES: 'inventory:get-archived-categories',
} as const;

export type InventoryIPC = (typeof InventoryIPC)[keyof typeof InventoryIPC];
