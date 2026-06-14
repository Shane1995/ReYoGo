import type { InventoryItem } from '@/pages/Inventory/Capture/CapturedInventory/types';
import type { IEntity } from '@reyogo/types';
import type { ProcessReceiptLine } from '../../types';
import type { useInvoiceSummary } from '../useInvoiceSummary';
import type { useInvoiceFormFields } from '../useInvoiceFormFields';

export type LocationState = { templateLines?: ProcessReceiptLine[]; isReuse?: boolean };

export type UseInvoiceFormSummaryParams = {
  entities: IEntity[];
  items: InventoryItem[];
  categories: Parameters<typeof useInvoiceSummary>[2];
  entityId: string;
  isReused: boolean;
  lastUnitCosts: Record<string, number>;
  fields: Pick<
    ReturnType<typeof useInvoiceFormFields>,
    'lines' | 'invoiceNumber' | 'invoiceDate' | 'supplierId' | 'vatMode'
  >;
};
