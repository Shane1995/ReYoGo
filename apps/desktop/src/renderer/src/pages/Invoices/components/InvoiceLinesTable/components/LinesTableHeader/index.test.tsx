import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VatMode } from '@reyogo/types';
import { LinesTableHeader } from '.';

function renderInTable(vatMode: VatMode) {
  return render(
    <table>
      <LinesTableHeader vatMode={vatMode} />
    </table>,
  );
}

describe('LinesTableHeader', () => {
  it('labels the total column "Total (excl.)" under exclusive VAT treatment', () => {
    renderInTable(VatMode.Exclusive);
    expect(screen.getByText('Total (excl.)')).toBeInTheDocument();
  });

  it('labels the total column "Total (incl.)" under inclusive VAT treatment', () => {
    renderInTable(VatMode.Inclusive);
    expect(screen.getByText('Total (incl.)')).toBeInTheDocument();
  });
});
