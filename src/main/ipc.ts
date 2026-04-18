import { registerInventoryHandlers } from './handlers/inventory';
import { registerInvoicesHandlers } from './handlers/invoices';
import { registerSetupHandlers } from './handlers/setup';

export const registerIPC = () => {
  registerInventoryHandlers();
  registerInvoicesHandlers();
  registerSetupHandlers();
};