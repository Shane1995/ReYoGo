import { describe, it, expect } from 'vitest';
import { reportFilename } from '.';
import { ReportView } from '../../../../types';

describe('reportFilename', () => {
  it('builds a filename with both dates when both are set', () => {
    expect(reportFilename(ReportView.ItemCostHistory, '2026-01-01', '2026-01-31')).toBe(
      'reyogo-item-cost-history-2026-01-01-to-2026-01-31.xlsx',
    );
  });

  it('falls back to "all-dates" when neither date is set', () => {
    expect(reportFilename(ReportView.PeriodSummary, '', '')).toBe(
      'reyogo-period-summary-all-dates.xlsx',
    );
  });

  it('uses only the from date when to date is unset', () => {
    expect(reportFilename(ReportView.PeriodSummary, '2026-01-01', '')).toBe(
      'reyogo-period-summary-from-2026-01-01.xlsx',
    );
  });

  it('uses only the to date when from date is unset', () => {
    expect(reportFilename(ReportView.PeriodSummary, '', '2026-01-31')).toBe(
      'reyogo-period-summary-to-2026-01-31.xlsx',
    );
  });

  it('uses an as-of-date suffix for Stock Valuation instead of the date-range suffix', () => {
    expect(reportFilename(ReportView.StockValuation, '', '', '2026-06-01')).toBe(
      'reyogo-stock-valuation-as-of-2026-06-01.xlsx',
    );
  });

  it('uses a "live" suffix for Stock on Hand when no as-of date is set', () => {
    expect(reportFilename(ReportView.StockOnHand, '', '', '')).toBe(
      'reyogo-stock-on-hand-live.xlsx',
    );
  });
});
