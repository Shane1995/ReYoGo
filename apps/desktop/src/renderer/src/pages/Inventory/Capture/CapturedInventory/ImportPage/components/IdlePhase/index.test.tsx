import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IdlePhase } from '.';

describe('IdlePhase', () => {
  it('renders nothing outside the idle phase', () => {
    const { container } = render(
      <IdlePhase state={{ phase: 'error', message: 'oops' }} onChoose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the format guide and drop zone, calling onChoose when clicked', () => {
    const onChoose = vi.fn();
    render(<IdlePhase state={{ phase: 'idle' }} onChoose={onChoose} />);
    expect(screen.getByText('Expected format')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Choose a file to review'));
    expect(onChoose).toHaveBeenCalled();
  });
});
