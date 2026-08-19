import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stocktakeService } from '.';

const mockInvoke = vi.fn();

beforeEach(() => {
  mockInvoke.mockReset();
  Object.defineProperty(window, 'electronAPI', {
    value: { ipcRenderer: { invoke: mockInvoke } },
    writable: true,
  });
});

describe('stocktakeService', () => {
  it('createSession calls the correct channel with the label', async () => {
    mockInvoke.mockResolvedValue({});
    await stocktakeService.createSession('Week 1');
    expect(mockInvoke).toHaveBeenCalledWith('stocktake:create-session', 'Week 1');
  });

  it('getSessions calls the correct channel', async () => {
    mockInvoke.mockResolvedValue([]);
    await stocktakeService.getSessions();
    expect(mockInvoke).toHaveBeenCalledWith('stocktake:get-sessions');
  });

  it('getSession calls the correct channel with the id', async () => {
    mockInvoke.mockResolvedValue(null);
    await stocktakeService.getSession('s1');
    expect(mockInvoke).toHaveBeenCalledWith('stocktake:get-session', 's1');
  });

  it('saveDraftLines calls the correct channel with sessionId and lines', async () => {
    mockInvoke.mockResolvedValue(undefined);
    const lines = [{ id: 'l1', inventoryItemId: 'i1', countedQty: 5 }];
    await stocktakeService.saveDraftLines('s1', lines);
    expect(mockInvoke).toHaveBeenCalledWith('stocktake:save-draft-lines', 's1', lines);
  });

  it('completeSession calls the correct channel with sessionId and lines', async () => {
    mockInvoke.mockResolvedValue(undefined);
    const lines = [{ id: 'l1', inventoryItemId: 'i1', countedQty: 5 }];
    await stocktakeService.completeSession('s1', lines);
    expect(mockInvoke).toHaveBeenCalledWith('stocktake:complete-session', 's1', lines);
  });
});
