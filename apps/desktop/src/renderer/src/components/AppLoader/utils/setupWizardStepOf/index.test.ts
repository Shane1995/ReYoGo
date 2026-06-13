import { describe, it, expect } from 'vitest';
import { setupWizardStepOf } from '.';

describe('setupWizardStepOf', () => {
  it('returns step 2 when cloud is connected', () => {
    expect(setupWizardStepOf(true)).toBe(2);
  });

  it('returns step 1 when cloud is not connected', () => {
    expect(setupWizardStepOf(false)).toBe(1);
  });
});
