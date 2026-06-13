import type { FileInputChangeEvent } from './types';

export function getSelectedFile(e: FileInputChangeEvent): File | undefined {
  return e.target.files?.[0];
}
