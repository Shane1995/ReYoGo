import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreate, mockGetApiKey, AnthropicErrors } = vi.hoisted(() => {
  class MockAPIError extends Error {
    status?: number;
    constructor(status: number | undefined, message: string) {
      super(message);
      this.status = status;
    }
  }
  class MockAuthenticationError extends MockAPIError {}
  class MockPermissionDeniedError extends MockAPIError {}
  class MockRateLimitError extends MockAPIError {}
  class MockInternalServerError extends MockAPIError {}
  class MockAPIConnectionError extends MockAPIError {}

  return {
    mockCreate: vi.fn(),
    mockGetApiKey: vi.fn(),
    AnthropicErrors: {
      APIError: MockAPIError,
      AuthenticationError: MockAuthenticationError,
      PermissionDeniedError: MockPermissionDeniedError,
      RateLimitError: MockRateLimitError,
      InternalServerError: MockInternalServerError,
      APIConnectionError: MockAPIConnectionError,
    },
  };
});

vi.mock('@anthropic-ai/sdk', () => ({
  default: Object.assign(
    class MockAnthropic {
      messages = { create: mockCreate };
    },
    AnthropicErrors,
  ),
}));

vi.mock('../anthropicKeyStore', () => ({
  getApiKey: mockGetApiKey,
}));

import { scanInvoiceImage } from './index';
import {
  NoApiKeyConfiguredError,
  UnsupportedFileTypeError,
  FileTooLargeError,
  ScanApiError,
  ScanParseError,
  ScanTruncatedError,
} from './errors';
import { VatMode } from '@reyogo/types';
import { MAX_UPLOAD_SIZE_BYTES } from './constants';

function mockResponse(json: unknown, usage = { input_tokens: 1000, output_tokens: 200 }) {
  return {
    content: [{ type: 'text', text: JSON.stringify(json) }],
    usage,
    stop_reason: 'end_turn',
  };
}

describe('scanInvoiceImage', () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockGetApiKey.mockReset();
    mockGetApiKey.mockReturnValue('sk-ant-test');
  });

  it('throws when no API key is configured', async () => {
    mockGetApiKey.mockReturnValue(null);

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      NoApiKeyConfiguredError,
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('throws for an unsupported mime type', async () => {
    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/gif' })).rejects.toThrow(
      UnsupportedFileTypeError,
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('throws when the file exceeds the size cap', async () => {
    const oversized = 'A'.repeat(Math.ceil((MAX_UPLOAD_SIZE_BYTES + 1) * (4 / 3)));

    await expect(scanInvoiceImage({ base64: oversized, mimeType: 'image/png' })).rejects.toThrow(
      FileTooLargeError,
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('maps a valid response into a ScannedInvoice with usage and cost', async () => {
    mockCreate.mockResolvedValue(
      mockResponse({
        supplierName: 'Acme Foods',
        supplierNameConfidence: 'high',
        invoiceDate: '2026-07-01',
        invoiceDateConfidence: 'high',
        invoiceNumber: 'INV-42',
        invoiceNumberConfidence: 'high',
        vatInclusive: true,
        invoiceTotal: 25,
        lines: [
          {
            description: 'Tomatoes',
            quantity: 10,
            unitPrice: 2.5,
            isVatable: true,
            quantityConfidence: 'high',
            unitPriceConfidence: 'high',
          },
        ],
        confidence: 'high',
      }),
    );

    const result = await scanInvoiceImage({ base64: 'abc', mimeType: 'image/jpeg' });

    expect(result.invoice).toEqual({
      supplierName: 'Acme Foods',
      supplierNameConfidence: 'high',
      invoiceDate: '2026-07-01',
      invoiceDateConfidence: 'high',
      invoiceNumber: 'INV-42',
      invoiceNumberConfidence: 'high',
      vatMode: VatMode.Inclusive,
      invoiceTotal: 25,
      lines: [
        {
          description: 'Tomatoes',
          quantity: 10,
          unitPrice: 2.5,
          isVatable: true,
          quantityConfidence: 'high',
          unitPriceConfidence: 'high',
        },
      ],
      confidence: 'high',
    });
    expect(result.usage.inputTokens).toBe(1000);
    expect(result.usage.outputTokens).toBe(200);
    expect(result.usage.estimatedCostUsd).toBeCloseTo(
      1000 * (1 / 1_000_000) + 200 * (5 / 1_000_000),
    );
  });

  it('maps vatInclusive: false to VatMode.Exclusive', async () => {
    mockCreate.mockResolvedValue(
      mockResponse({
        supplierName: null,
        invoiceDate: null,
        invoiceNumber: null,
        vatInclusive: false,
        invoiceTotal: null,
        lines: [],
        confidence: 'low',
      }),
    );

    const result = await scanInvoiceImage({ base64: 'abc', mimeType: 'application/pdf' });

    expect(result.invoice.vatMode).toBe(VatMode.Exclusive);
  });

  it('strips markdown code fences before parsing', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: '```json\n{"supplierName":null,"invoiceDate":null,"invoiceNumber":null,"vatInclusive":false,"invoiceTotal":null,"lines":[],"confidence":"low"}\n```',
        },
      ],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const result = await scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' });

    expect(result.invoice.confidence).toBe('low');
  });

  it('throws ScanParseError when the model response is not valid JSON', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not json' }],
      usage: { input_tokens: 10, output_tokens: 5 },
      stop_reason: 'end_turn',
    });

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      ScanParseError,
    );
  });

  it('parses JSON even when the model wraps it in a sentence instead of a code fence', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'Here is the extracted invoice data: {"supplierName":"Acme","invoiceDate":null,"invoiceNumber":null,"vatInclusive":false,"invoiceTotal":null,"lines":[],"confidence":"medium"} Let me know if you need anything else.',
        },
      ],
      usage: { input_tokens: 10, output_tokens: 5 },
      stop_reason: 'end_turn',
    });

    const result = await scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' });

    expect(result.invoice.supplierName).toBe('Acme');
  });

  it('throws ScanTruncatedError when the response was cut off at the token limit', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"supplierName":"Acme","lines":[{"description":"Tomat' }],
      usage: { input_tokens: 900, output_tokens: 4096 },
      stop_reason: 'max_tokens',
    });

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      ScanTruncatedError,
    );
  });

  it('maps a 529 overloaded error to a friendly, retryable message', async () => {
    mockCreate.mockRejectedValue(new AnthropicErrors.InternalServerError(529, 'Overloaded'));

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      ScanApiError,
    );
    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      /overloaded/i,
    );
  });

  it('maps a generic 500 error to a friendly server-error message', async () => {
    mockCreate.mockRejectedValue(new AnthropicErrors.InternalServerError(500, 'Internal error'));

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      /had a problem/i,
    );
  });

  it('maps a 401 authentication error to a friendly message pointing at AI Settings', async () => {
    mockCreate.mockRejectedValue(new AnthropicErrors.AuthenticationError(401, 'invalid x-api-key'));

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      /AI Settings/,
    );
  });

  it('maps a 403 permission error to a friendly message', async () => {
    mockCreate.mockRejectedValue(new AnthropicErrors.PermissionDeniedError(403, 'forbidden'));

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      /permission/i,
    );
  });

  it('maps a 429 rate limit error to a friendly message', async () => {
    mockCreate.mockRejectedValue(new AnthropicErrors.RateLimitError(429, 'rate limited'));

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      /too many scans/i,
    );
  });

  it('maps a network connection error to a friendly message', async () => {
    mockCreate.mockRejectedValue(new AnthropicErrors.APIConnectionError(undefined, 'fetch failed'));

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      /internet connection/i,
    );
  });

  it('falls back to a generic message for an unrecognized Anthropic API error', async () => {
    mockCreate.mockRejectedValue(new AnthropicErrors.APIError(418, "I'm a teapot"));

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      /failed unexpectedly/i,
    );
  });

  it('passes through non-Anthropic errors unchanged', async () => {
    mockCreate.mockRejectedValue(new ScanTruncatedError());

    await expect(scanInvoiceImage({ base64: 'abc', mimeType: 'image/png' })).rejects.toThrow(
      ScanTruncatedError,
    );
  });
});
