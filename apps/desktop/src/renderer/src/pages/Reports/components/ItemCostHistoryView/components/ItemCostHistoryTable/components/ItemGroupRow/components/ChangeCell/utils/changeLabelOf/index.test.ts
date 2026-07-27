import { describe, it, expect } from 'vitest';
import { changeLabelOf } from '.';

describe('changeLabelOf', () => {
  it('renders a dash when change is null', () => {
    expect(changeLabelOf(null)).toBe('—');
  });

  it('formats a positive change to one decimal with a percent sign', () => {
    expect(changeLabelOf(15)).toBe('15.0%');
  });

  it('formats a negative change to one decimal with a percent sign', () => {
    expect(changeLabelOf(-5.45)).toBe('-5.5%');
  });
});
