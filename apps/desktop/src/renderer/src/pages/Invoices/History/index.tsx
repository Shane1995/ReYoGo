import { type ComponentProps } from 'react';
import { useEntities } from '@/Context/EntityContext';
import { useInvoiceHistory } from './hooks/useInvoiceHistory';
import { useSortedInvoiceRows } from './hooks/useSortedInvoiceRows';
import { InvoiceFilterBar } from './components/InvoiceFilterBar';
import { HistoryHeader } from './components/HistoryHeader';
import { InvoiceHistoryBody } from './components/InvoiceHistoryTable';
import { buildRowProps } from './utils/buildRowProps';

export default function InvoiceHistoryPage() {
  const history = useInvoiceHistory();
  const { selectedEntityId } = useEntities();

  const { visibleInvoices, drafts, sortedPosted, sortKey, sortDir, toggleSort } =
    useSortedInvoiceRows(history.invoices, selectedEntityId, history.detailCache);

  const filterBarProps: ComponentProps<typeof InvoiceFilterBar> = {
    search: history.search,
    setSearch: history.setSearch,
    fromDate: history.fromDate,
    setFromDate: history.setFromDate,
    toDate: history.toDate,
    setToDate: history.setToDate,
    supplierFilter: history.supplierFilter,
    setSupplierFilter: history.setSupplierFilter,
    suppliers: history.suppliers,
    hasFilters: history.hasFilters,
    clearFilters: history.clearFilters,
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <HistoryHeader filterBarProps={filterBarProps} />

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <InvoiceHistoryBody
            loading={history.loading}
            visibleInvoices={visibleInvoices}
            hasFilters={history.hasFilters}
            drafts={drafts}
            sortedPosted={sortedPosted}
            sortKey={sortKey}
            sortDir={sortDir}
            toggleSort={toggleSort}
            rowMode={history.rowMode}
            detailCache={history.detailCache}
            rowProps={buildRowProps(history)}
          />
        </div>
      </div>
      {history.conflictModal}
    </>
  );
}
