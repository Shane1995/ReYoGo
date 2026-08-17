import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import { ShellIPC } from '@shared/types/ipc';
import type { ItemCostHistoryRow } from '../../components/ItemCostHistoryView/types';
import type { StockLevelRow } from '../../hooks/useStockLevelRows/types';
import type { ItemTotalRow } from '../itemTotalRowsOf/types';
import { ReportView } from '../../types';
import { exportReport } from '.';

const mockInvoke = vi.fn();
Object.defineProperty(window, 'electronAPI', {
  value: { ipcRenderer: { invoke: mockInvoke } },
  writable: true,
  configurable: true,
});

const row: ItemCostHistoryRow = {
  itemId: 'item-1',
  itemName: 'Flour',
  uom: 'kg',
  invoiceId: 'inv-1',
  date: new Date('2026-01-15'),
  quantity: 2,
  unitCostExclVat: 10,
  unitCostInclVat: 11.5,
  isVatable: true,
  pctChange: null,
  flagged: false,
};

beforeEach(() => {
  mockInvoke.mockReset();
});

describe('exportReport', () => {
  it('builds an Item Cost History workbook matching the visible rows and saves it', async () => {
    await exportReport({
      view: ReportView.ItemCostHistory,
      rows: [row],
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    });

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    const [channel, payload] = mockInvoke.mock.calls[0]!;
    expect(channel).toBe(ShellIPC.SAVE_FILE_BASE64);
    expect(payload.filename).toBe('reyogo-item-cost-history-2026-01-01-to-2026-01-31.xlsx');

    const wb = XLSX.read(payload.base64, { type: 'base64' });
    const sheet = wb.Sheets[wb.SheetNames[0]!]!;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows[0]).toEqual(['Date range: 2026-01-01 to 2026-01-31']);
    expect(rows[3]).toEqual(['Flour', 'kg', '2026-01-15', 2, 10, 11.5, 'Yes', '']);
  });

  it('builds a Period Summary workbook matching the visible totals and saves it', async () => {
    await exportReport({
      view: ReportView.PeriodSummary,
      cogs: { total: 100, byCategory: [{ categoryId: 'c1', categoryName: 'Dairy', total: 100 }] },
      fromDate: '',
      toDate: '',
    });

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    const [channel, payload] = mockInvoke.mock.calls[0]!;
    expect(channel).toBe(ShellIPC.SAVE_FILE_BASE64);
    expect(payload.filename).toBe('reyogo-period-summary-all-dates.xlsx');

    const wb = XLSX.read(payload.base64, { type: 'base64' });
    const sheet = wb.Sheets[wb.SheetNames[0]!]!;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows[0]).toEqual(['Date range: All dates']);
    expect(rows[3]).toEqual(['Dairy', 100, '100.0%']);
    expect(rows[4]).toEqual(['Total', 100, '100.0%']);
  });

  const stockRow: StockLevelRow = {
    itemId: 'item-1',
    itemName: 'Milk',
    uom: 'L',
    categoryName: 'Dairy',
    categoryType: 'food',
    quantity: 10,
    avgCost: 2,
    totalValue: 20,
  };

  it('builds a Stock Valuation workbook with an as-of-date filename and metadata row', async () => {
    await exportReport({
      view: ReportView.StockValuation,
      rows: [stockRow],
      asOfDate: '2026-06-01',
    });

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    const [channel, payload] = mockInvoke.mock.calls[0]!;
    expect(channel).toBe(ShellIPC.SAVE_FILE_BASE64);
    expect(payload.filename).toBe('reyogo-stock-valuation-as-of-2026-06-01.xlsx');

    const wb = XLSX.read(payload.base64, { type: 'base64' });
    const sheet = wb.Sheets[wb.SheetNames[0]!]!;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows[0]).toEqual(['As of: 2026-06-01']);
    expect(rows[3]).toEqual(['Milk', 'L', 10, 2, 20]);
  });

  it('builds a Stock on Hand workbook with a "live" filename and metadata row', async () => {
    await exportReport({ view: ReportView.StockOnHand, rows: [stockRow], asOfDate: '' });

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    const [channel, payload] = mockInvoke.mock.calls[0]!;
    expect(channel).toBe(ShellIPC.SAVE_FILE_BASE64);
    expect(payload.filename).toBe('reyogo-stock-on-hand-live.xlsx');

    const wb = XLSX.read(payload.base64, { type: 'base64' });
    const sheet = wb.Sheets[wb.SheetNames[0]!]!;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows[0]).toEqual(['As of: Live']);
    expect(rows[3]).toEqual(['Milk', 'Dairy', 'L', 10, 2, 20]);
  });

  const totalRow: ItemTotalRow = {
    itemId: 'item-1',
    itemName: 'Milk',
    categoryName: 'Dairy',
    categoryType: 'food',
    uom: 'L',
    qty: 10,
    totalValue: 40,
  };

  it('builds a Purchase Report workbook matching the visible totals and saves it', async () => {
    await exportReport({
      view: ReportView.PurchaseReport,
      rows: [totalRow],
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    });

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    const [channel, payload] = mockInvoke.mock.calls[0]!;
    expect(channel).toBe(ShellIPC.SAVE_FILE_BASE64);
    expect(payload.filename).toBe('reyogo-purchase-report-2026-01-01-to-2026-01-31.xlsx');

    const wb = XLSX.read(payload.base64, { type: 'base64' });
    const sheet = wb.Sheets[wb.SheetNames[0]!]!;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows[3]).toEqual(['Dairy']);
    expect(rows[4]).toEqual(['Milk', 'L', 10, 40]);
  });

  it('builds a Credit Report workbook matching the visible totals and saves it', async () => {
    await exportReport({
      view: ReportView.CreditReport,
      rows: [totalRow],
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    });

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    const [channel, payload] = mockInvoke.mock.calls[0]!;
    expect(channel).toBe(ShellIPC.SAVE_FILE_BASE64);
    expect(payload.filename).toBe('reyogo-credit-report-2026-01-01-to-2026-01-31.xlsx');
  });
});
