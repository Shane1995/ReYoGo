import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorPhase } from '.';

describe('ErrorPhase', () => {
  it('renders nothing outside the error phase', () => {
    const { container } = render(<ErrorPhase state={{ phase: 'idle' }} onRetry={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the error message and calls onRetry', () => {
    const onRetry = vi.fn();
    render(
      <ErrorPhase
        state={{ phase: 'error', message: 'Could not read the file.' }}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText('Could not read the file.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
