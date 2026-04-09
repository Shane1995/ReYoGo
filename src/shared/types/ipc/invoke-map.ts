import type { IAccount, IAccounts, ICreateAccountBody } from '../contract/accounts';
import type {
  IInventoryCategory,
  IInventoryItem,
  IInventorySubmitPayload,
} from '../contract/inventory';
import type {
  ICapturedInvoice,
  ICapturedInvoiceAuditEntry,
  ICapturedInvoiceWithLines,
  IInvoiceLineWithDate,
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
} from '../contract/invoices';

/**
 * Maps each IPC channel to its argument tuple and return type.
 * Keys must match the values in accounts.ts / catalog.ts / inventory.ts. Add entries when you add new handlers.
 */
export interface IPCInvokeMap {
  'accounts:get-accounts': { args: []; return: IAccounts };
  'accounts:create-account': { args: [body: ICreateAccountBody]; return: IAccount };
  'catalog:get-items': { args: []; return: unknown[] };
  'catalog:add-item': { args: [item: unknown]; return: void };
  'catalog:clear-items': { args: []; return: void };
  'inventory:get-categories': { args: []; return: IInventoryCategory[] };
  'inventory:get-items': { args: []; return: IInventoryItem[] };
  'inventory:upsert-category': { args: [category: IInventoryCategory]; return: void };
  'inventory:upsert-item': { args: [item: IInventoryItem]; return: void };
  'inventory:delete-category': { args: [id: string]; return: void };
  'inventory:delete-item': { args: [id: string]; return: void };
  'inventory:submit': { args: [payload: IInventorySubmitPayload]; return: void };
  'invoices:save-invoice': { args: [payload: ISaveCapturedInvoicePayload]; return: void };
  'invoices:get-invoices': { args: []; return: ICapturedInvoice[] };
  'invoices:get-invoice': { args: [id: string]; return: ICapturedInvoiceWithLines | null };
  'invoices:get-lines-for-analysis': { args: []; return: IInvoiceLineWithDate[] };
  'invoices:update-invoice': { args: [payload: IUpdateCapturedInvoicePayload]; return: void };
  'invoices:get-invoice-audit': { args: [id: string]; return: ICapturedInvoiceAuditEntry[] };
}

export type IPCChannel = keyof IPCInvokeMap;

export type TypedInvoke = <K extends IPCChannel>(
  channel: K,
  ...args: IPCInvokeMap[K]['args']
) => Promise<IPCInvokeMap[K]['return']>;
