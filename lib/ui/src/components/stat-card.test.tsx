import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PackageIcon } from 'lucide-react';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  it('renders the label', () => {
    render(<StatCard label="Total Stock Value" value="R 1,234.00" icon={PackageIcon} />);
    expect(screen.getByText('Total Stock Value')).toBeInTheDocument();
  });

  it('renders the value when not loading', () => {
    render(<StatCard label="Spend" value="R 500.00" icon={PackageIcon} />);
    expect(screen.getByText('R 500.00')).toBeInTheDocument();
  });

  it('hides the value and shows a skeleton when loading', () => {
    render(<StatCard label="Spend" value="R 500.00" icon={PackageIcon} loading />);
    expect(screen.queryByText('R 500.00')).not.toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    render(<StatCard label="Low Stock" value={3} icon={PackageIcon} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders without loading skeleton by default', () => {
    const { container } = render(<StatCard label="x" value="y" icon={PackageIcon} />);
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });
});
