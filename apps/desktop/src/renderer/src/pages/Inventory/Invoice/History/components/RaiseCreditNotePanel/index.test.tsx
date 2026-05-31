import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RaiseCreditNotePanel } from '.';
import type { ICapturedInvoiceWithLines, ISaveCreditNotePayload } from '@reyogo/types';
import { InvoiceStatus, VatMode } from '@reyogo/types';

const invoice: ICapturedInvoiceWithLines = {
  id: 'inv-1',
  entityId: 'default',
  supplierId: null,
  sourceInvoiceId: null,
  invoiceNumber: 'INV-001',
  invoiceDate: null,
  status: InvoiceStatus.Posted,
  vatMode: VatMode.Exclusive,
  vatRate: 15,
  createdAt: new Date('2026-01-01'),
  updatedAt: null,
  lines: [
    {
      id: 'line-1',
      invoiceId: 'inv-1',
      itemId: 'item-1',
      itemNameSnapshot: 'Flour',
      quantity: 10,
      isVatable: true,
      totalVatExclude: 100,
      unitOfMeasure: 'kg',
    },
    {
      id: 'line-2',
      invoiceId: 'inv-1',
      itemId: 'item-2',
      itemNameSnapshot: 'Sugar',
      quantity: 5,
      isVatable: true,
      totalVatExclude: 50,
      unitOfMeasure: 'kg',
    },
  ],
};

describe('RaiseCreditNotePanel', () => {
  it('renders all source invoice lines pre-selected with original quantities', () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Flour')).toBeDefined();
    expect(screen.getByText('Sugar')).toBeDefined();
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(10);
    expect(inputs[1]).toHaveValue(5);
  });

  it('advances to confirm step when Continue is clicked', async () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Confirm credit note')).toBeDefined();
  });

  it('calls onConfirm with the payload when Confirm is clicked', async () => {
    const onConfirm = vi.fn<(payload: ISaveCreditNotePayload) => void>();
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText('Continue'));
    await userEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledOnce();
    const payload = onConfirm.mock.lastCall?.[0];
    expect(payload?.sourceInvoiceId).toBe('inv-1');
    expect(payload?.lines).toHaveLength(2);
  });

  it('excludes deselected lines from the payload', async () => {
    const onConfirm = vi.fn<(payload: ISaveCreditNotePayload) => void>();
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={onConfirm} onCancel={vi.fn()} />);
    const [, secondCheckbox] = screen.getAllByRole('checkbox');
    await userEvent.click(secondCheckbox!);
    await userEvent.click(screen.getByText('Continue'));
    await userEvent.click(screen.getByText('Confirm'));
    const payload = onConfirm.mock.lastCall?.[0];
    expect(payload?.lines).toHaveLength(1);
    expect(payload?.lines[0]?.itemId).toBe('item-1');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables Continue when all lines are deselected', async () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const [first, second] = screen.getAllByRole('checkbox');
    await userEvent.click(first!);
    await userEvent.click(second!);
    expect(screen.getByText('Continue')).toBeDisabled();
  });
});
