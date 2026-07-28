export type ScanView =
  | { kind: 'loading' }
  | { kind: 'preview'; file: File; previewUrl: string }
  | { kind: 'upload' };
