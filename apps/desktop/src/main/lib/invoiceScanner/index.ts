import Anthropic from '@anthropic-ai/sdk';
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { VatMode, type IInvoiceScanResult, type IScannedInvoice } from '@reyogo/types';
import { getApiKey } from '../anthropicKeyStore';
import {
  INPUT_COST_PER_MILLION_TOKENS_USD,
  INVOICE_SCAN_MAX_TOKENS,
  INVOICE_SCAN_MODEL,
  INVOICE_SCAN_PROMPT,
  MAX_UPLOAD_SIZE_BYTES,
  OUTPUT_COST_PER_MILLION_TOKENS_USD,
  SUPPORTED_PDF_MIME_TYPE,
  SUPPORTED_SCAN_MIME_TYPES,
} from './constants';
import {
  FileTooLargeError,
  NoApiKeyConfiguredError,
  ScanParseError,
  ScanTruncatedError,
  UnsupportedFileTypeError,
} from './errors';
import type { RawScannedInvoice, ScanImageInput, SupportedScanMimeType } from './types';

function base64ByteLength(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return (base64.length * 3) / 4 - padding;
}

function isSupportedMimeType(mimeType: string): mimeType is SupportedScanMimeType {
  return (SUPPORTED_SCAN_MIME_TYPES as readonly string[]).includes(mimeType);
}

function assertSupportedMimeType(mimeType: string): asserts mimeType is SupportedScanMimeType {
  if (!isSupportedMimeType(mimeType)) throw new UnsupportedFileTypeError(mimeType);
}

function assertWithinSizeLimit(base64: string): void {
  if (base64ByteLength(base64) > MAX_UPLOAD_SIZE_BYTES) {
    throw new FileTooLargeError(MAX_UPLOAD_SIZE_BYTES);
  }
}

function requireApiKey(): string {
  const apiKey = getApiKey();
  if (!apiKey) throw new NoApiKeyConfiguredError();
  return apiKey;
}

function buildContentBlock(base64: string, mimeType: SupportedScanMimeType): ContentBlockParam {
  if (mimeType === SUPPORTED_PDF_MIME_TYPE) {
    return {
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: base64 },
    };
  }
  return {
    type: 'image',
    source: { type: 'base64', media_type: mimeType, data: base64 },
  };
}

function callAnthropicScan(apiKey: string, input: ScanImageInput, mimeType: SupportedScanMimeType) {
  const client = new Anthropic({ apiKey });
  return client.messages.create({
    model: INVOICE_SCAN_MODEL,
    max_tokens: INVOICE_SCAN_MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: [
          buildContentBlock(input.base64, mimeType),
          { type: 'text', text: INVOICE_SCAN_PROMPT },
        ],
      },
    ],
  });
}

function extractJsonObject(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}

function parseModelResponse(text: string): RawScannedInvoice {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned) as RawScannedInvoice;
  } catch {
    // Haiku occasionally wraps the JSON in a sentence despite the "JSON only" instruction —
    // fall back to the outermost {...} span before giving up.
    try {
      return JSON.parse(extractJsonObject(cleaned)) as RawScannedInvoice;
    } catch {
      throw new ScanParseError();
    }
  }
}

function toScannedInvoice(raw: RawScannedInvoice): IScannedInvoice {
  return {
    supplierName: raw.supplierName,
    supplierNameConfidence: raw.supplierNameConfidence,
    invoiceDate: raw.invoiceDate,
    invoiceDateConfidence: raw.invoiceDateConfidence,
    invoiceNumber: raw.invoiceNumber,
    invoiceNumberConfidence: raw.invoiceNumberConfidence,
    vatMode: raw.vatInclusive ? VatMode.Inclusive : VatMode.Exclusive,
    invoiceTotal: raw.invoiceTotal,
    lines: raw.lines,
    confidence: raw.confidence,
  };
}

function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens * INPUT_COST_PER_MILLION_TOKENS_USD +
      outputTokens * OUTPUT_COST_PER_MILLION_TOKENS_USD) /
    1_000_000
  );
}

function toInvoiceScanResult(
  response: Awaited<ReturnType<typeof callAnthropicScan>>,
): IInvoiceScanResult {
  if (response.stop_reason === 'max_tokens') {
    throw new ScanTruncatedError();
  }

  const textBlock = response.content.find((block) => block.type === 'text');
  const raw = parseModelResponse(textBlock?.type === 'text' ? textBlock.text : '');

  return {
    invoice: toScannedInvoice(raw),
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      estimatedCostUsd: estimateCostUsd(response.usage.input_tokens, response.usage.output_tokens),
    },
  };
}

export async function scanInvoiceImage(input: ScanImageInput): Promise<IInvoiceScanResult> {
  assertSupportedMimeType(input.mimeType);
  assertWithinSizeLimit(input.base64);
  const apiKey = requireApiKey();

  const response = await callAnthropicScan(apiKey, input, input.mimeType);
  return toInvoiceScanResult(response);
}
