export type ScanView =
  | { kind: 'loading'; variant: 'processing' | 'scanning' }
  | { kind: 'preview'; file: File; previewUrl: string }
  | { kind: 'upload' };
