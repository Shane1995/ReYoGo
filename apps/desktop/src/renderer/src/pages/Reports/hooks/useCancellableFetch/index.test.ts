import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCancellableFetch } from '.';

describe('useCancellableFetch', () => {
  it('starts loading and calls onSuccess with the fetched result', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useCancellableFetch(() => Promise.resolve('data'), onSuccess, onError, []),
    );

    expect(result.current).toBe(true);
    await waitFor(() => expect(result.current).toBe(false));

    expect(onSuccess).toHaveBeenCalledWith('data');
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError and stops loading when the fetch rejects', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useCancellableFetch(() => Promise.reject(new Error('boom')), onSuccess, onError, []),
    );

    await waitFor(() => expect(result.current).toBe(false));

    expect(onError).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('does not call onSuccess after unmount', async () => {
    const onSuccess = vi.fn();
    let resolveFetch: (value: string) => void = () => {};
    const fetcher = () => new Promise<string>((resolve) => (resolveFetch = resolve));
    const { unmount } = renderHook(() => useCancellableFetch(fetcher, onSuccess, vi.fn(), []));

    unmount();
    resolveFetch('data');
    await Promise.resolve();

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
