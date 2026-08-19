import { useEffect, useMemo } from 'react';
import { useCreditReportData } from './hooks/useCreditReportData';
import { availableCategoriesOfItemTotals } from '../../utils/availableCategoriesOfItemTotals';
import { filterItemTotalsByCategories } from '../../utils/filterItemTotalsByCategories';
import { availableTypesOfItemTotals } from '../../utils/availableTypesOfItemTotals';
import { filterItemTotalsByType } from '../../utils/filterItemTotalsByType';
import { grandItemTotalOf } from '../../utils/grandItemTotalOf';
import { useAvailableOptionsSync } from '../../hooks/useAvailableOptionsSync';
import { ItemTotalsTable } from '../ItemTotalsTable';
import type { CreditReportViewProps } from './types';

export function CreditReportView({
  fromDate,
  toDate,
  entityId,
  selectedCategories,
  selectedType,
  onRowsChange,
  onAvailableCategoriesChange,
  onAvailableTypesChange,
}: CreditReportViewProps) {
  const { loading, rows } = useCreditReportData(fromDate, toDate, entityId);

  const availableCategories = useMemo(() => availableCategoriesOfItemTotals(rows), [rows]);
  const availableTypes = useMemo(() => availableTypesOfItemTotals(rows), [rows]);
  const filteredRows = useMemo(() => {
    const byCategory = filterItemTotalsByCategories(rows, selectedCategories);
    return filterItemTotalsByType(byCategory, selectedType);
  }, [rows, selectedCategories, selectedType]);

  useEffect(() => {
    onRowsChange(filteredRows);
  }, [filteredRows, onRowsChange]);

  useAvailableOptionsSync({
    availableCategories,
    availableTypes,
    onAvailableCategoriesChange,
    onAvailableTypesChange,
  });

  if (loading) {
    return <p className="text-sm text-muted-foreground/60">Loading…</p>;
  }

  return (
    <ItemTotalsTable
      rows={filteredRows}
      grandTotal={grandItemTotalOf(filteredRows)}
      emptyMessage="No credits in this range."
    />
  );
}
