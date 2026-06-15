import type { ProcessReceiptLine } from '../../types';
import type { loadDraft } from '../useDraftPersistence';

export type NavigateOptions = { reuse?: boolean };

export type Draft = ReturnType<typeof loadDraft>;

export type Pending = { lines: ProcessReceiptLine[]; reuse: boolean };
