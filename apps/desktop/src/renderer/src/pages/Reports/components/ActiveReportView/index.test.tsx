import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveReportView } from '.';
import { ReportView } from '../../types';

vi.mock('../ItemCostHistoryView', () => ({
  ItemCostHistoryView: () => <div>ItemCostHistoryView</div>,
}));
vi.mock('../PeriodSummaryView', () => ({
  PeriodSummaryView: () => <div>PeriodSummaryView</div>,
}));
vi.mock('../StockValuationView', () => ({
  StockValuationView: () => <div>StockValuationView</div>,
}));
vi.mock('../StockOnHandView', () => ({
  StockOnHandView: () => <div>StockOnHandView</div>,
}));

const noop = () => {};
const baseProps = {
  fromDate: '',
  toDate: '',
  asOfDate: '',
  entityId: undefined,
  selectedCategories: [],
  selectedType: '',
  onItemCostHistoryRowsChange: noop,
  onPeriodSummaryCogsChange: noop,
  onStockValuationRowsChange: noop,
  onStockOnHandRowsChange: noop,
  onAvailableCategoriesChange: noop,
  onAvailableTypesChange: noop,
};

describe('ActiveReportView', () => {
  it('renders ItemCostHistoryView for the item-cost-history view', () => {
    render(<ActiveReportView {...baseProps} activeView={ReportView.ItemCostHistory} />);
    expect(screen.getByText('ItemCostHistoryView')).toBeInTheDocument();
  });

  it('renders PeriodSummaryView for the period-summary view', () => {
    render(<ActiveReportView {...baseProps} activeView={ReportView.PeriodSummary} />);
    expect(screen.getByText('PeriodSummaryView')).toBeInTheDocument();
  });

  it('renders StockValuationView for the stock-valuation view', () => {
    render(<ActiveReportView {...baseProps} activeView={ReportView.StockValuation} />);
    expect(screen.getByText('StockValuationView')).toBeInTheDocument();
  });

  it('renders StockOnHandView for the stock-on-hand view', () => {
    render(<ActiveReportView {...baseProps} activeView={ReportView.StockOnHand} />);
    expect(screen.getByText('StockOnHandView')).toBeInTheDocument();
  });
});
