import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
import { loadDraft, saveDraft, useDraftPersistence } from './index';

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
      vatMode: VatMode.Exclusive,
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
      vatMode: VatMode.Exclusive,
    };
    saveDraft(draft);
    expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!)).toEqual(draft);
  });
});

describe('useDraftPersistence clearDraft', () => {
  beforeEach(() => localStorage.clear());

  it('removes the key from localStorage when invoked', () => {
    localStorage.setItem(DRAFT_KEY, '{}');
    const { result } = renderHook(() => useDraftPersistence([], '', '', VatMode.Exclusive, true));
    result.current.clearDraft();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
