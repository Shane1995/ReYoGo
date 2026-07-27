import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaxableCell } from '.';

describe('TaxableCell', () => {
  it('shows a check mark when vatable', () => {
    render(<TaxableCell isVatable />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows a dash when not vatable', () => {
    render(<TaxableCell isVatable={false} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
