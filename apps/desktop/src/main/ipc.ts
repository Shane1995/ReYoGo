import { registerAppHandlers } from './handlers/app';
import { registerInventoryHandlers } from './handlers/inventory';
import { registerInvoicesHandlers } from './handlers/invoices';
import { registerSetupHandlers } from './handlers/setup';
import { registerShellHandlers } from './handlers/shell';
import { registerStockMovementsHandlers } from './handlers/stockMovements';
import { registerSuppliersHandlers } from './handlers/suppliers';

export const registerIPC = () => {
  registerAppHandlers();
  registerInventoryHandlers();
  registerInvoicesHandlers();
  registerSetupHandlers();
  registerShellHandlers();
  registerStockMovementsHandlers();
  registerSuppliersHandlers();
};
