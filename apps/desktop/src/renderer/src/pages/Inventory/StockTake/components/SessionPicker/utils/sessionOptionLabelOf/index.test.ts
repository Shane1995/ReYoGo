import { describe, it, expect } from 'vitest';
import { sessionOptionLabelOf } from '.';

describe('sessionOptionLabelOf', () => {
  it('includes the label and created date', () => {
    const label = sessionOptionLabelOf({
      id: 's1',
      accountId: 'default',
      label: 'Week 1',
      status: 'open',
      completedAt: null,
      createdAt: new Date('2026-08-12'),
    });
    expect(label).toContain('Week 1');
    expect(label).toContain('2026');
  });

  it('falls back to a generic name when there is no label', () => {
    const label = sessionOptionLabelOf({
      id: 's1',
      accountId: 'default',
      label: null,
      status: 'complete',
      completedAt: new Date(),
      createdAt: new Date('2026-08-12'),
    });
    expect(label).toContain('Untitled stock take');
  });
});
