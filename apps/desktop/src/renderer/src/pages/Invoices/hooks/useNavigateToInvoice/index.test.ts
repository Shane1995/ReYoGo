import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
import type { ReactElement } from 'react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockLoadDraft = vi.fn();
const mockSaveDraft = vi.fn();
vi.mock('../useDraftPersistence', () => ({
  loadDraft: (...args: unknown[]) => mockLoadDraft(...args),
  saveDraft: (...args: unknown[]) => mockSaveDraft(...args),
}));

import { useNavigateToInvoice } from './index';
import { InvoiceRoutes } from '@/components/AppRoutes/routePaths';

function makeLines(ids: string[]) {
  return ids.map((itemId) => ({
    id: crypto.randomUUID(),
    itemId,
    quantity: 0,
    isVatable: false,
    totalVatExclude: 0,
  }));
}

function makeDraft(itemIds: string[]) {
  return {
    lines: makeLines(itemIds),
    invoiceNumber: 'INV-001',
    invoiceDate: '2026-01-01',
    vatMode: VatMode.Exclusive,
  };
}

type ModalProps = {
  open: boolean;
  draftItemCount: number;
  onAppend: () => void;
  onFresh: () => void;
  onCancel: () => void;
};

function modalProps(conflictModal: ReactElement): ModalProps {
  return (conflictModal as ReactElement<ModalProps>).props;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLoadDraft.mockReturnValue(null);
});

describe('useNavigateToInvoice', () => {
  describe('navigateToInvoice', () => {
    it('navigates directly when there is no existing draft', () => {
      mockLoadDraft.mockReturnValue(null);
      const { result } = renderHook(() => useNavigateToInvoice());
      const lines = makeLines(['item-1']);

      act(() => result.current.navigateToInvoice(lines));

      expect(mockNavigate).toHaveBeenCalledWith(InvoiceRoutes.Base, {
        state: { templateLines: lines, isReuse: false },
      });
    });

    it('navigates directly when existing draft has no items', () => {
      mockLoadDraft.mockReturnValue(makeDraft([]));
      const { result } = renderHook(() => useNavigateToInvoice());
      const lines = makeLines(['item-1']);

      act(() => result.current.navigateToInvoice(lines));

      expect(mockNavigate).toHaveBeenCalledWith(InvoiceRoutes.Base, {
        state: { templateLines: lines, isReuse: false },
      });
    });

    it('shows conflict modal when draft has existing items', () => {
      mockLoadDraft.mockReturnValue(makeDraft(['existing-item']));
      const { result } = renderHook(() => useNavigateToInvoice());

      act(() => result.current.navigateToInvoice(makeLines(['new-item'])));

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(modalProps(result.current.conflictModal).open).toBe(true);
    });

    it('sets draftItemCount from the existing draft', () => {
      mockLoadDraft.mockReturnValue(makeDraft(['item-a', 'item-b']));
      const { result } = renderHook(() => useNavigateToInvoice());

      act(() => result.current.navigateToInvoice(makeLines(['item-c'])));

      expect(modalProps(result.current.conflictModal).draftItemCount).toBe(2);
    });

    it('bypasses conflict modal when reuse: true even if draft has items', () => {
      mockLoadDraft.mockReturnValue(makeDraft(['existing-item']));
      const { result } = renderHook(() => useNavigateToInvoice());
      const lines = makeLines(['new-item']);

      act(() => result.current.navigateToInvoice(lines, { reuse: true }));

      expect(mockNavigate).toHaveBeenCalledWith(InvoiceRoutes.Base, {
        state: { templateLines: lines, isReuse: true },
      });
      expect(modalProps(result.current.conflictModal).open).toBe(false);
    });
  });

  describe('handleAppend (onAppend)', () => {
    it('merges new lines with existing draft and navigates', () => {
      const existing = makeDraft(['item-a']);
      mockLoadDraft.mockReturnValue(existing);

      const { result } = renderHook(() => useNavigateToInvoice());
      const newLines = makeLines(['item-b']);

      act(() => result.current.navigateToInvoice(newLines));

      mockLoadDraft.mockReturnValue(existing);
      act(() => modalProps(result.current.conflictModal).onAppend());

      expect(mockSaveDraft).toHaveBeenCalledOnce();
      const saved = mockSaveDraft.mock.calls[0]![0];
      const savedIds = saved.lines.map((l: { itemId: string }) => l.itemId);
      expect(savedIds).toContain('item-a');
      expect(savedIds).toContain('item-b');
    });

    it('deduplicates lines already present in the draft', () => {
      const existing = makeDraft(['item-a', 'item-b']);
      mockLoadDraft.mockReturnValue(existing);

      const { result } = renderHook(() => useNavigateToInvoice());
      const newLines = makeLines(['item-b', 'item-c']);

      act(() => result.current.navigateToInvoice(newLines));

      mockLoadDraft.mockReturnValue(existing);
      act(() => modalProps(result.current.conflictModal).onAppend());

      const saved = mockSaveDraft.mock.calls[0]![0];
      const savedIds = saved.lines.map((l: { itemId: string }) => l.itemId);
      expect(savedIds.filter((id: string) => id === 'item-b')).toHaveLength(1);
      expect(savedIds).toContain('item-c');
    });

    it('navigates with isReuse: false after appending', () => {
      const existing = makeDraft(['item-a']);
      mockLoadDraft.mockReturnValue(existing);

      const { result } = renderHook(() => useNavigateToInvoice());
      act(() => result.current.navigateToInvoice(makeLines(['item-b'])));

      mockLoadDraft.mockReturnValue(existing);
      act(() => modalProps(result.current.conflictModal).onAppend());

      expect(mockNavigate).toHaveBeenCalledWith(
        InvoiceRoutes.Base,
        expect.objectContaining({
          state: expect.objectContaining({ templateLines: expect.any(Array), isReuse: false }),
        }),
      );
    });

    it('closes the modal after appending', () => {
      const existing = makeDraft(['item-a']);
      mockLoadDraft.mockReturnValue(existing);

      const { result } = renderHook(() => useNavigateToInvoice());
      act(() => result.current.navigateToInvoice(makeLines(['item-b'])));

      mockLoadDraft.mockReturnValue(existing);
      act(() => modalProps(result.current.conflictModal).onAppend());

      expect(modalProps(result.current.conflictModal).open).toBe(false);
    });
  });

  describe('handleFresh (onFresh)', () => {
    it('navigates with the pending lines and isReuse: false', () => {
      mockLoadDraft.mockReturnValue(makeDraft(['item-a']));

      const { result } = renderHook(() => useNavigateToInvoice());
      const newLines = makeLines(['item-b']);
      act(() => result.current.navigateToInvoice(newLines));

      act(() => modalProps(result.current.conflictModal).onFresh());

      expect(mockNavigate).toHaveBeenCalledWith(InvoiceRoutes.Base, {
        state: { templateLines: newLines, isReuse: false },
      });
    });

    it('closes the modal after starting fresh', () => {
      mockLoadDraft.mockReturnValue(makeDraft(['item-a']));

      const { result } = renderHook(() => useNavigateToInvoice());
      act(() => result.current.navigateToInvoice(makeLines(['item-b'])));
      act(() => modalProps(result.current.conflictModal).onFresh());

      expect(modalProps(result.current.conflictModal).open).toBe(false);
    });
  });

  describe('handleCancel (onCancel)', () => {
    it('closes the modal without navigating', () => {
      mockLoadDraft.mockReturnValue(makeDraft(['item-a']));

      const { result } = renderHook(() => useNavigateToInvoice());
      act(() => result.current.navigateToInvoice(makeLines(['item-b'])));

      expect(modalProps(result.current.conflictModal).open).toBe(true);

      act(() => modalProps(result.current.conflictModal).onCancel());

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(modalProps(result.current.conflictModal).open).toBe(false);
    });
  });

  describe('conflictModal initial state', () => {
    it('is closed by default', () => {
      const { result } = renderHook(() => useNavigateToInvoice());
      expect(modalProps(result.current.conflictModal).open).toBe(false);
    });
  });
});
