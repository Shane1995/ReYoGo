import { useCallback, useState } from 'react';
import { NO_HEADER_REVIEW } from '../constants';
import type { HeaderReview } from '../types';
import type { UseHeaderReviewStateParams } from './types';

export function useHeaderReviewState({
  setInvoiceNumber,
  setInvoiceDate,
  setSupplierId,
}: UseHeaderReviewStateParams) {
  const [headerReview, setHeaderReview] = useState<HeaderReview>(NO_HEADER_REVIEW);

  const handleInvoiceNumberChange = useCallback(
    (v: string) => {
      setInvoiceNumber(v);
      setHeaderReview((h) => ({ ...h, invoiceNumber: false }));
    },
    [setInvoiceNumber],
  );

  const handleInvoiceDateChange = useCallback(
    (v: string) => {
      setInvoiceDate(v);
      setHeaderReview((h) => ({ ...h, date: false }));
    },
    [setInvoiceDate],
  );

  const handleSupplierChange = useCallback(
    (id: string) => {
      setSupplierId(id);
      setHeaderReview((h) => ({ ...h, supplier: false }));
    },
    [setSupplierId],
  );

  return {
    headerReview,
    setHeaderReview,
    handleInvoiceNumberChange,
    handleInvoiceDateChange,
    handleSupplierChange,
  };
}
