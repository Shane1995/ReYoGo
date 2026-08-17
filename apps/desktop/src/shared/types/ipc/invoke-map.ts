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
  ISaveCreditNotePayload,
} from '@reyogo/types';
import type { ItemCostHistory, COGSSummary } from '@reyogo/types';
import type { Supplier, UpsertSupplierPayload } from '@reyogo/types';
import type { IInvoiceScanResult } from '@reyogo/types';
import type {
  IStocktakeSession,
  IStocktakeSessionWithLines,
  ISaveStocktakeLinePayload,
} from '@reyogo/types';

export interface AppVersionInfo {
  version: string;
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
  'invoices:get-lines-for-analysis': { args: [entityId?: string]; return: InvoiceLineWithDate[] };
  'invoices:update-invoice': { args: [payload: IUpdateCapturedInvoicePayload]; return: void };
  'invoices:update-invoice-metadata': {
    args: [payload: IUpdateCapturedInvoiceMetadataPayload];
    return: void;
  };
  'invoices:get-invoice-audit': { args: [id: string]; return: IInvoiceAuditEntry[] };
  'invoices:get-last-unit-prices': {
    args: [asOfDate?: string];
    return: Record<string, { exclVat: number; inclVat: number }>;
  };
  'invoices:save-credit-note': { args: [payload: ISaveCreditNotePayload]; return: void };
  'invoices:get-credit-notes-for-invoice': {
    args: [sourceInvoiceId: string];
    return: IInvoiceWithLines[];
  };
  'stock-movements:get-current-stock': {
    args: [entityId?: string, asOfDate?: string];
    return: Record<string, number>;
  };
  'stock-movements:get-weighted-avg-costs': {
    args: [entityId?: string, asOfDate?: string];
    return: Record<string, number | null>;
  };
  'stock-movements:get-item-cost-history': {
    args: [itemId: string, entityId?: string];
    return: ItemCostHistory;
  };
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
  'suppliers:get-suppliers': { args: [entityId: string]; return: Supplier[] };
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
  'cloud-sync:activate': { args: [tursoUrl: string, authToken: string]; return: void };
  'cloud-sync:get-status': {
    args: [];
    return: { state: string; lastSyncedAt: string | null; error: string | null; isActive: boolean };
  };
  'cloud-sync:manual-sync': { args: []; return: void };
  'cloud-sync:delete-backup': { args: []; return: void };
  'cloud-sync:get-credentials': { args: []; return: { tursoUrl: string } | null };
  'cloud-sync:is-fresh-replica': { args: []; return: boolean };
  'cloud-sync:rotate-token': { args: [authToken: string]; return: void };
  'cloud-sync:connect': { args: [tursoUrl: string, authToken: string]; return: void };
  'ai-settings:set-key': { args: [apiKey: string]; return: void };
  'ai-settings:clear-key': { args: []; return: void };
  'ai-settings:get-key-status': { args: []; return: { configured: boolean } };
  'ai-settings:test-connection': {
    args: [apiKey: string];
    return: { success: boolean; error: string | null };
  };
  'invoice-scan:scan': {
    args: [payload: { base64: string; mimeType: string }];
    return: IInvoiceScanResult;
  };
  'stocktake:create-session': { args: [label?: string]; return: IStocktakeSession };
  'stocktake:get-sessions': { args: []; return: IStocktakeSession[] };
  'stocktake:get-session': { args: [id: string]; return: IStocktakeSessionWithLines | null };
  'stocktake:save-draft-lines': {
    args: [sessionId: string, lines: ISaveStocktakeLinePayload[]];
    return: void;
  };
  'stocktake:complete-session': {
    args: [sessionId: string, lines: ISaveStocktakeLinePayload[]];
    return: void;
  };
}

export type IPCChannel = keyof IPCInvokeMap;

export type TypedInvoke = <K extends IPCChannel>(
  channel: K,
  ...args: IPCInvokeMap[K]['args']
) => Promise<IPCInvokeMap[K]['return']>;
