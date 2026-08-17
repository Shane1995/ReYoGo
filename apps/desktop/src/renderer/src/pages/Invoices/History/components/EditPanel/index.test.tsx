import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvoiceStatus, VatMode } from '@reyogo/types';
import type { ICapturedInvoiceWithLines } from '@reyogo/types';
import { EditPanel } from './index';

vi.mock('@/pages/Inventory/Capture/CapturedInventory/Context/InventoryContext', () => ({
  useInventory: () => ({ items: [], categories: [] }),
}));

function baseInvoice(
  overrides: Partial<ICapturedInvoiceWithLines> = {},
): ICapturedInvoiceWithLines {
  return {
    id: 'inv-1',
    entityId: 'e1',
    supplierId: null,
    sourceInvoiceId: null,
    invoiceNumber: 'INV-1',
    invoiceDate: null,
    status: InvoiceStatus.Posted,
    vatMode: VatMode.Exclusive,
    vatRate: 15,
    createdAt: new Date(),
    updatedAt: null,
    lines: [],
    ...overrides,
  };
}

function taxableCheckboxes(): HTMLElement[] {
  return screen.getAllByRole('checkbox');
}

describe('EditPanel', () => {
  it('pre-selects Tax on the fallback line for an invoice with no lines, matching the invoice vatMode', () => {
    render(<EditPanel invoice={baseInvoice({ lines: [] })} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(taxableCheckboxes()).toHaveLength(1);
    expect(taxableCheckboxes()[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('pre-selects Tax on the replacement line when the last row is removed', () => {
    render(<EditPanel invoice={baseInvoice({ lines: [] })} onSave={vi.fn()} onCancel={vi.fn()} />);
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);
    expect(taxableCheckboxes()).toHaveLength(1);
    expect(taxableCheckboxes()[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('pre-selects Tax on a newly added row', () => {
    render(<EditPanel invoice={baseInvoice({ lines: [] })} onSave={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText('+ Add row'));
    expect(taxableCheckboxes()).toHaveLength(2);
    for (const checkbox of taxableCheckboxes()) {
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    }
  });

  it('pre-selects Tax on the fallback line even when the invoice VAT mode is Inclusive', () => {
    render(
      <EditPanel
        invoice={baseInvoice({ lines: [], vatMode: VatMode.Inclusive })}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(taxableCheckboxes()[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('shows a date field for a posted invoice', () => {
    render(
      <EditPanel
        invoice={baseInvoice({ status: InvoiceStatus.Posted, lines: [] })}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Invoice date')).toBeDefined();
  });

  it('does not show a date field for a draft invoice', () => {
    render(
      <EditPanel
        invoice={baseInvoice({ status: InvoiceStatus.Draft, lines: [] })}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('Invoice date')).toBeNull();
  });

  it('passes the edited date through to onSave for a posted invoice', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditPanel
        invoice={baseInvoice({
          status: InvoiceStatus.Posted,
          invoiceDate: new Date('2026-01-01'),
          lines: [
            {
              id: 'l1',
              invoiceId: 'inv-1',
              itemId: 'item-1',
              itemNameSnapshot: 'Flour',
              quantity: 10,
              isVatable: true,
              totalVatExclude: 100,
              unitOfMeasure: 'kg',
            },
          ],
        })}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Invoice date'), {
      target: { value: '2026-02-15' },
    });
    fireEvent.click(screen.getByText('Save changes'));

    expect(onSave).toHaveBeenCalled();
    const [, , invoiceDate] = onSave.mock.calls[0]!;
    expect(invoiceDate).toEqual(new Date('2026-02-15'));
  });

  it('passes undefined as the date for a draft invoice save', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditPanel
        invoice={baseInvoice({
          status: InvoiceStatus.Draft,
          lines: [
            {
              id: 'l1',
              invoiceId: 'inv-1',
              itemId: 'item-1',
              itemNameSnapshot: 'Flour',
              quantity: 10,
              isVatable: true,
              totalVatExclude: 100,
              unitOfMeasure: 'kg',
            },
          ],
        })}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Save changes'));

    const [, , invoiceDate] = onSave.mock.calls[0]!;
    expect(invoiceDate).toBeUndefined();
  });
});
