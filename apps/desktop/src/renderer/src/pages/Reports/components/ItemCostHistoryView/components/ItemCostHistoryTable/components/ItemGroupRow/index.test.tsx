import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemGroupRow } from '.';
import type { ItemCostHistoryRowGroup } from '../../utils/groupRowsByItem';

function group(overrides: Partial<ItemCostHistoryRowGroup> = {}): ItemCostHistoryRowGroup {
  return {
    itemId: 'item-1',
    itemName: '300ml Coke',
    uom: 'each',
    flagged: false,
    rows: [
      {
        itemId: 'item-1',
        itemName: '300ml Coke',
        uom: 'each',
        invoiceId: 'inv-1',
        date: new Date('2026-07-17'),
        quantity: 48,
        unitCostExclVat: 11.92,
        unitCostInclVat: 11.92,
        isVatable: false,
        pctChange: 15,
        flagged: true,
      },
    ],
    ...overrides,
  };
}

function renderInTable(children: React.ReactNode) {
  return render(
    <table>
      <tbody>{children}</tbody>
    </table>,
  );
}

describe('ItemGroupRow', () => {
  it('renders nothing when the group has no rows', () => {
    const { container } = renderInTable(
      <ItemGroupRow group={group({ rows: [] })} index={0} isExpanded={false} onToggle={vi.fn()} />,
    );
    expect(container.querySelector('tr')).not.toBeInTheDocument();
  });

  it('renders the last purchase and a Jump badge when flagged', () => {
    renderInTable(
      <ItemGroupRow
        group={group({ flagged: true })}
        index={0}
        isExpanded={false}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('300ml Coke')).toBeInTheDocument();
    expect(screen.getByText('Jump')).toBeInTheDocument();
  });

  it('shows the expanded purchases row when isExpanded is true', () => {
    const { container } = renderInTable(
      <ItemGroupRow group={group()} index={0} isExpanded onToggle={vi.fn()} />,
    );
    expect(container.querySelectorAll('tr').length).toBeGreaterThan(1);
  });
});
