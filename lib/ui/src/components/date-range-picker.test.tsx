import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { DateRangePicker } from './date-range-picker';

describe('DateRangePicker', () => {
  describe('trigger label', () => {
    it('shows placeholder when no range is set', () => {
      render(<DateRangePicker from="" to="" onChange={() => {}} />);
      expect(screen.getByRole('button', { name: /all dates/i })).toBeInTheDocument();
    });

    it('shows custom placeholder', () => {
      render(<DateRangePicker from="" to="" onChange={() => {}} placeholder="Pick a range" />);
      expect(screen.getByRole('button', { name: /pick a range/i })).toBeInTheDocument();
    });

    it('shows formatted range when both dates are set', () => {
      render(<DateRangePicker from="2026-01-01" to="2026-01-31" onChange={() => {}} />);
      expect(screen.getByText(/1 Jan 2026/)).toBeInTheDocument();
      expect(screen.getByText(/31 Jan 2026/)).toBeInTheDocument();
    });

    it('shows "From {date}" when only from is set', () => {
      render(<DateRangePicker from="2026-03-15" to="" onChange={() => {}} />);
      expect(screen.getByText(/from 15 mar 2026/i)).toBeInTheDocument();
    });

    it('shows "Until {date}" when only to is set', () => {
      render(<DateRangePicker from="" to="2026-06-30" onChange={() => {}} />);
      expect(screen.getByText(/until 30 jun 2026/i)).toBeInTheDocument();
    });
  });

  describe('clear button', () => {
    it('is absent when no range is active', () => {
      render(<DateRangePicker from="" to="" onChange={() => {}} />);
      expect(
        screen.queryByRole('button', { hidden: true, name: /clear/i }),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with empty strings when the X icon is clicked', async () => {
      const onChange = vi.fn();
      const { container } = render(
        <DateRangePicker from="2026-01-01" to="2026-01-31" onChange={onChange} />,
      );
      // The XIcon is the last SVG child of the trigger button
      const xIcon = container.querySelector('button > svg:last-child')!;
      await userEvent.click(xIcon);
      expect(onChange).toHaveBeenCalledWith('', '');
    });
  });

  describe('popover', () => {
    it('opens when trigger is clicked', async () => {
      render(<DateRangePicker from="" to="" onChange={() => {}} />);
      await userEvent.click(screen.getByRole('button', { name: /all dates/i }));
      expect(screen.getByText('Relative')).toBeInTheDocument();
      expect(screen.getByText('This period')).toBeInTheDocument();
    });

    it('shows all preset groups', async () => {
      render(<DateRangePicker from="" to="" onChange={() => {}} />);
      await userEvent.click(screen.getByRole('button', { name: /all dates/i }));
      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
      expect(screen.getByText('Last 3 months')).toBeInTheDocument();
      expect(screen.getByText('Last 6 months')).toBeInTheDocument();
      expect(screen.getByText('This week')).toBeInTheDocument();
      expect(screen.getByText('This month')).toBeInTheDocument();
      expect(screen.getByText('This year')).toBeInTheDocument();
    });

    it('calls onChange and closes when a preset is clicked', async () => {
      const onChange = vi.fn();
      render(<DateRangePicker from="" to="" onChange={onChange} />);
      await userEvent.click(screen.getByRole('button', { name: /all dates/i }));
      await userEvent.click(screen.getByText('This year'));
      expect(onChange).toHaveBeenCalledOnce();
      const [f, t] = onChange.mock.calls[0] as [string, string];
      expect(f).toMatch(/^\d{4}-01-01$/);
      expect(t).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('shows "Clear range" inside the popover when a range is active', async () => {
      render(<DateRangePicker from="2026-01-01" to="2026-01-31" onChange={() => {}} />);
      await userEvent.click(screen.getAllByRole('button')[0]!);
      expect(screen.getByText('Clear range')).toBeInTheDocument();
    });
  });

  describe('active preset highlight', () => {
    it('highlights the matching preset when the stored range equals a preset', async () => {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      const yearStart = `${today.getFullYear()}-01-01`;

      render(<DateRangePicker from={yearStart} to={todayStr} onChange={() => {}} />);
      await userEvent.click(screen.getAllByRole('button')[0]!);
      const btn = screen.getByText('This year').closest('button')!;
      expect(btn.className).toMatch(/text-primary/);
    });
  });
});
