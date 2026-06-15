import type { useInvoiceForm } from '../../hooks/useInvoiceForm';
import type { ItemOption } from '../ItemAutocomplete';

export type InvoiceFormReturn = ReturnType<typeof useInvoiceForm>;

export type InvoiceBodyProps = {
  form: InvoiceFormReturn;
  sortedItems: ItemOption[];
};
