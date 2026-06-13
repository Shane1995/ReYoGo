import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnitsSection } from '.';
import { ReviewStatus } from '../../../review';

describe('UnitsSection', () => {
  it('renders nothing when there are no units', () => {
    const { container } = render(<UnitsSection units={[]} onToggle={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a row per unit', () => {
    render(
      <UnitsSection
        units={[
          { name: 'litres', status: ReviewStatus.New, selected: true },
          { name: 'kgs', status: ReviewStatus.Exists, selected: false },
        ]}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('litres')).toBeInTheDocument();
    expect(screen.getByText('kgs')).toBeInTheDocument();
  });
});
