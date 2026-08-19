import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupService } from '.';

const mockInvoke = vi.fn();

beforeEach(() => {
  mockInvoke.mockReset();
  Object.defineProperty(window, 'electronAPI', {
    value: { ipcRenderer: { invoke: mockInvoke } },
    writable: true,
  });
});

describe('setupService', () => {
  it('getUnits calls the correct channel', async () => {
    mockInvoke.mockResolvedValue([]);
    await setupService.getUnits();
    expect(mockInvoke).toHaveBeenCalledWith('setup:get-units');
  });

  it('getArchivedUnits calls the correct channel', async () => {
    mockInvoke.mockResolvedValue([]);
    await setupService.getArchivedUnits();
    expect(mockInvoke).toHaveBeenCalledWith('setup:get-archived-units');
  });

  it('upsertUnit calls the correct channel with the unit', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await setupService.upsertUnit({ id: 'u1', name: 'kg' });
    expect(mockInvoke).toHaveBeenCalledWith('setup:upsert-unit', { id: 'u1', name: 'kg' });
  });

  it('archiveUnit calls the correct channel with the id', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await setupService.archiveUnit('u1');
    expect(mockInvoke).toHaveBeenCalledWith('setup:archive-unit', 'u1');
  });

  it('restoreUnit calls the correct channel with the id', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await setupService.restoreUnit('u1');
    expect(mockInvoke).toHaveBeenCalledWith('setup:restore-unit', 'u1');
  });

  it('hardDeleteUnit calls the correct channel with the id', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await setupService.hardDeleteUnit('u1');
    expect(mockInvoke).toHaveBeenCalledWith('setup:hard-delete-unit', 'u1');
  });

  it('getUnitUsageCount calls the correct channel with the id', async () => {
    mockInvoke.mockResolvedValue(3);
    await setupService.getUnitUsageCount('u1');
    expect(mockInvoke).toHaveBeenCalledWith('setup:get-unit-usage-count', 'u1');
  });
});
