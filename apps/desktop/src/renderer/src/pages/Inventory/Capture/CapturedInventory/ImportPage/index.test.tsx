import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ParseResult } from '@/components/CsvImport/parser';
import { StockRoutes } from '@/components/AppRoutes/routePaths';
import ImportPage from '.';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/Context/EntityContext', () => ({
  useEntities: () => ({
    entities: [{ id: 'e1', name: 'Acme Cafe' }],
    selectedEntityId: 'e1',
  }),
}));

const mockAddCategory = vi.fn();
const mockAddItem = vi.fn();
vi.mock('../Context/InventoryContext', () => ({
  useInventory: () => ({
    categories: [],
    items: [],
    addCategory: mockAddCategory,
    addItem: mockAddItem,
  }),
}));

vi.mock('@/components/CsvImport/parser', () => ({
  parseFile: vi.fn(),
  downloadTemplate: vi.fn(),
}));

import { parseFile } from '@/components/CsvImport/parser';

const mockInvoke = vi.fn();

function emptyParseResult(overrides: Partial<ParseResult> = {}): ParseResult {
  return { units: [], categories: [], items: [], errors: [], ...overrides };
}

function selectFile(file = new File(['data'], 'inventory.xlsx')) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockInvoke.mockResolvedValue([]);
  Object.defineProperty(window, 'electronAPI', {
    value: { ipcRenderer: { invoke: mockInvoke } },
    writable: true,
    configurable: true,
  });
});

describe('ImportPage', () => {
  it('shows the upload prompt in the idle phase', () => {
    render(<ImportPage />);
    expect(screen.getByText('Expected format')).toBeInTheDocument();
    expect(screen.getByText('Choose a file to review')).toBeInTheDocument();
  });

  it('parses the chosen file and shows the review', async () => {
    vi.mocked(parseFile).mockResolvedValue(emptyParseResult({ units: [{ name: 'litres' }] }));

    render(<ImportPage />);
    selectFile();

    await waitFor(() => expect(screen.getByText('litres')).toBeInTheDocument());
    expect(mockInvoke).toHaveBeenCalledWith('setup:get-units');
  });

  it('shows an error when the file cannot be parsed, and "Try again" returns to idle', async () => {
    vi.mocked(parseFile).mockRejectedValue(new Error('bad file'));

    render(<ImportPage />);
    selectFile();

    await waitFor(() =>
      expect(
        screen.getByText('Could not read the file. Make sure it is a valid .xlsx or .csv file.'),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Choose a file to review')).toBeInTheDocument();
  });

  it('commits the review and navigates to the stock page', async () => {
    vi.mocked(parseFile).mockResolvedValue(emptyParseResult({ units: [{ name: 'litres' }] }));

    render(<ImportPage />);
    selectFile();

    await waitFor(() => expect(screen.getByText('litres')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Commit to database' }));

    await waitFor(() =>
      expect(mockInvoke).toHaveBeenCalledWith(
        'setup:upsert-unit',
        expect.objectContaining({ name: 'litres' }),
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith(StockRoutes.Base);
  });
});
