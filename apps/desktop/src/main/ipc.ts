import { registerAppHandlers } from './handlers/app';
import { registerInventoryHandlers } from './handlers/inventory';
import { registerInvoicesHandlers } from './handlers/invoices';
import { registerSetupHandlers } from './handlers/setup';
import { registerStockMovementsHandlers } from './handlers/stockMovements';

export const registerIPC = () => {
  registerAppHandlers();
  registerInventoryHandlers();
  registerInvoicesHandlers();
  registerSetupHandlers();
  registerStockMovementsHandlers();
};
