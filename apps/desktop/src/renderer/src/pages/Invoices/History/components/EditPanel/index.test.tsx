import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
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
    status: 'posted' as ICapturedInvoiceWithLines['status'],
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

  it('does not pre-select Tax when the invoice VAT mode is Inclusive', () => {
    render(
      <EditPanel
        invoice={baseInvoice({ lines: [], vatMode: VatMode.Inclusive })}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(taxableCheckboxes()[0]).toHaveAttribute('aria-checked', 'false');
  });
});
