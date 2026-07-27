import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChangeCell } from '.';

describe('ChangeCell', () => {
  it('shows the formatted change label', () => {
    render(<ChangeCell change={15} flagged={false} />);
    expect(screen.getByText('15.0%')).toBeInTheDocument();
  });

  it('shows a Jump badge when flagged', () => {
    render(<ChangeCell change={15} flagged />);
    expect(screen.getByText('Jump')).toBeInTheDocument();
  });

  it('omits the Jump badge when not flagged', () => {
    render(<ChangeCell change={15} flagged={false} />);
    expect(screen.queryByText('Jump')).not.toBeInTheDocument();
  });
});
