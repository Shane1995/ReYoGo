import { describe, it, expect } from 'vitest';
import { reportFilename } from '.';

describe('reportFilename', () => {
  it('builds a filename with both dates when both are set', () => {
    expect(reportFilename('item-cost-history', '2026-01-01', '2026-01-31')).toBe(
      'reyogo-item-cost-history-2026-01-01-to-2026-01-31.xlsx',
    );
  });

  it('falls back to "all-dates" when neither date is set', () => {
    expect(reportFilename('period-summary', '', '')).toBe('reyogo-period-summary-all-dates.xlsx');
  });

  it('uses only the from date when to date is unset', () => {
    expect(reportFilename('period-summary', '2026-01-01', '')).toBe(
      'reyogo-period-summary-from-2026-01-01.xlsx',
    );
  });

  it('uses only the to date when from date is unset', () => {
    expect(reportFilename('period-summary', '', '2026-01-31')).toBe(
      'reyogo-period-summary-to-2026-01-31.xlsx',
    );
  });
});
