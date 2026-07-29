export class NoApiKeyConfiguredError extends Error {
  constructor() {
    super('No Anthropic API key is configured.');
    this.name = 'NoApiKeyConfiguredError';
  }
}

export class UnsupportedFileTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported file type "${mimeType}" — expected JPG, PNG, or PDF.`);
    this.name = 'UnsupportedFileTypeError';
  }
}

export class FileTooLargeError extends Error {
  constructor(maxBytes: number) {
    super(`File exceeds the ${Math.round(maxBytes / (1024 * 1024))}MB size limit.`);
    this.name = 'FileTooLargeError';
  }
}

export class ScanParseError extends Error {
  constructor() {
    super('Could not read the scan result — the model response was not valid JSON.');
    this.name = 'ScanParseError';
  }
}

export class ScanTruncatedError extends Error {
  constructor() {
    super(
      'This invoice has too many line items to read in one pass — try scanning a photo of just the line items section, or split it across two scans.',
    );
    this.name = 'ScanTruncatedError';
  }
}

export class ScanApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScanApiError';
  }
}
