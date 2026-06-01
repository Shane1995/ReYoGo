import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSetupWizard } from '.';

const mockConnect = vi.hoisted(() => vi.fn());
const mockCompleteSetup = vi.hoisted(() => vi.fn());
const mockGetStatus = vi.hoisted(() => vi.fn());

vi.mock('@/services/cloudSync', () => ({
  cloudSyncService: {
    connect: mockConnect,
    getStatus: mockGetStatus,
  },
}));

vi.mock('@/services/entities', () => ({
  entitiesService: { completeSetup: mockCompleteSetup },
}));

const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { ...window.location, reload: mockReload },
  writable: true,
});

describe('useSetupWizard', () => {
  beforeEach(() => {
    mockConnect.mockReset();
    mockCompleteSetup.mockReset();
    mockGetStatus.mockReset();
    mockReload.mockReset();
    mockGetStatus.mockResolvedValue({ isActive: false });
  });

  it('starts on step 1 when cloud is not active', async () => {
    const { result } = renderHook(() => useSetupWizard());
    await waitFor(() => expect(mockGetStatus).toHaveBeenCalled());
    expect(result.current.step).toBe(1);
  });

  it('starts on step 2 when cloud is already active', async () => {
    mockGetStatus.mockResolvedValue({ isActive: true });
    const { result } = renderHook(() => useSetupWizard());
    await waitFor(() => expect(result.current.step).toBe(2));
  });

  it('connect advances to step 2 on success', async () => {
    mockConnect.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSetupWizard());
    await waitFor(() => expect(mockGetStatus).toHaveBeenCalled());
    act(() => result.current.setTursoUrl('libsql://my-db.turso.io'));
    act(() => result.current.setAuthToken('tok123'));
    await act(() => result.current.connect());
    expect(result.current.step).toBe(2);
  });

  it('connect sets connectError on failure without advancing', async () => {
    mockConnect.mockRejectedValue(new Error('Auth failed'));
    const { result } = renderHook(() => useSetupWizard());
    await waitFor(() => expect(mockGetStatus).toHaveBeenCalled());
    act(() => result.current.setTursoUrl('libsql://my-db.turso.io'));
    act(() => result.current.setAuthToken('bad-tok'));
    await act(() => result.current.connect());
    expect(result.current.connectError).toBe('Auth failed');
    expect(result.current.step).toBe(1);
  });

  it('next advances to step 3 when business name is set', async () => {
    mockGetStatus.mockResolvedValue({ isActive: true });
    const { result } = renderHook(() => useSetupWizard());
    await waitFor(() => expect(result.current.step).toBe(2));
    act(() => result.current.setBusinessName('The Crown Pub'));
    act(() => result.current.next());
    expect(result.current.step).toBe(3);
  });

  it('next does not advance when business name is empty', async () => {
    mockGetStatus.mockResolvedValue({ isActive: true });
    const { result } = renderHook(() => useSetupWizard());
    await waitFor(() => expect(result.current.step).toBe(2));
    act(() => result.current.next());
    expect(result.current.step).toBe(2);
  });

  it('back returns from step 3 to step 2', async () => {
    mockGetStatus.mockResolvedValue({ isActive: true });
    const { result } = renderHook(() => useSetupWizard());
    await waitFor(() => expect(result.current.step).toBe(2));
    act(() => result.current.setBusinessName('The Crown Pub'));
    act(() => result.current.next());
    act(() => result.current.back());
    expect(result.current.step).toBe(2);
  });

  it('skip submits with just the one business and reloads', async () => {
    mockCompleteSetup.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setBusinessName('The Crown Pub'));
    await act(() => result.current.skip());
    expect(mockCompleteSetup).toHaveBeenCalledWith({
      groupName: 'The Crown Pub Group',
      entityNames: ['The Crown Pub'],
    });
    expect(mockReload).toHaveBeenCalled();
  });

  it('submit includes additional businesses and reloads', async () => {
    mockCompleteSetup.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setBusinessName('The Crown Pub'));
    act(() => result.current.addMore());
    act(() => result.current.setMoreName(0, 'The Garden Bar'));
    await act(() => result.current.submit());
    expect(mockCompleteSetup).toHaveBeenCalledWith({
      groupName: 'The Crown Pub Group',
      entityNames: ['The Crown Pub', 'The Garden Bar'],
    });
    expect(mockReload).toHaveBeenCalled();
  });

  it('submit filters out blank additional businesses', async () => {
    mockCompleteSetup.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setBusinessName('The Crown Pub'));
    act(() => result.current.addMore());
    act(() => result.current.addMore());
    act(() => result.current.setMoreName(0, 'The Garden Bar'));
    await act(() => result.current.submit());
    expect(mockCompleteSetup).toHaveBeenCalledWith({
      groupName: 'The Crown Pub Group',
      entityNames: ['The Crown Pub', 'The Garden Bar'],
    });
  });

  it('sets submitError on failure', async () => {
    mockCompleteSetup.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setBusinessName('The Crown Pub'));
    await act(() => result.current.skip());
    expect(result.current.submitError).toBe('Network error');
    expect(result.current.isSubmitting).toBe(false);
  });
});
