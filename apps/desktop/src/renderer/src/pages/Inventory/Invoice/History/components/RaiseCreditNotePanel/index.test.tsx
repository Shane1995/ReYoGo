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

const freeGiftInvoice: ICapturedInvoiceWithLines = {
  ...invoice,
  id: 'inv-free',
  invoiceNumber: 'INV-FREE',
  lines: [
    {
      id: 'line-fg',
      invoiceId: 'inv-free',
      itemId: 'item-fg',
      itemNameSnapshot: 'Free Sample',
      quantity: 1,
      isVatable: false,
      totalVatExclude: 0,
      unitOfMeasure: null,
    },
  ],
};

describe('RaiseCreditNotePanel', () => {
  it('renders all source invoice lines pre-selected with original quantities', () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Flour')).toBeDefined();
    expect(screen.getByText('Sugar')).toBeDefined();
    const inputs = screen.getAllByRole('spinbutton');
    // DOM order per row: [creditQty, creditPrice] — so [row1Qty, row1Price, row2Qty, row2Price]
    expect(inputs[0]).toHaveValue(10);
    expect(inputs[2]).toHaveValue(5);
  });

  it('pre-fills credit price from totalVatExclude / quantity', () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const inputs = screen.getAllByRole('spinbutton');
    // Flour: 100/10 = 10; Sugar: 50/5 = 10
    expect(inputs[1]).toHaveValue(10);
    expect(inputs[3]).toHaveValue(10);
  });

  it('pre-fills credit price as 0 for a free-gift line', () => {
    render(
      <RaiseCreditNotePanel invoice={freeGiftInvoice} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    const inputs = screen.getAllByRole('spinbutton');
    // Single row: [creditQty, creditPrice]
    expect(inputs[1]).toHaveValue(0);
  });

  it('applies amber ring class to price input when value differs from pre-fill', async () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const inputs = screen.getAllByRole('spinbutton');
    const priceInput = inputs[1]!; // row 1 creditPrice
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '12');
    expect(priceInput.className).toContain('ring-amber-400/50');
  });

  it('select-all header checkbox has indeterminate state when one of two lines is deselected', async () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]!);
    expect(checkboxes[0]!.getAttribute('aria-checked')).toBe('mixed');
  });

  it('select-all checkbox toggles all lines on', async () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]!);
    await userEvent.click(checkboxes[0]!);
    expect(checkboxes[1]!.getAttribute('aria-checked')).toBe('true');
    expect(checkboxes[2]!.getAttribute('aria-checked')).toBe('true');
  });

  it('advances to confirm step when Continue is clicked', async () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Was invoiced')).toBeDefined();
  });

  it('shows Stock only label in confirm step for a free-gift line', async () => {
    render(
      <RaiseCreditNotePanel invoice={freeGiftInvoice} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    await userEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Stock only')).toBeDefined();
  });

  it('payload sets unitPrice to the creditPrice value', async () => {
    const onConfirm = vi.fn<(payload: ISaveCreditNotePayload) => void>();
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByText('Continue'));
    await userEvent.click(screen.getByText('Confirm'));
    const payload = onConfirm.mock.lastCall?.[0];
    expect(payload?.lines[0]?.unitPrice).toBe(10);
    expect(payload?.lines[1]?.unitPrice).toBe(10);
  });

  it('payload unitPrice reflects a manually changed credit price', async () => {
    const onConfirm = vi.fn<(payload: ISaveCreditNotePayload) => void>();
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={onConfirm} onCancel={vi.fn()} />);
    const inputs = screen.getAllByRole('spinbutton');
    await userEvent.clear(inputs[1]!); // row 1 creditPrice
    await userEvent.type(inputs[1]!, '12');
    await userEvent.click(screen.getByText('Continue'));
    await userEvent.click(screen.getByText('Confirm'));
    const payload = onConfirm.mock.lastCall?.[0];
    expect(payload?.lines[0]?.unitPrice).toBe(12);
  });

  it('excludes deselected lines from the payload', async () => {
    const onConfirm = vi.fn<(payload: ISaveCreditNotePayload) => void>();
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={onConfirm} onCancel={vi.fn()} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[2]!);
    await userEvent.click(screen.getByText('Continue'));
    await userEvent.click(screen.getByText('Confirm'));
    const payload = onConfirm.mock.lastCall?.[0];
    expect(payload?.lines).toHaveLength(1);
    expect(payload?.lines[0]?.itemId).toBe('item-1');
  });

  it('disables Continue when all lines are deselected', async () => {
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]!);
    await userEvent.click(checkboxes[2]!);
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<RaiseCreditNotePanel invoice={invoice} onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
