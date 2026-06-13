import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnitRow } from '.';
import { ReviewStatus } from '../../../review';

describe('UnitRow', () => {
  it('renders a new unit as selectable', () => {
    const onToggle = vi.fn();
    render(
      <UnitRow
        unit={{ name: 'litres', status: ReviewStatus.New, selected: true }}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText('litres')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('litres');
  });

  it('disables an existing unit', () => {
    render(
      <UnitRow
        unit={{ name: 'kgs', status: ReviewStatus.Exists, selected: false }}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByText('Already exists')).toBeInTheDocument();
  });
});
