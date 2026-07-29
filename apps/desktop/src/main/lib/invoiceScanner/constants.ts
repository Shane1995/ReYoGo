export const INVOICE_SCAN_MODEL = 'claude-sonnet-5';
// Each line item now carries 5 fields (incl. two confidence ratings), so a longer invoice can
// easily need several hundred output tokens on its own — 1024 was truncating mid-JSON on
// anything past ~8 lines.
export const INVOICE_SCAN_MAX_TOKENS = 4096;

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const INPUT_COST_PER_MILLION_TOKENS_USD = 3;
export const OUTPUT_COST_PER_MILLION_TOKENS_USD = 15;

export const SUPPORTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'] as const;
export const SUPPORTED_PDF_MIME_TYPE = 'application/pdf';
export const SUPPORTED_SCAN_MIME_TYPES = [
  ...SUPPORTED_IMAGE_MIME_TYPES,
  SUPPORTED_PDF_MIME_TYPE,
] as const;

export const INVOICE_SCAN_PROMPT = `Extract invoice data from this document. Return JSON only, no other text:
{
  "supplierName": "string or null",
  "supplierNameConfidence": "high | medium | low",
  "invoiceDate": "YYYY-MM-DD or null",
  "invoiceDateConfidence": "high | medium | low",
  "invoiceNumber": "string or null",
  "invoiceNumberConfidence": "high | medium | low",
  "vatInclusive": true or false,
  "invoiceTotal": number or null,
  "lines": [
    {
      "description": "item name",
      "quantity": number,
      "unitPrice": number,
      "isVatable": true or false or null,
      "quantityConfidence": "high | medium | low",
      "unitPriceConfidence": "high | medium | low"
    }
  ],
  "confidence": "high | medium | low"
}

Rules:
- unitPrice should always be the price per single unit
- If VAT/tax is shown as included in the prices, set vatInclusive to true
- invoiceTotal is specifically the final "Total" or "Amount Due" printed on the document — the
  single figure a human would pay. Do NOT use a VAT/tax line, a subtotal, a deposit, or any other
  intermediate figure. If you are not confident which printed number is the true final total,
  use null rather than guessing — a wrong invoiceTotal is worse than none, since it is used to
  cross-check the extracted lines
- If you cannot read a value clearly, use null — do not guess
- supplierNameConfidence / invoiceDateConfidence / invoiceNumberConfidence reflect how legible
  and unambiguous that field was; if the value itself is null because you couldn't read it, set
  its confidence to "low"
- isVatable reflects only what the document itself shows for that specific line — e.g. an
  explicit $0/zero tax column, or a "zero-rated"/"VAT exempt" label or section. Do NOT infer this
  from general knowledge of which categories of goods are usually taxable — if the document
  doesn't show explicit per-line tax status, use null
- quantityConfidence / unitPriceConfidence reflect how legible and unambiguous that specific
  value was on the document, independent of the overall confidence field
- If given a PDF, only read the first page
- confidence = high if most fields are clear, medium if some are unclear, low if the document is poor quality`;
