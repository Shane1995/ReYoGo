import { registerInventoryHandlers } from './handlers/inventory';
import { registerInvoicesHandlers } from './handlers/invoices';
import { registerSetupHandlers } from './handlers/setup';
import { registerStockMovementsHandlers } from './handlers/stockMovements';

export const registerIPC = () => {
  registerInventoryHandlers();
  registerInvoicesHandlers();
  registerSetupHandlers();
  registerStockMovementsHandlers();
};