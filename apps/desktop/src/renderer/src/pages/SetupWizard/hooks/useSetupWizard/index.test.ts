import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSetupWizard } from '.';
import { SetupPath } from '../..';

const mockCompleteSetup = vi.hoisted(() => vi.fn());
const mockConnect = vi.hoisted(() => vi.fn());

vi.mock('@/services/entities', () => ({
  entitiesService: { completeSetup: mockCompleteSetup },
}));

vi.mock('@/services/cloudSync', () => ({
  cloudSyncService: { connect: mockConnect },
}));

const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { ...window.location, reload: mockReload },
  writable: true,
});

describe('useSetupWizard', () => {
  beforeEach(() => {
    mockCompleteSetup.mockReset();
    mockConnect.mockReset();
    mockReload.mockReset();
  });

  it('starts on step 1 with no path chosen', () => {
    const { result } = renderHook(() => useSetupWizard());
    expect(result.current.step).toBe(1);
    expect(result.current.path).toBeNull();
  });

  it('choosePath cloud advances to step 2', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Cloud));
    expect(result.current.step).toBe(2);
    expect(result.current.path).toBe(SetupPath.Cloud);
  });

  it('choosePath local advances to step 2', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Local));
    expect(result.current.step).toBe(2);
    expect(result.current.path).toBe(SetupPath.Local);
  });

  it('local path: advances from step 2 to step 3 when group name is set', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Local));
    act(() => result.current.setGroupName('The Crown Group'));
    act(() => result.current.next());
    expect(result.current.step).toBe(3);
  });

  it('local path: does not advance from step 2 when group name is empty', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Local));
    act(() => result.current.next());
    expect(result.current.step).toBe(2);
  });

  it('local path: back from step 3 returns to step 2', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Local));
    act(() => result.current.setGroupName('G'));
    act(() => result.current.next());
    act(() => result.current.back());
    expect(result.current.step).toBe(2);
  });

  it('back from step 2 returns to step 1', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Local));
    expect(result.current.step).toBe(2);
    act(() => result.current.back());
    expect(result.current.step).toBe(1);
  });

  it('cloud path: next is a no-op at step 2', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Cloud));
    act(() => result.current.next());
    expect(result.current.step).toBe(2);
  });

  it('cannot remove last entity', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Local));
    expect(result.current.entityNames).toHaveLength(1);
    act(() => result.current.removeEntity(0));
    expect(result.current.entityNames).toHaveLength(1);
  });

  it('local path: sets submitError when completeSetup throws', async () => {
    mockCompleteSetup.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Local));
    act(() => result.current.setGroupName('G'));
    act(() => result.current.setEntityName(0, 'E1'));
    await act(() => result.current.submit());
    expect(result.current.submitError).toBe('Network error');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('local path: calls completeSetup with valid data', async () => {
    mockCompleteSetup.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Local));
    act(() => result.current.setGroupName('G'));
    act(() => result.current.setEntityName(0, 'E1'));
    await act(() => result.current.submit());
    expect(mockCompleteSetup).toHaveBeenCalledWith({ groupName: 'G', entityNames: ['E1'] });
  });

  it('cloud path: connect calls service and reloads on success', async () => {
    mockConnect.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Cloud));
    act(() => result.current.setTursoUrl('libsql://my-db.turso.io'));
    act(() => result.current.setAuthToken('tok123'));
    await act(() => result.current.connect());
    expect(mockConnect).toHaveBeenCalledWith('libsql://my-db.turso.io', 'tok123');
    expect(mockReload).toHaveBeenCalled();
  });

  it('cloud path: sets connectError when connect throws', async () => {
    mockConnect.mockRejectedValue(new Error('Auth failed'));
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Cloud));
    act(() => result.current.setTursoUrl('libsql://my-db.turso.io'));
    act(() => result.current.setAuthToken('bad-tok'));
    await act(() => result.current.connect());
    expect(result.current.connectError).toBe('Auth failed');
    expect(result.current.connecting).toBe(false);
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('cloud path: clears connectError on retry', async () => {
    mockConnect.mockRejectedValueOnce(new Error('first failure')).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.choosePath(SetupPath.Cloud));
    act(() => result.current.setTursoUrl('libsql://my-db.turso.io'));
    act(() => result.current.setAuthToken('tok'));
    await act(() => result.current.connect());
    expect(result.current.connectError).toBe('first failure');
    await act(() => result.current.connect());
    expect(result.current.connectError).toBeNull();
    expect(mockReload).toHaveBeenCalled();
  });
});
