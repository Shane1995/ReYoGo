import type {
  IInventoryCategory,
  IInventoryItem,
  IInventorySubmitPayload,
} from '@reyogo/shared';
import type {
  ICapturedInvoice,
  ICapturedInvoiceAuditEntry,
  ICapturedInvoiceWithLines,
  IInvoiceLineWithDate,
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
} from '@reyogo/shared';
import type { IUnitOfMeasure, ISetupStatus } from '@reyogo/shared';
import type { ICOGSSummary, IItemCostHistory } from '@reyogo/shared';

/**
 * Maps each IPC channel to its argument tuple and return type.
 * Keys must match the values in inventory.ts / invoices.ts. Add entries when you add new handlers.
 */
export interface AppVersionInfo {
  version: string;
  env: string;
}

export interface IPCInvokeMap {
  'app:get-version': { args: []; return: AppVersionInfo };
  'app:install-update': { args: []; return: void };
  'app:check-for-updates': { args: [], return: { hasUpdate: boolean } },
  'inventory:get-categories': { args: []; return: IInventoryCategory[] };
  'inventory:get-items': { args: []; return: IInventoryItem[] };
  'inventory:upsert-category': { args: [category: IInventoryCategory]; return: void };
  'inventory:upsert-item': { args: [item: IInventoryItem]; return: void };
  'inventory:delete-category': { args: [id: string]; return: void };
  'inventory:delete-item': { args: [id: string]; return: void };
  'inventory:submit': { args: [payload: IInventorySubmitPayload]; return: void };
  'invoices:save-invoice': { args: [payload: ISaveCapturedInvoicePayload]; return: void };
  'invoices:get-invoices': { args: []; return: ICapturedInvoice[] };
  'invoices:get-invoices-with-lines': { args: []; return: ICapturedInvoiceWithLines[] };
  'invoices:get-invoice': { args: [id: string]; return: ICapturedInvoiceWithLines | null };
  'invoices:get-lines-for-analysis': { args: []; return: IInvoiceLineWithDate[] };
  'invoices:update-invoice': { args: [payload: IUpdateCapturedInvoicePayload]; return: void };
  'invoices:get-invoice-audit': { args: [id: string]; return: ICapturedInvoiceAuditEntry[] };
  'invoices:get-last-unit-prices': { args: []; return: Record<string, number> };
  'stock-movements:get-current-stock': { args: []; return: Record<string, number> };
  'stock-movements:get-weighted-avg-costs': { args: []; return: Record<string, number | null> };
  'stock-movements:get-item-cost-history': { args: [itemId: string]; return: IItemCostHistory };
  'stock-movements:get-cogs': { args: [fromDate?: string, toDate?: string]; return: ICOGSSummary };
  'setup:get-status': { args: []; return: ISetupStatus };
  'setup:complete': { args: []; return: void };
  'setup:get-units': { args: []; return: IUnitOfMeasure[] };
  'setup:upsert-unit': { args: [unit: IUnitOfMeasure]; return: void };
  'setup:delete-unit': { args: [id: string]; return: void };
  'setup:get-good-types': { args: []; return: string[] };
  'setup:set-good-types': { args: [types: string[]]; return: void };
}

export type IPCChannel = keyof IPCInvokeMap;

export type TypedInvoke = <K extends IPCChannel>(
  channel: K,
  ...args: IPCInvokeMap[K]['args']
) => Promise<IPCInvokeMap[K]['return']>;
