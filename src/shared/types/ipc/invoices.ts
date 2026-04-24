export enum InvoicesIPC {
  SAVE_INVOICE = 'invoices:save-invoice',
  GET_INVOICES = 'invoices:get-invoices',
  GET_INVOICES_WITH_LINES = 'invoices:get-invoices-with-lines',
  GET_INVOICE = 'invoices:get-invoice',
  GET_LINES_FOR_ANALYSIS = 'invoices:get-lines-for-analysis',
  UPDATE_INVOICE = 'invoices:update-invoice',
  GET_INVOICE_AUDIT = 'invoices:get-invoice-audit',
  GET_LAST_UNIT_PRICES = 'invoices:get-last-unit-prices',
}
