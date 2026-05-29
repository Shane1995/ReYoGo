import { describe, it, expect, vi, beforeEach } from 'vitest';
import { entitiesService } from '.';

const mockInvoke = vi.fn();

beforeEach(() => {
  mockInvoke.mockReset();
  Object.defineProperty(window, 'electronAPI', {
    value: { ipcRenderer: { invoke: mockInvoke } },
    writable: true,
  });
});

describe('entitiesService', () => {
  it('getEntities calls the correct channel', async () => {
    mockInvoke.mockResolvedValue([]);
    await entitiesService.getEntities();
    expect(mockInvoke).toHaveBeenCalledWith('entities:get-entities');
  });

  it('getGroup calls the correct channel', async () => {
    mockInvoke.mockResolvedValue(null);
    await entitiesService.getGroup();
    expect(mockInvoke).toHaveBeenCalledWith('entities:get-group');
  });

  it('getSetupState calls the correct channel', async () => {
    mockInvoke.mockResolvedValue({ setupComplete: false });
    await entitiesService.getSetupState();
    expect(mockInvoke).toHaveBeenCalledWith('entities:get-setup-state');
  });

  it('completeSetup calls the correct channel with payload', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await entitiesService.completeSetup({ groupName: 'G', entityNames: ['E1'] });
    expect(mockInvoke).toHaveBeenCalledWith('entities:complete-setup', {
      groupName: 'G',
      entityNames: ['E1'],
    });
  });

  it('updateGroupName calls the correct channel', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await entitiesService.updateGroupName('New Name');
    expect(mockInvoke).toHaveBeenCalledWith('entities:update-group-name', 'New Name');
  });

  it('renameEntity calls the correct channel', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await entitiesService.renameEntity('e1', 'Bar');
    expect(mockInvoke).toHaveBeenCalledWith('entities:rename-entity', 'e1', 'Bar');
  });

  it('updateEntityVat calls the correct channel', async () => {
    mockInvoke.mockResolvedValue(undefined);
    await entitiesService.updateEntityVat('e1', 20, 'inclusive');
    expect(mockInvoke).toHaveBeenCalledWith('entities:update-entity-vat', 'e1', 20, 'inclusive');
  });
});
