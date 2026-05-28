import { describe, it, expect, beforeEach } from 'vitest';
import { loadDraft, saveDraft, clearDraft } from './index';

const DRAFT_KEY = 'reyogo:invoice-draft';

describe('loadDraft', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when localStorage is empty', () => {
    expect(loadDraft()).toBeNull();
  });

  it('returns parsed state when valid JSON exists', () => {
    const draft = {
      lines: [],
      invoiceNumber: 'INV-001',
      invoiceDate: '2026-01-01',
      vatMode: 'exclusive' as const,
      vatRate: 15,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    expect(loadDraft()).toEqual(draft);
  });

  it('returns null on malformed JSON', () => {
    localStorage.setItem(DRAFT_KEY, 'not-json{{{');
    expect(loadDraft()).toBeNull();
  });
});

describe('saveDraft', () => {
  it('writes correct JSON to localStorage', () => {
    const draft = {
      lines: [],
      invoiceNumber: '',
      invoiceDate: '',
      vatMode: 'exclusive' as const,
      vatRate: 15,
    };
    saveDraft(draft);
    expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!)).toEqual(draft);
  });
});

describe('clearDraft', () => {
  it('removes the key from localStorage', () => {
    localStorage.setItem(DRAFT_KEY, '{}');
    clearDraft();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
