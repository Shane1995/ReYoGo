import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInventory } from '@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext';
import type { InventoryItem } from '@/pages/Inventory/Capture/CapturedInventory/types';
import { useEntities } from '@/Context/EntityContext';
import type { IEntity } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import { loadDraft, useDraftPersistence } from '../useDraftPersistence';
import { useInvoiceSummary } from '../useInvoiceSummary';
import { useInvoiceFormFields } from '../useInvoiceFormFields';
import { useInvoiceSubmission } from '../useInvoiceSubmission';
import { useLastUnitCosts } from '../useLastUnitCosts';
import type { LocationState, UseInvoiceFormSummaryParams } from './types';

function getInitialLines(
  templateLines: ProcessReceiptLine[] | undefined,
): ProcessReceiptLine[] | undefined {
  if (templateLines && templateLines.length > 0) return templateLines;
  const draft = loadDraft();
  if (draft?.lines.length) return draft.lines;
  return undefined;
}

function isLineComplete(line: ProcessReceiptLine): boolean {
  if (line.itemId) return Number(line.quantity) > 0;
  return Number(line.quantity) <= 0;
}

function computeCanSave(
  invoiceNumber: string,
  validLines: ProcessReceiptLine[],
  lines: ProcessReceiptLine[],
): boolean {
  if (!invoiceNumber.trim()) return false;
  if (validLines.length === 0) return false;
  return lines.every(isLineComplete);
}

function computeIsDirty(
  lines: ProcessReceiptLine[],
  invoiceNumber: string,
  invoiceDate: string,
  supplierId: string,
): boolean {
  if (lines.some((l) => l.itemId)) return true;
  if (invoiceNumber.trim()) return true;
  if (invoiceDate) return true;
  return !!supplierId;
}

function isLocationState(value: unknown): value is LocationState {
  return typeof value === 'object' && value !== null;
}

function getLocationState(state: unknown): LocationState | null {
  if (!state) return null;
  return isLocationState(state) ? state : null;
}

function findSelectedEntity(entities: IEntity[], entityId: string): IEntity | null {
  const found = entities.find((e) => e.id === entityId);
  if (found) return found;
  return null;
}

function filterEntityItems(items: InventoryItem[], entityId: string): InventoryItem[] {
  if (!entityId) return [];
  return items.filter((item) => item.entityId === entityId);
}

function defaultVatRateOf(entity: IEntity | null): number {
  if (!entity) return 0;
  return entity.defaultVatRate;
}

function useInvoiceFormSummary(params: UseInvoiceFormSummaryParams) {
  const { lines, invoiceNumber, invoiceDate, supplierId, vatMode } = params.fields;

  const selectedEntity = findSelectedEntity(params.entities, params.entityId);
  const { clearDraft } = useDraftPersistence(
    lines,
    invoiceNumber,
    invoiceDate,
    vatMode,
    params.isReused,
  );
  const entityItems = useMemo(
    () => filterEntityItems(params.items, params.entityId),
    [params.items, params.entityId],
  );

  const { invoiceSummary, validLines, itemsWithCategory, itemMetaMap } = useInvoiceSummary(
    lines,
    entityItems,
    params.categories,
    vatMode,
    defaultVatRateOf(selectedEntity),
    params.lastUnitCosts,
  );

  const canSave = computeCanSave(invoiceNumber, validLines, lines);
  const isDirty = computeIsDirty(lines, invoiceNumber, invoiceDate, supplierId);

  return {
    selectedEntity,
    clearDraft,
    invoiceSummary,
    validLines,
    itemsWithCategory,
    itemMetaMap,
    canSave,
    isDirty,
  };
}

export function useInvoiceForm() {
  const { items, categories, unitOptions, addCategory, addItem } = useInventory();
  const { entities, selectedEntityId: entityId } = useEntities();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = getLocationState(location.state);
  const templateLines = locationState?.templateLines;
  const isReused = locationState?.isReuse === true;
  const initialLines = getInitialLines(templateLines);

  const lastUnitCosts = useLastUnitCosts();
  const fields = useInvoiceFormFields(initialLines, isReused, templateLines, location.key);
  const { resetFields } = fields;

  const addItemForEntity = useCallback(
    (item: Omit<InventoryItem, 'id'>) => addItem({ ...item, entityId }),
    [addItem, entityId],
  );

  const {
    selectedEntity,
    clearDraft,
    invoiceSummary,
    validLines,
    itemsWithCategory,
    itemMetaMap,
    canSave,
    isDirty,
  } = useInvoiceFormSummary({
    entities,
    items,
    categories,
    entityId,
    isReused,
    lastUnitCosts,
    fields,
  });

  const clearForm = useCallback(() => {
    resetFields();
    clearDraft();
    // Replace the current history entry with no state so that location.state.templateLines
    // doesn't survive a page reload (createHashRouter persists history state across Cmd+R).
    navigate(location.pathname, { replace: true, state: null });
  }, [resetFields, clearDraft, navigate, location.pathname]);

  const submission = useInvoiceSubmission({
    selectedEntity,
    entityId,
    supplierId: fields.supplierId,
    invoiceNumber: fields.invoiceNumber,
    invoiceDate: fields.invoiceDate,
    vatMode: fields.vatMode,
    validLines,
    itemMetaMap,
    canSave,
    onSaved: clearForm,
  });

  return {
    unitOptions,
    categories,
    addCategory,
    addItem: addItemForEntity,
    selectedEntity,
    entityId,
    isReused,
    isDirty,
    canSave,
    itemsWithCategory,
    itemMetaMap,
    invoiceSummary,
    validLines,
    clearForm,
    ...fields,
    ...submission,
  };
}
