import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CountSheetRowInput } from '.';

const row = { itemId: 'item-1', itemName: 'Milk', uom: 'L', lastCost: 4.5, countedQty: null };

describe('CountSheetRowInput', () => {
  it('shows the item name, unit, and last cost', () => {
    render(<CountSheetRowInput row={row} readOnly={false} onQtyChange={vi.fn()} />);
    expect(screen.getByText('Milk')).toBeDefined();
    expect(screen.getByText('L')).toBeDefined();
    expect(screen.getByText('4.5')).toBeDefined();
  });

  it('calls onQtyChange with a parsed number when the qty input changes', () => {
    const onQtyChange = vi.fn();
    render(<CountSheetRowInput row={row} readOnly={false} onQtyChange={onQtyChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '12' } });
    expect(onQtyChange).toHaveBeenCalledWith('item-1', 12);
  });

  it('calls onQtyChange with null when the qty input is cleared', () => {
    const onQtyChange = vi.fn();
    render(
      <CountSheetRowInput
        row={{ ...row, countedQty: 5 }}
        readOnly={false}
        onQtyChange={onQtyChange}
      />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
    expect(onQtyChange).toHaveBeenCalledWith('item-1', null);
  });

  it('disables the input when readOnly', () => {
    render(<CountSheetRowInput row={row} readOnly onQtyChange={vi.fn()} />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('shows an em dash for last cost when none is known', () => {
    render(
      <CountSheetRowInput
        row={{ ...row, lastCost: null }}
        readOnly={false}
        onQtyChange={vi.fn()}
      />,
    );
    expect(screen.getByText('—')).toBeDefined();
  });
});
