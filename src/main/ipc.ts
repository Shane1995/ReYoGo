import { registerInventoryHandlers } from './handlers/inventory';
import { registerInvoicesHandlers } from './handlers/invoices';

export const registerIPC = () => {
  registerInventoryHandlers();
  registerInvoicesHandlers();
};