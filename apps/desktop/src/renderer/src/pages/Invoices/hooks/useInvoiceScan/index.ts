import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { VatMode, type IScannedInvoice, type IScannedInvoiceLine } from '@reyogo/types';
import { invoiceScanService } from '@/services/invoiceScan';
import { ipcErrorMessage } from '@/utils/ipcErrorMessage';
import { fileToBase64 } from '../../utils/fileToBase64';
import { matchScannedLineToItem } from '../../utils/matchScannedLineToItem';
import { matchScannedSupplier } from '../../utils/matchScannedSupplier';
import { reconcileScannedTotal } from '../../utils/reconcileScannedTotal';
import type { TotalMismatch } from '../../utils/reconcileScannedTotal/types';
import { scannedInvoiceReviewNotes } from '../../utils/scannedInvoiceReviewNotes';
import type { ItemOption } from '../../components/ItemAutocomplete';
import type { ProcessReceiptLine } from '../../types';
import { useAiConfigured } from './useAiConfigured';
import { useHeaderReviewState } from './useHeaderReviewState';
import { useScanFileSelection } from './useScanFileSelection';
import { useScanSummary } from './useScanSummary';
import type { HeaderReview, UseInvoiceScanParams } from './types';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function toProcessReceiptLine(
  line: IScannedInvoiceLine,
  itemsWithCategory: ItemOption[],
): ProcessReceiptLine {
  const { itemId, matched } = matchScannedLineToItem(line.description, itemsWithCategory);
  return {
    id: window.crypto.randomUUID(),
    itemId,
    quantity: line.quantity,
    isVatable: line.isVatable ?? true,
    totalVatExclude: round2(line.quantity * line.unitPrice),
    needsReview: !matched,
    quantityNeedsReview: line.quantityConfidence !== 'high',
    totalNeedsReview: line.unitPriceConfidence !== 'high',
    taxNeedsReview: line.isVatable === false,
  };
}

function supplierHeaderNeedsReview(invoice: IScannedInvoice, matchedSupplierId: string): boolean {
  return !invoice.supplierName || invoice.supplierNameConfidence !== 'high' || !matchedSupplierId;
}

function dateHeaderNeedsReview(invoice: IScannedInvoice): boolean {
  return !invoice.invoiceDate || invoice.invoiceDateConfidence !== 'high';
}

function invoiceNumberHeaderNeedsReview(invoice: IScannedInvoice): boolean {
  return !invoice.invoiceNumber || invoice.invoiceNumberConfidence !== 'high';
}

function buildHeaderReview(invoice: IScannedInvoice, matchedSupplierId: string): HeaderReview {
  return {
    supplier: supplierHeaderNeedsReview(invoice, matchedSupplierId),
    date: dateHeaderNeedsReview(invoice),
    invoiceNumber: invoiceNumberHeaderNeedsReview(invoice),
  };
}

function applyScannedLines(
  lines: IScannedInvoiceLine[],
  itemsWithCategory: ItemOption[],
  setLines: (lines: ProcessReceiptLine[]) => void,
): ProcessReceiptLine[] {
  const scannedLines = lines.map((line) => toProcessReceiptLine(line, itemsWithCategory));
  if (scannedLines.length > 0) setLines(scannedLines);
  return scannedLines;
}

function scanToastDescription(reviewNotes: string[], totalMismatch: TotalMismatch | null): string {
  if (reviewNotes.length > 0 || totalMismatch)
    return 'Review the highlighted fields before saving.';
  return 'All fields were pre-filled with high confidence.';
}

export function useInvoiceScan(params: UseInvoiceScanParams) {
  const {
    itemsWithCategory,
    suppliers,
    setInvoiceNumber,
    setInvoiceDate,
    setSupplierId,
    setVatMode,
    setLines,
  } = params;

  const configured = useAiConfigured();
  const [modalOpen, setModalOpen] = useState(false);
  const file = useScanFileSelection();
  const summary = useScanSummary();
  const headerReviewState = useHeaderReviewState({
    setInvoiceNumber,
    setInvoiceDate,
    setSupplierId,
  });

  const openModal = useCallback(() => {
    file.discardSelection();
    setModalOpen(true);
  }, [file]);

  const closeModal = useCallback(() => {
    if (file.status === 'scanning') return;
    file.discardSelection();
    setModalOpen(false);
  }, [file]);

  const applyScanResult = useCallback(
    (
      result: Awaited<ReturnType<typeof invoiceScanService.scan>>,
      meta: {
        previewUrl: string | null;
        fileName: string;
        mimeType: string;
        fileSizeBytes: number;
      },
    ) => {
      const { invoice, usage } = result;

      setInvoiceNumber(invoice.invoiceNumber ?? '');
      setInvoiceDate(invoice.invoiceDate ?? '');
      setVatMode(invoice.vatMode ?? VatMode.Exclusive);
      const matchedSupplierId = matchScannedSupplier(invoice.supplierName, suppliers);
      setSupplierId(matchedSupplierId);
      headerReviewState.setHeaderReview(buildHeaderReview(invoice, matchedSupplierId));

      const scannedLines = applyScannedLines(invoice.lines, itemsWithCategory, setLines);
      const unmatchedCount = scannedLines.filter((l) => l.needsReview).length;
      const reviewNotes = scannedInvoiceReviewNotes(invoice, unmatchedCount);
      const totalMismatch = reconcileScannedTotal(invoice.lines, invoice.invoiceTotal);
      summary.setLastSummary({
        usage,
        reviewNotes,
        totalMismatch,
        confidence: invoice.confidence,
        scannedAt: new Date(),
        previewUrl: meta.previewUrl,
        fileName: meta.fileName,
        mimeType: meta.mimeType,
        fileSizeBytes: meta.fileSizeBytes,
      });

      toast.success('Invoice scanned', {
        description: scanToastDescription(reviewNotes, totalMismatch),
      });
    },
    [
      itemsWithCategory,
      suppliers,
      setInvoiceNumber,
      setInvoiceDate,
      setSupplierId,
      setVatMode,
      setLines,
      headerReviewState,
      summary,
    ],
  );

  const confirmScan = useCallback(async () => {
    const selectedFile = file.selectedFile;
    if (!selectedFile) return;

    file.setStatus('scanning');
    file.setErrorMessage('');
    try {
      const base64 = await fileToBase64(selectedFile);
      const result = await invoiceScanService.scan({ base64, mimeType: selectedFile.type });
      applyScanResult(result, {
        previewUrl: URL.createObjectURL(selectedFile),
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        fileSizeBytes: selectedFile.size,
      });
      file.setSelectedFile(null);
      file.setPreviewUrl(null);
      file.setStatus('idle');
      setModalOpen(false);
    } catch (err) {
      file.setStatus('error');
      file.setErrorMessage(ipcErrorMessage(err, 'Failed to scan the invoice.'));
    }
  }, [file, applyScanResult]);

  return {
    configured,
    modalOpen,
    status: file.status,
    errorMessage: file.errorMessage,
    selectedFile: file.selectedFile,
    previewUrl: file.previewUrl,
    lastSummary: summary.lastSummary,
    headerReview: headerReviewState.headerReview,
    openModal,
    closeModal,
    clearSummary: summary.clearSummary,
    handleFileSelected: file.handleFileSelected,
    confirmScan,
    chooseDifferentFile: file.discardSelection,
    handleInvoiceNumberChange: headerReviewState.handleInvoiceNumberChange,
    handleInvoiceDateChange: headerReviewState.handleInvoiceDateChange,
    handleSupplierChange: headerReviewState.handleSupplierChange,
  };
}
