import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportPicker } from '.';
import { ReportView } from '../../types';

describe('ReportPicker', () => {
  it('lists both report types as options', () => {
    render(<ReportPicker activeView={ReportView.ItemCostHistory} setActiveView={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Item Cost History' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Period Summary' })).toBeDefined();
  });

  it('reflects the active view as the selected value', () => {
    render(<ReportPicker activeView={ReportView.PeriodSummary} setActiveView={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue(ReportView.PeriodSummary);
  });

  it('calls setActiveView with the selected report view', () => {
    const setActiveView = vi.fn();
    render(<ReportPicker activeView={ReportView.ItemCostHistory} setActiveView={setActiveView} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: ReportView.PeriodSummary },
    });
    expect(setActiveView).toHaveBeenCalledWith(ReportView.PeriodSummary);
  });
});
