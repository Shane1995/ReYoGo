export const InvoicesIPC = {
  SAVE_INVOICE: 'invoices:save-invoice',
  SAVE_AND_POST_INVOICE: 'invoices:save-and-post-invoice',
  POST_INVOICE: 'invoices:post-invoice',
  GET_INVOICES: 'invoices:get-invoices',
  GET_INVOICES_WITH_LINES: 'invoices:get-invoices-with-lines',
  GET_INVOICE: 'invoices:get-invoice',
  GET_LINES_FOR_ANALYSIS: 'invoices:get-lines-for-analysis',
  UPDATE_INVOICE: 'invoices:update-invoice',
  UPDATE_INVOICE_METADATA: 'invoices:update-invoice-metadata',
  GET_INVOICE_AUDIT: 'invoices:get-invoice-audit',
  GET_LAST_UNIT_PRICES: 'invoices:get-last-unit-prices',
  SAVE_CREDIT_NOTE: 'invoices:save-credit-note',
  GET_CREDIT_NOTES_FOR_INVOICE: 'invoices:get-credit-notes-for-invoice',
  GET_CREDITED_QTY_BY_INVOICE_ITEM: 'invoices:get-credited-qty-by-invoice-item',
} as const;

export type InvoicesIPC = (typeof InvoicesIPC)[keyof typeof InvoicesIPC];
