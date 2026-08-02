import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { enhanceScanImage } from '../../../utils/enhanceScanImage';
import { useScanFileSelection } from './index';

vi.mock('../../../utils/enhanceScanImage', () => ({
  enhanceScanImage: vi.fn(),
}));

function makeFile(type = 'image/png', name = 'invoice.png', size = 100) {
  return new File([new Uint8Array(size)], name, { type });
}

describe('useScanFileSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
  });

  it('enhances a valid image file and ends in preview with the enhanced file', async () => {
    const enhancedFile = makeFile('image/jpeg', 'invoice.jpg');
    vi.mocked(enhanceScanImage).mockResolvedValue(enhancedFile);
    const { result } = renderHook(() => useScanFileSelection());

    await act(() => result.current.handleFileSelected(makeFile()));

    expect(enhanceScanImage).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('preview');
    expect(result.current.selectedFile).toBe(enhancedFile);
  });

  it('skips enhancement for a valid PDF and ends in preview with the original file', async () => {
    const pdfFile = makeFile('application/pdf', 'invoice.pdf');
    const { result } = renderHook(() => useScanFileSelection());

    await act(() => result.current.handleFileSelected(pdfFile));

    expect(enhanceScanImage).not.toHaveBeenCalled();
    expect(result.current.status).toBe('preview');
    expect(result.current.selectedFile).toBe(pdfFile);
  });

  it('falls back to the original file when enhancement rejects, still reaching preview', async () => {
    const originalFile = makeFile();
    vi.mocked(enhanceScanImage).mockRejectedValue(new Error('decode failed'));
    const { result } = renderHook(() => useScanFileSelection());

    await act(() => result.current.handleFileSelected(originalFile));

    expect(result.current.status).toBe('preview');
    expect(result.current.selectedFile).toBe(originalFile);
  });

  it('rejects an invalid file with an error status without calling enhanceScanImage', async () => {
    const { result } = renderHook(() => useScanFileSelection());

    await act(() => result.current.handleFileSelected(makeFile('image/gif')));

    expect(result.current.status).toBe('error');
    expect(enhanceScanImage).not.toHaveBeenCalled();
  });

  it('sets status to processing before the enhancement promise resolves', async () => {
    let resolveEnhance: (file: File) => void = () => {};
    const deferred = new Promise<File>((resolve) => {
      resolveEnhance = resolve;
    });
    vi.mocked(enhanceScanImage).mockReturnValue(deferred);
    const { result } = renderHook(() => useScanFileSelection());

    act(() => {
      void result.current.handleFileSelected(makeFile());
    });

    expect(result.current.status).toBe('processing');

    resolveEnhance(makeFile('image/jpeg', 'invoice.jpg'));

    await waitFor(() => expect(result.current.status).toBe('preview'));
  });
});
