import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSetupWizard } from '.';

const mockCompleteSetup = vi.hoisted(() => vi.fn());

vi.mock('@/services/entities', () => ({
  entitiesService: {
    completeSetup: mockCompleteSetup,
  },
}));

const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { ...window.location, reload: mockReload },
  writable: true,
});

describe('useSetupWizard', () => {
  beforeEach(() => {
    mockCompleteSetup.mockReset();
    mockReload.mockReset();
  });

  it('starts on step 1', () => {
    const { result } = renderHook(() => useSetupWizard());
    expect(result.current.step).toBe(1);
  });

  it('advances to step 2 when group name is set', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setGroupName('The Crown Group'));
    act(() => result.current.next());
    expect(result.current.step).toBe(2);
  });

  it('does not advance from step 1 when group name is empty', () => {
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.next());
    expect(result.current.step).toBe(1);
  });

  it('cannot remove last entity', () => {
    const { result } = renderHook(() => useSetupWizard());
    expect(result.current.entityNames).toHaveLength(1);
    act(() => result.current.removeEntity(0));
    expect(result.current.entityNames).toHaveLength(1);
  });

  it('sets submitError when completeSetup throws', async () => {
    mockCompleteSetup.mockImplementation(async () => {
      throw new Error('Network error');
    });
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setGroupName('G'));
    act(() => result.current.setEntityName(0, 'E1'));
    await act(() => result.current.submit());
    expect(result.current.submitError).toBe('Network error');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('calls completeSetup on submit with valid data', async () => {
    mockCompleteSetup.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSetupWizard());
    act(() => result.current.setGroupName('G'));
    act(() => result.current.setEntityName(0, 'E1'));
    await act(() => result.current.submit());
    expect(mockCompleteSetup).toHaveBeenCalledWith({ groupName: 'G', entityNames: ['E1'] });
  });
});
