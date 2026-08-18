import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GrandTotalFooter } from '.';

describe('GrandTotalFooter', () => {
  it('shows the formatted grand total', () => {
    render(<GrandTotalFooter colSpan={3} total={1234.5} />);
    expect(screen.getByText('R 1 234,50')).toBeDefined();
  });

  it('shows the Grand Total label', () => {
    render(<GrandTotalFooter colSpan={3} total={0} />);
    expect(screen.getByText('Grand Total')).toBeDefined();
  });
});
