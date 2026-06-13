import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectInput } from '.';

describe('SelectInput', () => {
  it('calls onChange with the selected value', () => {
    const onChange = vi.fn();
    render(
      <SelectInput value="" onChange={onChange}>
        <option value="">Choose…</option>
        <option value="a">A</option>
      </SelectInput>,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
