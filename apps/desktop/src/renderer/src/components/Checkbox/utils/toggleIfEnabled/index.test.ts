import { describe, it, expect, vi } from 'vitest';
import { toggleIfEnabled } from '.';

describe('toggleIfEnabled', () => {
  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    toggleIfEnabled(true, false, onChange);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with the inverse of isChecked when enabled', () => {
    const onChange = vi.fn();
    toggleIfEnabled(false, false, onChange);
    expect(onChange).toHaveBeenCalledWith(true);

    onChange.mockClear();
    toggleIfEnabled(false, true, onChange);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
