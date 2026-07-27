import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryOption } from '.';

describe('CategoryOption', () => {
  it('calls onToggle with the category when clicked', () => {
    const onToggle = vi.fn();
    render(<CategoryOption category="Dairy" selected={[]} onToggle={onToggle} />);
    fireEvent.click(screen.getByText('Dairy'));
    expect(onToggle).toHaveBeenCalledWith('Dairy');
  });

  it('shows a check mark when the category is selected', () => {
    render(<CategoryOption category="Dairy" selected={['Dairy']} onToggle={vi.fn()} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('shows no check mark when the category is not selected', () => {
    render(<CategoryOption category="Dairy" selected={[]} onToggle={vi.fn()} />);
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });
});
