import { registerAccountsHandlers } from './handlers/accouts';
import { registerItemCatalogHandlers } from './handlers/item-catalog';
import { registerInventoryHandlers } from './handlers/inventory';
import { registerInvoicesHandlers } from './handlers/invoices';

export const registerIPC = () => {
  registerAccountsHandlers();
  registerItemCatalogHandlers();
  registerInventoryHandlers();
  registerInvoicesHandlers();
};