CREATE TABLE IF NOT EXISTS invoice_audit_log (
  id TEXT PRIMARY KEY NOT NULL,
  invoice_id TEXT NOT NULL REFERENCES captured_invoices(id) ON DELETE CASCADE,
  edited_at INTEGER NOT NULL,
  note TEXT,
  snapshot TEXT NOT NULL
);
