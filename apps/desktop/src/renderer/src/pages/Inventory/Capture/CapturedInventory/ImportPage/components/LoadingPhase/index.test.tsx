import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingPhase } from '.';
import { LOADING_LABEL } from '../../types';

describe('LoadingPhase', () => {
  it('renders nothing outside the loading phase', () => {
    const { container } = render(<LoadingPhase state={{ phase: 'idle' }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the current loading label', () => {
    render(<LoadingPhase state={{ phase: 'loading', label: LOADING_LABEL.CheckingDatabase }} />);
    expect(screen.getByText(LOADING_LABEL.CheckingDatabase)).toBeInTheDocument();
  });
});
