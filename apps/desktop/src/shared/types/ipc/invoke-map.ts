import type { Category, InventoryItem, InventorySubmitPayload, UnitOfMeasure } from '@reyogo/types';
import type { IBusinessGroup, ICompleteSetupPayload, IEntity, VatMode } from '@reyogo/types';
import type {
  IInvoice,
  IInvoiceAuditEntry,
  IInvoiceWithLines,
  InvoiceLineWithDate,
  ISaveCapturedInvoicePayload,
  IUpdateCapturedInvoicePayload,
  IUpdateCapturedInvoiceMetadataPayload,
} from '@reyogo/types';
import type { ItemCostHistory, COGSSummary } from '@reyogo/types';
import type { Supplier, UpsertSupplierPayload } from '@reyogo/types';

export interface AppVersionInfo {
  version: string;
  env: string;
}

export interface IPCInvokeMap {
  'app:get-version': { args: []; return: AppVersionInfo };
  'app:install-update': { args: []; return: void };
  'app:check-for-updates': { args: []; return: { hasUpdate: boolean } };
  'inventory:get-categories': { args: []; return: Category[] };
  'inventory:get-items': { args: []; return: InventoryItem[] };
  'inventory:upsert-category': { args: [category: Category]; return: void };
  'inventory:upsert-item': { args: [item: InventoryItem]; return: void };
  'inventory:delete-category': { args: [id: string]; return: void };
  'inventory:delete-item': { args: [id: string]; return: void };
  'inventory:submit': { args: [payload: InventorySubmitPayload]; return: void };
  'inventory:archive-item': { args: [id: string]; return: void };
  'inventory:restore-item': { args: [id: string]; return: void };
  'inventory:hard-delete-item': { args: [id: string]; return: void };
  'inventory:get-item-usage-count': { args: [id: string]; return: number };
  'inventory:get-archived-items': { args: []; return: InventoryItem[] };
  'inventory:archive-category': { args: [id: string]; return: void };
  'inventory:restore-category': { args: [id: string]; return: void };
  'inventory:hard-delete-category': { args: [id: string]; return: void };
  'inventory:get-category-usage-count': { args: [id: string]; return: number };
  'inventory:get-archived-categories': { args: []; return: Category[] };
  'invoices:save-invoice': { args: [payload: ISaveCapturedInvoicePayload]; return: void };
  'invoices:save-and-post-invoice': { args: [payload: ISaveCapturedInvoicePayload]; return: void };
  'invoices:post-invoice': { args: [id: string]; return: void };
  'invoices:get-invoices': { args: []; return: IInvoice[] };
  'invoices:get-invoices-with-lines': { args: []; return: IInvoiceWithLines[] };
  'invoices:get-invoice': { args: [id: string]; return: IInvoiceWithLines | null };
  'invoices:get-lines-for-analysis': { args: []; return: InvoiceLineWithDate[] };
  'invoices:update-invoice': { args: [payload: IUpdateCapturedInvoicePayload]; return: void };
  'invoices:update-invoice-metadata': {
    args: [payload: IUpdateCapturedInvoiceMetadataPayload];
    return: void;
  };
  'invoices:get-invoice-audit': { args: [id: string]; return: IInvoiceAuditEntry[] };
  'invoices:get-last-unit-prices': { args: []; return: Record<string, number> };
  'stock-movements:get-current-stock': { args: []; return: Record<string, number> };
  'stock-movements:get-weighted-avg-costs': { args: []; return: Record<string, number | null> };
  'stock-movements:get-item-cost-history': { args: [itemId: string]; return: ItemCostHistory };
  'stock-movements:get-cogs': {
    args: [fromDate?: string, toDate?: string, entityId?: string];
    return: COGSSummary;
  };
  'setup:get-units': { args: []; return: UnitOfMeasure[] };
  'setup:upsert-unit': { args: [unit: UnitOfMeasure]; return: void };
  'setup:delete-unit': { args: [id: string]; return: void };
  'setup:archive-unit': { args: [id: string]; return: void };
  'setup:restore-unit': { args: [id: string]; return: void };
  'setup:hard-delete-unit': { args: [id: string]; return: void };
  'setup:get-unit-usage-count': { args: [id: string]; return: number };
  'setup:get-archived-units': { args: []; return: UnitOfMeasure[] };
  'suppliers:get-suppliers': { args: []; return: Supplier[] };
  'suppliers:upsert-supplier': { args: [payload: UpsertSupplierPayload]; return: void };
  'suppliers:delete-supplier': { args: [id: string]; return: void };
  'shell:save-file': { args: [payload: { filename: string; data: number[] }]; return: string };
  'shell:save-file-base64': {
    args: [payload: { filename: string; base64: string }];
    return: string;
  };
  'entities:get-group': { args: []; return: IBusinessGroup | null };
  'entities:get-entities': { args: []; return: IEntity[] };
  'entities:get-setup-state': { args: []; return: { setupComplete: boolean } };
  'entities:complete-setup': { args: [payload: ICompleteSetupPayload]; return: void };
  'entities:update-group-name': { args: [name: string]; return: void };
  'entities:create-entity': { args: [name: string]; return: IEntity[] };
  'entities:rename-entity': { args: [entityId: string, name: string]; return: void };
  'entities:update-entity-vat': {
    args: [entityId: string, vatRate: number, vatMode: VatMode];
    return: void;
  };
}

export type IPCChannel = keyof IPCInvokeMap;

export type TypedInvoke = <K extends IPCChannel>(
  channel: K,
  ...args: IPCInvokeMap[K]['args']
) => Promise<IPCInvokeMap[K]['return']>;
