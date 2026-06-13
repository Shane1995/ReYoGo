import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarningBanner } from '.';

describe('WarningBanner', () => {
  it('renders the message and detail', () => {
    render(<WarningBanner message="2 items need attention." detail="Fix them below." />);
    expect(screen.getByText('2 items need attention.')).toBeInTheDocument();
    expect(screen.getByText('Fix them below.')).toBeInTheDocument();
  });
});
