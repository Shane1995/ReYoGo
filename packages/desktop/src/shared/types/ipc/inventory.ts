export enum InventoryIPC {
  GET_CATEGORIES = 'inventory:get-categories',
  GET_ITEMS = 'inventory:get-items',
  UPSERT_CATEGORY = 'inventory:upsert-category',
  UPSERT_ITEM = 'inventory:upsert-item',
  DELETE_CATEGORY = 'inventory:delete-category',
  DELETE_ITEM = 'inventory:delete-item',
  SUBMIT = 'inventory:submit',
}
