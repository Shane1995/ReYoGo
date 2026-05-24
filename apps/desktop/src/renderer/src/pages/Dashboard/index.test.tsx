import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppConfigProvider } from '@/Context';
import DashboardPage from './index';

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: vi.fn(),
}));

import { useDashboardStats } from '@/hooks/useDashboardStats';

describe('DashboardPage', () => {
  it('renders the Dashboard heading', () => {
    vi.mocked(useDashboardStats).mockReturnValue({
      stats: null,
      loading: true,
      refetch: vi.fn(),
    });
    render(<AppConfigProvider><DashboardPage /></AppConfigProvider>);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders all four stat card labels', () => {
    vi.mocked(useDashboardStats).mockReturnValue({
      stats: null,
      loading: false,
      refetch: vi.fn(),
    });
    render(<AppConfigProvider><DashboardPage /></AppConfigProvider>);
    expect(screen.getByText('Total Stock Value')).toBeInTheDocument();
    expect(screen.getByText('Monthly Spend')).toBeInTheDocument();
    expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
    expect(screen.getByText('Waste — 30 days')).toBeInTheDocument();
  });

  it('shows formatted values when stats are loaded', () => {
    vi.mocked(useDashboardStats).mockReturnValue({
      stats: { totalStockValue: 1000, monthlySpend: 500 },
      loading: false,
      refetch: vi.fn(),
    });
    render(<AppConfigProvider><DashboardPage /></AppConfigProvider>);
    expect(screen.getByText(/1 000,00/)).toBeInTheDocument();
    expect(screen.getByText(/500,00/)).toBeInTheDocument();
  });

  it('shows fallback R 0.00 when stats are null', () => {
    vi.mocked(useDashboardStats).mockReturnValue({
      stats: null,
      loading: false,
      refetch: vi.fn(),
    });
    render(<AppConfigProvider><DashboardPage /></AppConfigProvider>);
    const zeros = screen.getAllByText('R 0.00');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the Low Stock Alerts section', () => {
    vi.mocked(useDashboardStats).mockReturnValue({
      stats: null,
      loading: false,
      refetch: vi.fn(),
    });
    render(<AppConfigProvider><DashboardPage /></AppConfigProvider>);
    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
    expect(screen.getByText('All items are above minimum stock levels')).toBeInTheDocument();
  });
});
